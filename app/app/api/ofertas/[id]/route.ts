
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
      tipoOferta,
      zona,
      energiaP1,
      energiaP2,
      energiaP3,
      energiaP4,
      energiaP5,
      energiaP6,
      potenciaP1,
      potenciaP2,
      potenciaP3,
      potenciaP4,
      potenciaP5,
      potenciaP6,
      tieneFee,
      feeEnergia,
      feePotencia,
      feeEnergiaMinimo,
      feeEnergiaMaximo,
      feePotenciaMinimo,
      feePotenciaMaximo,
      costeGestion,
      activa
    } = body;

    const updateData: any = {
      comercializadoraId,
      nombreOferta,
      tarifa: tarifa || '2.0TD',
      tipoOferta: tipoOferta || 'Fijo',
      zona: zona || 'Peninsula',
      energiaP1: parseFloat(energiaP1) || 0,
      energiaP2: energiaP2 ? parseFloat(energiaP2) : null,
      energiaP3: energiaP3 ? parseFloat(energiaP3) : null,
      energiaP4: energiaP4 ? parseFloat(energiaP4) : null,
      energiaP5: energiaP5 ? parseFloat(energiaP5) : null,
      energiaP6: energiaP6 ? parseFloat(energiaP6) : null,
      potenciaP1: potenciaP1 ? parseFloat(potenciaP1) : null,
      potenciaP2: potenciaP2 ? parseFloat(potenciaP2) : null,
      potenciaP3: potenciaP3 ? parseFloat(potenciaP3) : null,
      potenciaP4: potenciaP4 ? parseFloat(potenciaP4) : null,
      potenciaP5: potenciaP5 ? parseFloat(potenciaP5) : null,
      potenciaP6: potenciaP6 ? parseFloat(potenciaP6) : null,
      tieneFee: Boolean(tieneFee),
      feeEnergia: feeEnergia ? parseFloat(feeEnergia) : 0,
      feePotencia: feePotencia ? parseFloat(feePotencia) : 0,
      feeEnergiaMinimo: feeEnergiaMinimo ? parseFloat(feeEnergiaMinimo) : null,
      feeEnergiaMaximo: feeEnergiaMaximo ? parseFloat(feeEnergiaMaximo) : null,
      feePotenciaMinimo: feePotenciaMinimo ? parseFloat(feePotenciaMinimo) : null,
      feePotenciaMaximo: feePotenciaMaximo ? parseFloat(feePotenciaMaximo) : null,
      costeGestion: costeGestion ? parseFloat(costeGestion) : 0,
      activa: activa !== undefined ? Boolean(activa) : true
    };

    const tarifaActualizada = await prisma.tarifa.update({
      where: { id },
      data: updateData,
      include: {
        comercializadora: true
      }
    });

    return NextResponse.json(tarifaActualizada);
  } catch (error) {
    console.error('Error actualizando tarifa:', error);
    return NextResponse.json(
      { error: 'Error actualizando tarifa', details: error instanceof Error ? error.message : 'Error desconocido' },
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

    // Verificar si la tarifa está siendo usada en alguna comparativa
    const resultadosVinculados = await prisma.resultadoComparativa.count({
      where: { tarifaId: id }
    });

    if (resultadosVinculados > 0) {
      return NextResponse.json(
        { error: `No se puede eliminar la tarifa porque está siendo usada en ${resultadosVinculados} comparativas` },
        { status: 400 }
      );
    }

    await prisma.tarifa.delete({
      where: { id }
    });

    return NextResponse.json({ success: true, message: 'Tarifa eliminada correctamente' });
  } catch (error) {
    console.error('Error eliminando tarifa:', error);
    return NextResponse.json(
      { error: 'Error eliminando tarifa', details: error instanceof Error ? error.message : 'Error desconocido' },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}
