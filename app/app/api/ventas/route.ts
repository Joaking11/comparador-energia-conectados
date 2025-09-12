
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { ComissionCalculator } from '@/lib/commission-calculator';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const usuarioId = searchParams.get('usuarioId');
    const estadoVenta = searchParams.get('estadoVenta');
    const fechaDesde = searchParams.get('fechaDesde') ? new Date(searchParams.get('fechaDesde')!) : undefined;
    const fechaHasta = searchParams.get('fechaHasta') ? new Date(searchParams.get('fechaHasta')!) : undefined;

    const skip = (page - 1) * limit;

    const where: any = {};
    
    if (usuarioId) {
      where.usuarioId = usuarioId;
    }

    if (estadoVenta) {
      where.estadoVenta = estadoVenta;
    }

    if (fechaDesde || fechaHasta) {
      where.fechaVenta = {};
      if (fechaDesde) where.fechaVenta.gte = fechaDesde;
      if (fechaHasta) where.fechaVenta.lte = fechaHasta;
    }

    const [ventas, total] = await Promise.all([
      prisma.ventas.findMany({
        where,
        skip,
        take: limit,
        include: {
          usuario: {
            select: {
              id: true,
              name: true,
              email: true,
              tipoUsuario: true
            }
          },
          comparativa: {
            include: {
              clientes: true
            }
          },
          tarifaSeleccionada: {
            include: {
              comercializadoras: true
            }
          },
          comisiones_detalle: {
            include: {
              usuario: {
                select: {
                  id: true,
                  name: true,
                  email: true
                }
              }
            }
          }
        },
        orderBy: { fechaVenta: 'desc' }
      }),
      prisma.ventas.count({ where })
    ]);

    return NextResponse.json({
      ventas,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Error fetching sales:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const { comparativaId, usuarioId, clienteId, tarifaSeleccionadaId } = await request.json();

    if (!comparativaId || !usuarioId || !clienteId || !tarifaSeleccionadaId) {
      return NextResponse.json(
        { error: 'Faltan parámetros requeridos' },
        { status: 400 }
      );
    }

    // Verificar que no existe una venta para esta comparativa
    const existingVenta = await prisma.ventas.findUnique({
      where: { comparativaId }
    });

    if (existingVenta) {
      return NextResponse.json(
        { error: 'Ya existe una venta registrada para esta comparativa' },
        { status: 400 }
      );
    }

    const venta = await ComissionCalculator.registerSale(
      comparativaId,
      usuarioId,
      clienteId,
      tarifaSeleccionadaId
    );

    const ventaCompleta = await prisma.ventas.findUnique({
      where: { id: venta.id },
      include: {
        usuario: {
          select: {
            id: true,
            name: true,
            email: true,
            tipoUsuario: true
          }
        },
        comparativa: {
          include: {
            clientes: true
          }
        },
        tarifaSeleccionada: {
          include: {
            comercializadoras: true
          }
        },
        comisiones_detalle: {
          include: {
            usuario: {
              select: {
                id: true,
                name: true,
                email: true
              }
            }
          }
        }
      }
    });

    return NextResponse.json({
      success: true,
      venta: ventaCompleta
    }, { status: 201 });

  } catch (error) {
    console.error('Error registering sale:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Error interno del servidor' },
      { status: 500 }
    );
  }
}
