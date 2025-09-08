
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
      whereClause.tipo = tipo;
    }

    const ofertas = await prisma.tarifa.findMany({
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

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      comercializadoraId,
      nombre,
      tarifa,
      tipo,
      precioEnergia,
      precioTermino,
      descripcion,
      activa = true,
      comisionTipo,
      comisionMinimo,
      comisionMaximo,
      comisionValor
    } = body;

    if (!comercializadoraId || !nombre?.trim()) {
      return NextResponse.json(
        { error: 'Comercializadora y nombre son requeridos' },
        { status: 400 }
      );
    }

    const oferta = await prisma.tarifa.create({
      data: {
        comercializadoraId,
        nombre: nombre.trim(),
        tarifa: tarifa || '2.0TD',
        tipo: tipo || 'Fija',
        precioEnergia: parseFloat(precioEnergia) || 0,
        precioTermino: parseFloat(precioTermino) || 0,
        descripcion: descripcion?.trim() || null,
        activa,
        comisionTipo: comisionTipo || 'E',
        comisionMinimo: parseFloat(comisionMinimo) || 0,
        comisionMaximo: comisionMaximo ? parseFloat(comisionMaximo) : null,
        comisionValor: parseFloat(comisionValor) || 0
      },
      include: {
        comercializadora: true
      }
    });

    return NextResponse.json(oferta);
  } catch (error) {
    console.error('Error creating oferta:', error);
    return NextResponse.json(
      { error: 'Error creating oferta' },
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
    if (nombre !== undefined) updateData.nombre = nombre.trim();
    if (tarifa !== undefined) updateData.tarifa = tarifa;
    if (tipo !== undefined) updateData.tipo = tipo;
    if (precioEnergia !== undefined) updateData.precioEnergia = parseFloat(precioEnergia);
    if (precioTermino !== undefined) updateData.precioTermino = parseFloat(precioTermino);
    if (descripcion !== undefined) updateData.descripcion = descripcion?.trim() || null;
    if (activa !== undefined) updateData.activa = activa;
    if (comisionTipo !== undefined) updateData.comisionTipo = comisionTipo;
    if (comisionMinimo !== undefined) updateData.comisionMinimo = parseFloat(comisionMinimo);
    if (comisionMaximo !== undefined) updateData.comisionMaximo = comisionMaximo ? parseFloat(comisionMaximo) : null;
    if (comisionValor !== undefined) updateData.comisionValor = parseFloat(comisionValor);

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

    await prisma.oferta.delete({
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
