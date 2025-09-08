
import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const comercializadoraId = searchParams.get('comercializadora');
    const tarifa = searchParams.get('tarifa');
    const zona = searchParams.get('zona');

    let whereClause: any = {};
    
    if (comercializadoraId) {
      whereClause.comercializadoraId = comercializadoraId;
    }
    
    if (tarifa) {
      whereClause.tarifa = tarifa;
    }
    
    if (zona) {
      whereClause.zona = zona;
    }

    const comisiones = await prisma.comisiones.findMany({
      where: whereClause,
      include: {
        comercializadoras: true
      },
      orderBy: [
        { comercializadoras: { nombre: 'asc' } },
        { tarifa: 'asc' },
        { zona: 'asc' }
      ]
    });

    return NextResponse.json(comisiones);
  } catch (error) {
    console.error('Error obteniendo comisiones:', error);
    return NextResponse.json(
      { error: 'Error obteniendo comisiones' },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      comercializadoraId,
      nombreOferta,
      tarifa,
      zona,
      tipoOferta,
      rango,
      rangoDesde,
      rangoHasta,
      comisionEnergia,
      comisionPotencia,
      comisionFija
    } = body;

    if (!comercializadoraId || !tarifa) {
      return NextResponse.json(
        { error: 'Comercializadora y tarifa son requeridos' },
        { status: 400 }
      );
    }

    const nuevaComision = await prisma.comisiones.create({
      data: {
        comercializadoraId,
        nombreOferta: nombreOferta || 'Comisión General',
        tarifa: tarifa || '2.0TD',
        zona: zona || 'PENINSULA',
        tipoOferta: tipoOferta || 'Fijo',
        rango: rango || 'E',
        rangoDesde: rangoDesde ? parseFloat(rangoDesde) : 0,
        rangoHasta: rangoHasta ? parseFloat(rangoHasta) : null,
        comision: comisionEnergia ? parseFloat(comisionEnergia) : 0,
        tieneFee: Boolean(comisionFija && parseFloat(comisionFija) > 0),
        porcentajeFeeEnergia: comisionEnergia ? parseFloat(comisionEnergia) : null,
        porcentajeFeePotencia: comisionPotencia ? parseFloat(comisionPotencia) : null
      },
      include: {
        comercializadoras: true
      }
    });

    return NextResponse.json(nuevaComision);
  } catch (error) {
    console.error('Error creando comisión:', error);
    return NextResponse.json(
      { error: 'Error creando comisión', details: error instanceof Error ? error.message : 'Error desconocido' },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}
