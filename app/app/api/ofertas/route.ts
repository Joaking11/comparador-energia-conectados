
import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

export const dynamic = 'force-dynamic';

const prisma = new PrismaClient();

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const comercializadoraId = searchParams.get('comercializadora');
    const tipo = searchParams.get('tipo');
    const admin = searchParams.get('admin'); // Para el panel admin

    let whereClause: any = {};
    
    // Solo filtrar por activa si no es admin
    if (!admin) {
      whereClause.activa = true;
    }
    
    if (comercializadoraId) {
      whereClause.comercializadoraId = comercializadoraId;
    }
    
    if (tipo) {
      whereClause.tipoOferta = tipo;
    }

    const ofertas = await prisma.tarifas.findMany({
      where: whereClause,
      include: {
        comercializadoras: true
      },
      orderBy: [
        { comercializadoras: { nombre: 'asc' } },
        { energiaP1: 'asc' }
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

export async function POST(request: Request) {
  try {
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
      activa = true
    } = body;

    if (!comercializadoraId || !nombreOferta?.trim()) {
      return NextResponse.json(
        { error: 'Comercializadora y nombre de la oferta son requeridos' },
        { status: 400 }
      );
    }

    const nuevaTarifa = await prisma.tarifas.create({
      data: {
        comercializadoraId,
        nombreOferta: nombreOferta.trim(),
        tarifa: tarifa || '2.0TD',
        tipoOferta: tipoOferta || 'Fijo',
        zona: zona || 'PENINSULA',
        rango: 'E',
        rangoDesde: 0,
        rangoHasta: null,
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
        feeEnergia: feeEnergia ? parseFloat(feeEnergia) : null,
        feePotencia: feePotencia ? parseFloat(feePotencia) : null,
        feeEnergiaMinimo: feeEnergiaMinimo ? parseFloat(feeEnergiaMinimo) : null,
        feeEnergiaMaximo: feeEnergiaMaximo ? parseFloat(feeEnergiaMaximo) : null,
        feePotenciaMinimo: feePotenciaMinimo ? parseFloat(feePotenciaMinimo) : null,
        feePotenciaMaximo: feePotenciaMaximo ? parseFloat(feePotenciaMaximo) : null,
        costeGestion: costeGestion ? parseFloat(costeGestion) : null,
        activa: activa !== undefined ? Boolean(activa) : true
      },
      include: {
        comercializadoras: true
      }
    });

    return NextResponse.json(nuevaTarifa);
  } catch (error) {
    console.error('Error creando tarifa:', error);
    return NextResponse.json(
      { error: 'Error creando tarifa', details: error instanceof Error ? error.message : 'Error desconocido' },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}

export async function PUT(request: Request) {
  try {
    const body = await request.json();
    const {
      id,
      comercializadoraId,
      nombre,
      tarifa,
      tipo,
      precioEnergia,
      precioTermino,
      descripcion,
      activa,
      comisionTipo,
      comisionMinimo,
      comisionMaximo,
      comisionValor
    } = body;

    if (!id) {
      return NextResponse.json(
        { error: 'ID de oferta es requerido' },
        { status: 400 }
      );
    }

    const updateData: any = {};
    if (comercializadoraId) updateData.comercializadoraId = comercializadoraId;
    if (nombre !== undefined) updateData.nombreOferta = nombre.trim();
    if (tarifa !== undefined) updateData.tarifa = tarifa;
    if (tipo !== undefined) updateData.tipoOferta = tipo;
    if (precioEnergia !== undefined) updateData.energiaP1 = parseFloat(precioEnergia);
    if (precioTermino !== undefined) updateData.potenciaP1 = parseFloat(precioTermino);
    if (activa !== undefined) updateData.activa = activa;
    if (comisionTipo !== undefined) updateData.rango = comisionTipo;
    if (comisionMinimo !== undefined) updateData.rangoDesde = parseFloat(comisionMinimo);
    if (comisionMaximo !== undefined) updateData.rangoHasta = comisionMaximo ? parseFloat(comisionMaximo) : null;

    const oferta = await prisma.tarifa.update({
      where: { id },
      data: updateData,
      include: {
        comercializadora: true
      }
    });

    return NextResponse.json(oferta);
  } catch (error) {
    console.error('Error updating oferta:', error);
    return NextResponse.json(
      { error: 'Error updating oferta' },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}

export async function DELETE(request: Request) {
  try {
    const body = await request.json();
    const { id } = body;

    if (!id) {
      return NextResponse.json(
        { error: 'ID de oferta es requerido' },
        { status: 400 }
      );
    }

    await prisma.tarifa.delete({
      where: { id }
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting oferta:', error);
    return NextResponse.json(
      { error: 'Error deleting oferta' },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}
