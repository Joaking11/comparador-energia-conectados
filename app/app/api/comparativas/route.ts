
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export async function POST(request: NextRequest) {
  try {
    console.log('=== INICIO CÁLCULO COMPARATIVA ===');
    
    // Verificar autenticación - modo desarrollo con fallback a usuario demo
    const session = await getServerSession(authOptions);
    let usuarioId = (session?.user as any)?.id;
    
    if (!usuarioId) {
      // Buscar usuario demo como fallback
      const usuarioDemo = await prisma.users.findUnique({
        where: { email: 'demo@example.com' }
      });
      usuarioId = usuarioDemo?.id;
    }
    
    if (!usuarioId) {
      console.error('Usuario no autenticado');
      return NextResponse.json(
        { error: 'No autorizado' },
        { status: 401 }
      );
    }

    const body = await request.json();
    console.log('Datos recibidos:', JSON.stringify(body, null, 2));

    // Validar datos requeridos
    const { cliente, consumo, titulo, notas } = body;
    
    if (!cliente?.nombre || !consumo?.consumoAnual || !consumo?.potenciaContratada) {
      console.error('Datos insuficientes:', { cliente, consumo });
      return NextResponse.json(
        { error: 'Datos insuficientes: se requieren nombre del cliente, consumo anual y potencia contratada' },
        { status: 400 }
      );
    }

    // Crear la comparativa en la base de datos
    const nuevaComparativa = await prisma.comparativa_simple.create({
      data: {
        titulo: titulo || `Comparativa ${cliente.nombre}`,
        clienteNombre: cliente.nombre,
        clienteCif: cliente.cif || '',
        clienteDireccion: cliente.direccion || '',
        clienteTelefono: cliente.telefono || '',
        clienteEmail: cliente.email || '',
        consumoAnual: Number(consumo.consumoAnual),
        potenciaContratada: Number(consumo.potenciaContratada),
        tarifaActual: consumo.tarifaActual || 'No especificada',
        importeActual: Number(consumo.importeActual) || 0,
        notas: notas || '',
        usuarioId: usuarioId,
        fechaCreacion: new Date(),
        estado: 'CALCULANDO'
      }
    });

    console.log('Comparativa creada en BD:', nuevaComparativa.id);

    // Obtener todas las tarifas activas para el cálculo
    const tarifas = await prisma.tarifas.findMany({
      where: { 
        activa: true 
      },
      include: {
        comercializadoras: true
      }
    });

    console.log(`Encontradas ${tarifas.length} tarifas activas`);

    if (tarifas.length === 0) {
      await prisma.comparativa_simple.update({
        where: { id: nuevaComparativa.id },
        data: { estado: 'ERROR' }
      });
      
      return NextResponse.json(
        { error: 'No hay tarifas activas disponibles para calcular' },
        { status: 400 }
      );
    }

    // Calcular cada tarifa
    const resultados = [];
    const consumoMensual = nuevaComparativa.consumoAnual / 12;
    const potencia = nuevaComparativa.potenciaContratada;

    for (const tarifa of tarifas) {
      try {        
        // Cálculo básico usando los precios de la tarifa
        const costeFijoMensual = (tarifa.potenciaP1 || 0) * potencia;
        const costeVariableMensual = (tarifa.energiaP1 || 0) * consumoMensual;
        const costeTotal = (costeFijoMensual + costeVariableMensual) * 12;

        const ahorro = nuevaComparativa.importeActual - costeTotal;
        const porcentajeAhorro = nuevaComparativa.importeActual > 0 
          ? (ahorro / nuevaComparativa.importeActual) * 100 
          : 0;

        const resultado = await prisma.resultado_comparativa_simple.create({
          data: {
            comparativaId: nuevaComparativa.id,
            ofertaId: null, // No hay ofertas separadas, solo tarifas
            comercializadoraId: tarifa.comercializadoraId,
            costeAnual: costeTotal,
            ahorro: ahorro,
            porcentajeAhorro: porcentajeAhorro,
            detalleCalculo: JSON.stringify({
              costeFijoMensual,
              costeVariableMensual,
              energiaP1: tarifa.energiaP1,
              potenciaP1: tarifa.potenciaP1,
              consumoMensual,
              potencia,
              nombreOferta: tarifa.nombreOferta
            })
          }
        });

        resultados.push(resultado);
        console.log(`Calculado resultado para ${tarifa.comercializadoras.nombre} - ${tarifa.nombreOferta}`);
        
      } catch (error) {
        console.error(`Error calculando tarifa ${tarifa.id}:`, error);
        continue;
      }
    }

    // Actualizar estado de la comparativa
    await prisma.comparativa_simple.update({
      where: { id: nuevaComparativa.id },
      data: { 
        estado: resultados.length > 0 ? 'COMPLETADA' : 'ERROR',
        fechaActualizacion: new Date()
      }
    });

    if (resultados.length === 0) {
      return NextResponse.json(
        { error: 'No se pudieron calcular resultados para ninguna oferta' },
        { status: 500 }
      );
    }

    console.log(`=== COMPARATIVA COMPLETADA: ${resultados.length} resultados ===`);

    return NextResponse.json({
      success: true,
      id: nuevaComparativa.id,
      resultados: resultados.length,
      message: 'Comparativa creada exitosamente'
    });

  } catch (error) {
    console.error('Error en POST /api/comparativas:', error);
    
    return NextResponse.json(
      { 
        error: 'Error interno del servidor',
        details: error instanceof Error ? error.message : 'Error desconocido'
      },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    
    // Modo desarrollo: usar usuario demo si no hay sesión
    let usuarioId = (session?.user as any)?.id;
    
    if (!usuarioId) {
      // Buscar usuario demo como fallback
      const usuarioDemo = await prisma.users.findUnique({
        where: { email: 'demo@example.com' }
      });
      usuarioId = usuarioDemo?.id;
    }
    
    if (!usuarioId) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    const comparativas = await prisma.comparativa_simple.findMany({
      where: { usuarioId },
      orderBy: { fechaCreacion: 'desc' },
      include: {
        resultados: {
          include: {
            comercializadora: true
          }
        }
      }
    });

    return NextResponse.json(comparativas);
    
  } catch (error) {
    console.error('Error en GET /api/comparativas:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}
