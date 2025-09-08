
import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

export const dynamic = 'force-dynamic';

const prisma = new PrismaClient();

export async function GET() {
  try {
    const comercializadoras = await prisma.comercializadoras.findMany({
      include: {
        tarifas: {
          orderBy: {
            createdAt: 'desc'
          }
        }
      },
      orderBy: {
        nombre: 'asc'
      }
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

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { nombre, activa = true } = body;

    if (!nombre || !nombre.trim()) {
      return NextResponse.json(
        { error: 'Nombre de comercializadora es requerido' },
        { status: 400 }
      );
    }

    // Verificar si ya existe
    const existente = await prisma.comercializadoras.findUnique({
      where: { nombre: nombre.trim() }
    });

    if (existente) {
      return NextResponse.json(
        { error: 'Ya existe una comercializadora con este nombre' },
        { status: 400 }
      );
    }

    const comercializadora = await prisma.comercializadoras.create({
      data: {
        id: `comercializadora_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        nombre: nombre.trim(),
        activa,
        updatedAt: new Date()
      }
    });

    return NextResponse.json(comercializadora);
  } catch (error) {
    console.error('Error creating comercializadora:', error);
    return NextResponse.json(
      { error: 'Error creating comercializadora' },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}

export async function PUT(request: Request) {
  try {
    const body = await request.json();
    const { id, nombre, activa } = body;

    if (!id) {
      return NextResponse.json(
        { error: 'ID de comercializadora es requerido' },
        { status: 400 }
      );
    }

    const updateData: any = {};
    if (nombre !== undefined) updateData.nombre = nombre.trim();
    if (activa !== undefined) updateData.activa = activa;

    const comercializadora = await prisma.comercializadoras.update({
      where: { id },
      data: updateData
    });

    return NextResponse.json(comercializadora);
  } catch (error) {
    console.error('Error updating comercializadora:', error);
    return NextResponse.json(
      { error: 'Error updating comercializadora' },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}
