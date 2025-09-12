
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

    const comisiones = await prisma.comisiones_comercializadora.findMany({
      where: { 
        perfilComisionId,
        activo: true 
      },
      include: {
        comercializadora: {
          select: {
            id: true,
            nombre: true,
            color: true,
            logoUrl: true
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    return NextResponse.json({ comisiones });
  } catch (error) {
    console.error('Error fetching comercializadora commissions:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const { perfilComisionId, comercializadoraId, porcentaje } = await request.json();

    if (!perfilComisionId || !comercializadoraId) {
      return NextResponse.json(
        { error: 'perfilComisionId y comercializadoraId son requeridos' },
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

    // Verificar que la comercializadora existe
    const comercializadora = await prisma.comercializadoras.findUnique({
      where: { id: comercializadoraId }
    });

    if (!comercializadora) {
      return NextResponse.json(
        { error: 'Comercializadora no encontrada' },
        { status: 404 }
      );
    }

    // Crear o actualizar comisión
    const comision = await prisma.comisiones_comercializadora.upsert({
      where: {
        perfilComisionId_comercializadoraId: {
          perfilComisionId,
          comercializadoraId
        }
      },
      update: {
        porcentaje,
        activo: true
      },
      create: {
        perfilComisionId,
        comercializadoraId,
        porcentaje,
        activo: true
      },
      include: {
        comercializadora: {
          select: {
            id: true,
            nombre: true,
            color: true,
            logoUrl: true
          }
        }
      }
    });

    return NextResponse.json({
      success: true,
      comision
    }, { status: 201 });

  } catch (error) {
    console.error('Error creating comercializadora commission:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { perfilComisionId, comercializadoraId } = await request.json();

    if (!perfilComisionId || !comercializadoraId) {
      return NextResponse.json(
        { error: 'perfilComisionId y comercializadoraId son requeridos' },
        { status: 400 }
      );
    }

    await prisma.comisiones_comercializadora.delete({
      where: {
        perfilComisionId_comercializadoraId: {
          perfilComisionId,
          comercializadoraId
        }
      }
    });

    return NextResponse.json({
      success: true,
      message: 'Comisión eliminada correctamente'
    });

  } catch (error) {
    console.error('Error deleting comercializadora commission:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}
