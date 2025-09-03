
import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

export const dynamic = 'force-dynamic';

const prisma = new PrismaClient();

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const comercializadoraId = searchParams.get('comercializadora');
    const tipo = searchParams.get('tipo');

    let whereClause: any = { activa: true };
    
    if (comercializadoraId) {
      whereClause.comercializadoraId = comercializadoraId;
    }
    
    if (tipo) {
      whereClause.tipo = tipo;
    }

    const ofertas = await prisma.oferta.findMany({
      where: whereClause,
      include: {
        comercializadora: true
      },
      orderBy: [
        { comercializadora: { nombre: 'asc' } },
        { precioEnergia: 'asc' }
      ]
    });

    return NextResponse.json(ofertas);

  } catch (error) {
    console.error('Error fetching ofertas:', error);
    return NextResponse.json(
      { error: 'Error fetching ofertas' },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}
