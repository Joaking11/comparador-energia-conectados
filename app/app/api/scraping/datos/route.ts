
import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const cups = searchParams.get('cups');
    const distribuidora = searchParams.get('distribuidora');
    const comparativaId = searchParams.get('comparativaId');
    const limit = parseInt(searchParams.get('limit') || '10');

    let whereClause: any = {
      estado_scraping: 'exitoso'
    };

    if (cups) {
      whereClause.cups = cups;
    }
    
    if (distribuidora) {
      whereClause.distribuidora = distribuidora.toUpperCase();
    }
    
    if (comparativaId) {
      whereClause.comparativaId = comparativaId;
    }

    const datosConsumo = await prisma.datos_consumo_scraping.findMany({
      where: whereClause,
      include: {
        credencial: {
          select: {
            distribuidora: true,
            usuario: true,
            ultima_conexion: true
          }
        },
        comparativas: {
          select: {
            id: true,
            titulo: true,
            fechaOferta: true
          }
        }
      },
      orderBy: {
        fecha_obtencion: 'desc'
      },
      take: limit
    });

    return NextResponse.json(datosConsumo);

  } catch (error) {
    console.error('Error obteniendo datos de consumo:', error);
    return NextResponse.json(
      { error: 'Error obteniendo datos de consumo' },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}

// Endpoint para obtener estadísticas de scraping
export async function POST(request: NextRequest) {
  try {
    const estadisticas = await prisma.datos_consumo_scraping.groupBy({
      by: ['distribuidora', 'estado_scraping'],
      _count: {
        id: true
      }
    });

    const resumen = await prisma.datos_consumo_scraping.aggregate({
      _count: {
        id: true
      },
      _avg: {
        consumoTotal: true,
        potenciaMaxima: true
      },
      _max: {
        fecha_obtencion: true
      }
    });

    return NextResponse.json({
      estadisticas,
      resumen: {
        totalScrapings: resumen._count.id,
        consumoPromedio: resumen._avg.consumoTotal,
        potenciaPromedio: resumen._avg.potenciaMaxima,
        ultimoScraping: resumen._max.fecha_obtencion
      }
    });

  } catch (error) {
    console.error('Error obteniendo estadísticas:', error);
    return NextResponse.json(
      { error: 'Error obteniendo estadísticas' },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}
