
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export async function GET() {
  try {
    const comisionPrincipal = await prisma.comision_principal.findFirst({
      where: { activo: true },
      orderBy: { fechaActivacion: 'desc' }
    });

    if (!comisionPrincipal) {
      return NextResponse.json({
        comision: {
          id: '',
          porcentajeBase: 10.0,
          activo: false,
          fechaActivacion: new Date(),
          createdAt: new Date(),
          updatedAt: new Date()
        }
      });
    }

    return NextResponse.json({ comision: comisionPrincipal });
  } catch (error) {
    console.error('Error fetching main commission:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const { porcentajeBase } = await request.json();

    if (porcentajeBase === undefined || porcentajeBase < 0 || porcentajeBase > 100) {
      return NextResponse.json(
        { error: 'Porcentaje base debe estar entre 0 y 100' },
        { status: 400 }
      );
    }

    // Desactivar comisión actual
    await prisma.comision_principal.updateMany({
      where: { activo: true },
      data: { activo: false }
    });

    // Crear nueva comisión principal
    const nuevaComision = await prisma.comision_principal.create({
      data: {
        porcentajeBase,
        activo: true,
        fechaActivacion: new Date()
      }
    });

    return NextResponse.json({
      success: true,
      comision: nuevaComision
    }, { status: 201 });

  } catch (error) {
    console.error('Error creating main commission:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}
