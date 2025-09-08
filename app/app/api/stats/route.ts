
import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

export const dynamic = 'force-dynamic';

const prisma = new PrismaClient();

export async function GET() {
  try {
    // Obtener estadísticas básicas
    const [
      totalComparativos,
      totalComercializadoras, 
      totalOfertas,
      comparativas
    ] = await Promise.all([
      prisma.comparativas.count(),
      prisma.comercializadoras.count({ where: { activa: true } }),
      prisma.tarifas.count({ where: { activa: true } }),
      prisma.comparativas.findMany({
        include: {
          comparativa_ofertas: true
        }
      })
    ]);

    // Calcular ahorro promedio
    let ahorroPromedio = 0;
    if (comparativas.length > 0) {
      const totalAhorro = comparativas.reduce((sum: number, comp: any) => {
        const maxAhorro = Math.max(...comp.ofertas.map((o: any) => o.ahorroAnual), 0);
        return sum + maxAhorro;
      }, 0);
      ahorroPromedio = totalAhorro / comparativas.length;
    }

    return NextResponse.json({
      totalComparativos,
      totalComercializadoras,
      totalOfertas,
      ahorroPromedio: ahorroPromedio || 0
    });

  } catch (error) {
    console.error('Error fetching stats:', error);
    return NextResponse.json(
      { error: 'Error fetching statistics' },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}
