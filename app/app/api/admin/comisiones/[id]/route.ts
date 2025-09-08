
import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
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

    const updateData: any = {
      comercializadoraId,
      nombreOferta: nombreOferta || 'Comisión General',
      tarifa: tarifa || '2.0TD',
      zona: zona,
      tipoOferta: tipoOferta || 'Fijo',
      rango: rango || 'E',
      rangoDesde: rangoDesde ? parseFloat(rangoDesde) : 0,
      rangoHasta: rangoHasta ? parseFloat(rangoHasta) : null,
      comision: comisionEnergia ? parseFloat(comisionEnergia) : 0,
      tieneFee: Boolean(comisionFija && parseFloat(comisionFija) > 0),
      porcentajeFeeEnergia: comisionEnergia ? parseFloat(comisionEnergia) : null,
      porcentajeFeePotencia: comisionPotencia ? parseFloat(comisionPotencia) : null
    };

    const comisionActualizada = await prisma.comisiones.update({
      where: { id },
      data: updateData,
      include: {
        comercializadoras: true
      }
    });

    return NextResponse.json(comisionActualizada);
  } catch (error) {
    console.error('Error actualizando comisión:', error);
    return NextResponse.json(
      { error: 'Error actualizando comisión', details: error instanceof Error ? error.message : 'Error desconocido' },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;

    await prisma.comisiones.delete({
      where: { id }
    });

    return NextResponse.json({ success: true, message: 'Comisión eliminada correctamente' });
  } catch (error) {
    console.error('Error eliminando comisión:', error);
    return NextResponse.json(
      { error: 'Error eliminando comisión', details: error instanceof Error ? error.message : 'Error desconocido' },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}
