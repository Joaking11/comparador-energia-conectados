
import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

export const dynamic = 'force-dynamic';

const prisma = new PrismaClient();

export async function GET() {
  try {
    const comercializadoras = await prisma.comercializadora.findMany({
      where: { activa: true },
      include: {
        ofertas: {
          where: { activa: true }
        }
      },
      orderBy: { nombre: 'asc' }
    });

    return NextResponse.json(comercializadoras);

  } catch (error) {
    console.error('Error fetching comercializadoras:', error);
    return NextResponse.json(
      { error: 'Error fetching comercializadoras' },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}
