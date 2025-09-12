
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { CreatePerfilComisionDTO } from '@/types/users';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const includeInactive = searchParams.get('includeInactive') === 'true';

    const where: any = {};
    if (!includeInactive) {
      where.activo = true;
    }

    const perfiles = await prisma.perfiles_comision.findMany({
      where,
      include: {
        _count: {
          select: {
            usuarios: true,
            comisiones_comercializadora: true,
            comisiones_tarifa: true,
            comisiones_oferta: true
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    return NextResponse.json({ perfiles });
  } catch (error) {
    console.error('Error fetching commission profiles:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body: CreatePerfilComisionDTO = await request.json();
    
    // Validaciones
    if (!body.nombre) {
      return NextResponse.json(
        { error: 'Nombre del perfil es obligatorio' },
        { status: 400 }
      );
    }

    if (body.porcentajeTotal === undefined || body.porcentajeTotal < 0 || body.porcentajeTotal > 100) {
      return NextResponse.json(
        { error: 'Porcentaje total debe estar entre 0 y 100' },
        { status: 400 }
      );
    }

    // Verificar que el nombre no existe
    const existingPerfil = await prisma.perfiles_comision.findUnique({
      where: { nombre: body.nombre }
    });

    if (existingPerfil) {
      return NextResponse.json(
        { error: 'Ya existe un perfil con este nombre' },
        { status: 400 }
      );
    }

    const newPerfil = await prisma.perfiles_comision.create({
      data: {
        nombre: body.nombre,
        descripcion: body.descripcion,
        porcentajeTotal: body.porcentajeTotal
      },
      include: {
        _count: {
          select: {
            usuarios: true,
            comisiones_comercializadora: true,
            comisiones_tarifa: true,
            comisiones_oferta: true
          }
        }
      }
    });

    return NextResponse.json({
      success: true,
      perfil: newPerfil
    }, { status: 201 });
    
  } catch (error) {
    console.error('Error creating commission profile:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}
