
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    const comparativa = await prisma.comparativa_simple.findUnique({
      where: { 
        id: params.id,
        usuarioId: (session.user as any).id  // Verificar que pertenece al usuario
      },
      include: {
        resultados: {
          include: {
            comercializadora: true
          },
          orderBy: {
            ahorro: 'desc'  // Ordenar por mayor ahorro
          }
        }
      }
    });

    if (!comparativa) {
      return NextResponse.json(
        { error: 'Comparativa no encontrada' },
        { status: 404 }
      );
    }

    return NextResponse.json(comparativa);
    
  } catch (error) {
    console.error('Error en GET /api/comparativas/[id]:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    const comparativa = await prisma.comparativa_simple.findUnique({
      where: { 
        id: params.id,
        usuarioId: (session.user as any).id
      }
    });

    if (!comparativa) {
      return NextResponse.json(
        { error: 'Comparativa no encontrada' },
        { status: 404 }
      );
    }

    // Eliminar resultados primero (por las relaciones)
    await prisma.resultado_comparativa_simple.deleteMany({
      where: { comparativaId: params.id }
    });

    // Eliminar la comparativa
    await prisma.comparativa_simple.delete({
      where: { id: params.id }
    });

    return NextResponse.json({ success: true });
    
  } catch (error) {
    console.error('Error en DELETE /api/comparativas/[id]:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}
