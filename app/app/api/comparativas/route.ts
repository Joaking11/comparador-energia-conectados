
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
    const { cliente, consumo, titulo, notas } = body;

    // Crear o encontrar cliente
    let clienteRecord = await prisma.cliente.findFirst({
      where: { 
        OR: [
          { nombre: cliente.nombre },
          { email: cliente.email }
        ]
      }
    });

    if (!clienteRecord) {
      clienteRecord = await prisma.cliente.create({
        data: {
          nombre: cliente.nombre,
          cif: cliente.cif,
          direccion: cliente.direccion,
          telefono: cliente.telefono,
          email: cliente.email,
        }
      });
    }

    // Crear comparativa
    const comparativa = await prisma.comparativa.create({
      data: {
        clienteId: clienteRecord.id,
        consumoAnual: consumo.consumoAnual,
        potenciaContratada: consumo.potenciaContratada,
        tarifaActual: consumo.tarifaActual,
        importeActual: consumo.importeActual,
        titulo,
        notas,
      }
    });

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
        consumo.consumoAnual, 
        consumo.potenciaContratada
      );
      
      const ahorroAnual = calcularAhorro(importeCalculado, consumo.importeActual);
      const comisionGanada = calcularComision(oferta, consumo.consumoAnual, consumo.potenciaContratada);

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

    return NextResponse.json(comparativaCompleta);

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
