
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const ventaId = params.id;
    const { estadoVenta, observaciones } = await request.json();

    if (!estadoVenta || !['pendiente', 'confirmada', 'cancelada'].includes(estadoVenta)) {
      return NextResponse.json(
        { error: 'Estado de venta no válido' },
        { status: 400 }
      );
    }

    const venta = await prisma.ventas.update({
      where: { id: ventaId },
      data: {
        estadoVenta,
        observaciones
      },
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
      venta
    });

  } catch (error) {
    console.error('Error updating sale:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}
