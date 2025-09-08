
import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

export const dynamic = 'force-dynamic';

const prisma = new PrismaClient();

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const comparativa = await prisma.comparativas.findUnique({
      where: { id: params.id },
      include: {
        cliente: true,
        ofertas: {
          include: {
            tarifa: {
              include: {
                comercializadora: true
              }
            }
          },
          orderBy: { ahorroAnual: 'desc' }
        }
      }
    });

    if (!comparativa) {
      return NextResponse.json(
        { error: 'Comparativa not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(comparativa);

  } catch (error) {
    console.error('Error fetching comparativa:', error);
    return NextResponse.json(
      { error: 'Error fetching comparativa' },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    // Eliminar comparativa (cascade eliminará las ofertas relacionadas)
    await prisma.comparativas.delete({
      where: { id: params.id }
    });

    return NextResponse.json({ success: true });

  } catch (error) {
    console.error('Error deleting comparativa:', error);
    return NextResponse.json(
      { error: 'Error deleting comparativa' },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}
