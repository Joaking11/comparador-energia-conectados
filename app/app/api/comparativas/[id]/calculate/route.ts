
import { NextResponse } from 'next/server';
import { CalculationEngine } from '@/lib/calculation-engine';

export const dynamic = 'force-dynamic';

export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    console.log('🔢 Iniciando recálculo para comparativa:', params.id);

    // Validar que el ID existe
    if (!params.id) {
      console.log('❌ Error: ID de comparativa faltante');
      return NextResponse.json(
        { 
          error: 'ID de comparativa requerido',
          details: 'No se proporcionó el ID de la comparativa'
        },
        { status: 400 }
      );
    }

    // Verificar que la comparativa existe en la BD
    const { prisma } = await import('@/lib/db');
    const comparativa = await prisma.comparativas.findUnique({
      where: { id: params.id }
    });

    if (!comparativa) {
      console.log('❌ Error: Comparativa no encontrada:', params.id);
      return NextResponse.json(
        { 
          error: 'Comparativa no encontrada',
          details: `No existe una comparativa con ID: ${params.id}`
        },
        { status: 404 }
      );
    }

    console.log('✅ Comparativa encontrada:', {
      id: comparativa.id,
      titulo: comparativa.titulo,
      consumoAnual: comparativa.consumoAnualElectricidad,
      tarifa: comparativa.tarifaAccesoElectricidad
    });

    // Validar datos críticos
    if (!comparativa.consumoAnualElectricidad || comparativa.consumoAnualElectricidad <= 0) {
      console.log('❌ Error: Consumo anual inválido');
      return NextResponse.json(
        { 
          error: 'Datos de comparativa incompletos',
          details: 'El consumo anual de electricidad es requerido y debe ser mayor a 0'
        },
        { status: 400 }
      );
    }

    if (!comparativa.tarifaAccesoElectricidad) {
      console.log('❌ Error: Tarifa de acceso faltante');
      return NextResponse.json(
        { 
          error: 'Datos de comparativa incompletos',
          details: 'La tarifa de acceso eléctrico es requerida'
        },
        { status: 400 }
      );
    }

    // Leer parámetros de personalización del body si están disponibles
    const body = await request.json().catch(() => ({}));
    const parametrosPersonalizados = body.parametros;

    if (parametrosPersonalizados) {
      console.log('📝 Aplicando parámetros personalizados:', parametrosPersonalizados);
    }

    // Ejecutar el motor de cálculo real con parámetros personalizados
    console.log('⚙️ Iniciando motor de cálculo...');
    const results = await CalculationEngine.calculateAndSave(params.id, parametrosPersonalizados);

    console.log(`✅ Recálculo completado: ${results.length} ofertas procesadas`);

    if (results.length === 0) {
      console.log('⚠️ Advertencia: No se encontraron ofertas aplicables');
      return NextResponse.json({
        success: true,
        message: 'Cálculo completado, pero no se encontraron ofertas aplicables',
        resultados: 0,
        ofertas: [],
        warning: 'No hay tarifas que coincidan con los criterios de la comparativa'
      });
    }

    return NextResponse.json({ 
      success: true,
      message: `Recálculo completado exitosamente`,
      resultados: results.length,
      ofertas: results
    });

  } catch (error) {
    console.error('❌ Error detallado en recálculo:', {
      message: error instanceof Error ? error.message : 'Error desconocido',
      stack: error instanceof Error ? error.stack : undefined,
      comparativaId: params.id
    });
    
    // Errores específicos de Prisma
    if (error instanceof Error && error.message.includes('prisma')) {
      return NextResponse.json(
        { 
          error: 'Error de base de datos',
          details: 'Problema conectando con la base de datos. Verifique la conexión.',
          technical: error.message
        },
        { status: 503 }
      );
    }

    // Errores de cálculo específicos
    if (error instanceof Error && error.message.includes('calculateOffers')) {
      return NextResponse.json(
        { 
          error: 'Error en cálculo de ofertas',
          details: 'Problema procesando las tarifas disponibles',
          technical: error.message
        },
        { status: 422 }
      );
    }
    
    return NextResponse.json(
      { 
        error: 'Error procesando recálculo',
        details: error instanceof Error ? error.message : 'Error interno del servidor',
        comparativaId: params.id
      },
      { status: 500 }
    );
  }
}
