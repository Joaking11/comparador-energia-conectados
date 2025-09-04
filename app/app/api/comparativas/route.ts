
import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { calcularImporteAnual, calcularAhorro, calcularComision } from '@/lib/calculations';

export const dynamic = 'force-dynamic';

const prisma = new PrismaClient();

export async function GET() {
  try {
    const comparativas = await prisma.comparativa.findMany({
      include: {
        cliente: true,
        ofertas: {
          include: {
            oferta: {
              include: {
                comercializadora: true
              }
            }
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    return NextResponse.json(comparativas);

  } catch (error) {
    console.error('Error fetching comparativas:', error);
    return NextResponse.json(
      { error: 'Error fetching comparativas' },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    console.log('Datos recibidos en API:', JSON.stringify(body, null, 2));
    const { cliente, comparativa: datosComparativa } = body;

    // Crear o encontrar cliente
    let clienteRecord = await prisma.cliente.findFirst({
      where: { 
        OR: [
          { razonSocial: cliente.razonSocial },
          { email: cliente.email },
          { cif: cliente.cif }
        ]
      }
    });

    if (!clienteRecord) {
      clienteRecord = await prisma.cliente.create({
        data: {
          razonSocial: cliente.razonSocial,
          cif: cliente.cif || undefined,
          direccion: cliente.direccion || undefined,
          localidad: cliente.localidad || undefined,
          provincia: cliente.provincia || undefined,
          codigoPostal: cliente.codigoPostal || undefined,
          nombreFirmante: cliente.nombreFirmante || undefined,
          nifFirmante: cliente.nifFirmante || undefined,
          telefono: cliente.telefono || undefined,
          email: cliente.email || undefined,
        }
      });
    }

    console.log('Cliente encontrado/creado:', clienteRecord);

    // Validar campos requeridos
    if (!datosComparativa.consumoAnualElectricidad || datosComparativa.consumoAnualElectricidad <= 0) {
      throw new Error('Consumo anual de electricidad es requerido');
    }
    if (!datosComparativa.potenciaP1 || datosComparativa.potenciaP1 <= 0) {
      throw new Error('Potencia P1 es requerida');
    }
    if (!datosComparativa.totalFacturaElectricidad || datosComparativa.totalFacturaElectricidad <= 0) {
      throw new Error('Total de factura de electricidad es requerido');
    }

    // Crear comparativa con todos los campos
    console.log('Creando comparativa con datos:', datosComparativa);
    
    let comparativa;
    try {
      comparativa = await prisma.comparativa.create({
      data: {
        clienteId: clienteRecord.id,
        titulo: datosComparativa.titulo || undefined,
        
        // Periodo de Facturación
        fechaInicialFactura: datosComparativa.fechaInicialFactura ? new Date(datosComparativa.fechaInicialFactura) : undefined,
        fechaFinalFactura: datosComparativa.fechaFinalFactura ? new Date(datosComparativa.fechaFinalFactura) : undefined,
        diasPeriodoFactura: datosComparativa.diasPeriodoFactura || 30,
        
        // Electricidad
        contrataElectricidad: datosComparativa.contrataElectricidad,
        multipuntoElectricidad: datosComparativa.multipuntoElectricidad,
        tarifaAccesoElectricidad: datosComparativa.tarifaAccesoElectricidad,
        cupsElectricidad: datosComparativa.cupsElectricidad || undefined,
        consumoAnualElectricidad: datosComparativa.consumoAnualElectricidad,
        duracionContratoElectricidad: datosComparativa.duracionContratoElectricidad,
        comercializadoraActual: datosComparativa.comercializadoraActual || 'No especificada',
        ahorroMinimo: datosComparativa.ahorroMinimo,
        distribuidoraElectrica: datosComparativa.distribuidoraElectrica || undefined,
        
        // Gas
        contrataGas: datosComparativa.contrataGas,
        multipuntoGas: datosComparativa.multipuntoGas,
        tarifaAccesoGas: datosComparativa.tarifaAccesoGas || undefined,
        cupsGas: datosComparativa.cupsGas || undefined,
        consumoAnualGas: datosComparativa.consumoAnualGas || undefined,
        duracionContratoGas: datosComparativa.duracionContratoGas || undefined,
        
        // FEE
        feeEnergia: datosComparativa.feeEnergia || 0,
        feeEnergiaMinimo: datosComparativa.feeEnergiaMinimo || undefined,
        feeEnergiaMaximo: datosComparativa.feeEnergiaMaximo || undefined,
        feePotencia: datosComparativa.feePotencia || 0,
        feePotenciaMinimo: datosComparativa.feePotenciaMinimo || undefined,
        feePotenciaMaximo: datosComparativa.feePotenciaMaximo || undefined,
        energiaFijo: datosComparativa.energiaFijo,
        potenciaFijo: datosComparativa.potenciaFijo,
        
        // Potencias
        potenciaP1: datosComparativa.potenciaP1 || 1.0, // Default mínimo si no se especifica
        potenciaP2: datosComparativa.potenciaP2 || undefined,
        potenciaP3: datosComparativa.potenciaP3 || undefined,
        potenciaP4: datosComparativa.potenciaP4 || undefined,
        potenciaP5: datosComparativa.potenciaP5 || undefined,
        potenciaP6: datosComparativa.potenciaP6 || undefined,
        
        // Consumos
        consumoP1: datosComparativa.consumoP1 || datosComparativa.consumoAnualElectricidad || 1000, // Default o total
        consumoP2: datosComparativa.consumoP2 || undefined,
        consumoP3: datosComparativa.consumoP3 || undefined,
        consumoP4: datosComparativa.consumoP4 || undefined,
        consumoP5: datosComparativa.consumoP5 || undefined,
        consumoP6: datosComparativa.consumoP6 || undefined,
        
        // Factura Electricidad
        terminoFijoElectricidad: datosComparativa.terminoFijoElectricidad,
        terminoVariableElectricidad: datosComparativa.terminoVariableElectricidad,
        excesoPotencia: datosComparativa.excesoPotencia || 0,
        impuestoElectricidad: datosComparativa.impuestoElectricidad,
        ivaElectricidad: datosComparativa.ivaElectricidad,
        totalFacturaElectricidad: datosComparativa.totalFacturaElectricidad,
        
        // Factura Gas
        terminoFijoGas: datosComparativa.terminoFijoGas || undefined,
        terminoVariableGas: datosComparativa.terminoVariableGas || undefined,
        impuestoGas: datosComparativa.impuestoGas || undefined,
        ivaGas: datosComparativa.ivaGas || undefined,
        totalFacturaGas: datosComparativa.totalFacturaGas || undefined,
        
        notas: datosComparativa.notas || undefined,
      }
    });
    console.log('Comparativa creada exitosamente:', comparativa);
    
    } catch (error) {
      console.error('Error específico creando comparativa:', error);
      const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
      throw new Error(`Error creando comparativa: ${errorMessage}`);
    }

    // Obtener todas las ofertas activas
    const ofertas = await prisma.oferta.findMany({
      where: { activa: true },
      include: {
        comercializadora: true
      }
    });

    // Procesar cada oferta y calcular resultados
    const comparativaOfertas = [];
    
    for (const oferta of ofertas) {
      const importeCalculado = calcularImporteAnual(
        oferta, 
        datosComparativa.consumoAnualElectricidad, 
        datosComparativa.potenciaP1 // Usar potencia P1 como principal
      );
      
      const ahorroAnual = calcularAhorro(importeCalculado, datosComparativa.totalFacturaElectricidad);
      const comisionGanada = calcularComision(oferta, datosComparativa.consumoAnualElectricidad, datosComparativa.potenciaP1);

      // Solo incluir si hay ahorro o comisión
      if (ahorroAnual >= 0 || comisionGanada > 0) {
        const comparativaOferta = await prisma.comparativaOferta.create({
          data: {
            comparativaId: comparativa.id,
            ofertaId: oferta.id,
            importeCalculado,
            ahorroAnual,
            comisionGanada,
          }
        });
        
        comparativaOfertas.push(comparativaOferta);
      }
    }

    // Devolver la comparativa completa con resultados
    const comparativaCompleta = await prisma.comparativa.findUnique({
      where: { id: comparativa.id },
      include: {
        cliente: true,
        ofertas: {
          include: {
            oferta: {
              include: {
                comercializadora: true
              }
            }
          },
          orderBy: { ahorroAnual: 'desc' }
        }
      }
    });

    return NextResponse.json({ comparativa: comparativaCompleta });

  } catch (error) {
    console.error('Error creating comparativa:', error);
    return NextResponse.json(
      { error: 'Error creating comparativa' },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}
