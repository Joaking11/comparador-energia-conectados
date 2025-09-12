
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const perfilComisionId = searchParams.get('perfilComisionId');

    if (!perfilComisionId) {
      return NextResponse.json(
        { error: 'perfilComisionId es requerido' },
        { status: 400 }
      );
    }

    const comisiones = await prisma.comisiones_tarifa.findMany({
      where: { 
        perfilComisionId,
        activo: true 
      },
      orderBy: { tarifaAcceso: 'asc' }
    });

    return NextResponse.json({ comisiones });
  } catch (error) {
    console.error('Error fetching tarifa commissions:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const { perfilComisionId, tarifaAcceso, porcentaje } = await request.json();

    if (!perfilComisionId || !tarifaAcceso) {
      return NextResponse.json(
        { error: 'perfilComisionId y tarifaAcceso son requeridos' },
        { status: 400 }
      );
    }

    if (porcentaje === undefined || porcentaje < 0 || porcentaje > 100) {
      return NextResponse.json(
        { error: 'Porcentaje debe estar entre 0 y 100' },
        { status: 400 }
      );
    }

    // Verificar que el perfil existe
    const perfil = await prisma.perfiles_comision.findUnique({
      where: { id: perfilComisionId }
    });

    if (!perfil) {
      return NextResponse.json(
        { error: 'Perfil de comisión no encontrado' },
        { status: 404 }
      );
    }

    // Crear o actualizar comisión
    const comision = await prisma.comisiones_tarifa.upsert({
      where: {
        perfilComisionId_tarifaAcceso: {
          perfilComisionId,
          tarifaAcceso
        }
      },
      update: {
        porcentaje,
        activo: true
      },
      create: {
        perfilComisionId,
        tarifaAcceso,
        porcentaje,
        activo: true
      }
    });

    return NextResponse.json({
      success: true,
      comision
    }, { status: 201 });

  } catch (error) {
    console.error('Error creating tarifa commission:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { perfilComisionId, tarifaAcceso } = await request.json();

    if (!perfilComisionId || !tarifaAcceso) {
      return NextResponse.json(
        { error: 'perfilComisionId y tarifaAcceso son requeridos' },
        { status: 400 }
      );
    }

    await prisma.comisiones_tarifa.delete({
      where: {
        perfilComisionId_tarifaAcceso: {
          perfilComisionId,
          tarifaAcceso
        }
      }
    });

    return NextResponse.json({
      success: true,
      message: 'Comisión eliminada correctamente'
    });

  } catch (error) {
    console.error('Error deleting tarifa commission:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}
