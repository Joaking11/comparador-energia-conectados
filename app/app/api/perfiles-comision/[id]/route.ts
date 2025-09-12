
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { UpdatePerfilComisionDTO } from '@/types/users';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const perfilId = params.id;

    const perfil = await prisma.perfiles_comision.findUnique({
      where: { id: perfilId },
      include: {
        usuarios: {
          select: {
            id: true,
            name: true,
            email: true,
            tipoUsuario: true,
            activo: true
          }
        },
        comisiones_comercializadora: {
          include: {
            comercializadora: {
              select: {
                id: true,
                nombre: true,
                color: true,
                logoUrl: true
              }
            }
          }
        },
        comisiones_tarifa: true,
        comisiones_oferta: {
          include: {
            comercializadora: {
              select: {
                id: true,
                nombre: true,
                color: true,
                logoUrl: true
              }
            }
          }
        },
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

    if (!perfil) {
      return NextResponse.json(
        { error: 'Perfil de comisión no encontrado' },
        { status: 404 }
      );
    }

    return NextResponse.json({ perfil });
  } catch (error) {
    console.error('Error fetching commission profile:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const perfilId = params.id;
    const body: UpdatePerfilComisionDTO = await request.json();

    // Verificar que el perfil existe
    const existingPerfil = await prisma.perfiles_comision.findUnique({
      where: { id: perfilId }
    });

    if (!existingPerfil) {
      return NextResponse.json(
        { error: 'Perfil de comisión no encontrado' },
        { status: 404 }
      );
    }

    // Validar nombre único si se está actualizando
    if (body.nombre && body.nombre !== existingPerfil.nombre) {
      const nombreExists = await prisma.perfiles_comision.findUnique({
        where: { nombre: body.nombre }
      });

      if (nombreExists) {
        return NextResponse.json(
          { error: 'Ya existe un perfil con este nombre' },
          { status: 400 }
        );
      }
    }

    // Validar porcentaje
    if (body.porcentajeTotal !== undefined && (body.porcentajeTotal < 0 || body.porcentajeTotal > 100)) {
      return NextResponse.json(
        { error: 'Porcentaje total debe estar entre 0 y 100' },
        { status: 400 }
      );
    }

    // Preparar datos de actualización
    const updateData: any = {};
    
    if (body.nombre !== undefined) updateData.nombre = body.nombre;
    if (body.descripcion !== undefined) updateData.descripcion = body.descripcion;
    if (body.porcentajeTotal !== undefined) updateData.porcentajeTotal = body.porcentajeTotal;
    if (body.activo !== undefined) updateData.activo = body.activo;

    const updatedPerfil = await prisma.perfiles_comision.update({
      where: { id: perfilId },
      data: updateData,
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
      perfil: updatedPerfil
    });

  } catch (error) {
    console.error('Error updating commission profile:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const perfilId = params.id;

    // Verificar que el perfil existe
    const existingPerfil = await prisma.perfiles_comision.findUnique({
      where: { id: perfilId }
    });

    if (!existingPerfil) {
      return NextResponse.json(
        { error: 'Perfil de comisión no encontrado' },
        { status: 404 }
      );
    }

    // Verificar si hay usuarios asociados
    const usuariosCount = await prisma.users.count({
      where: { perfilComisionId: perfilId }
    });

    if (usuariosCount > 0) {
      // No eliminar, solo desactivar
      const deactivatedPerfil = await prisma.perfiles_comision.update({
        where: { id: perfilId },
        data: { activo: false }
      });

      return NextResponse.json({
        success: true,
        message: 'Perfil desactivado (no se puede eliminar porque tiene usuarios asociados)',
        perfil: { id: deactivatedPerfil.id, activo: deactivatedPerfil.activo }
      });
    }

    // Eliminar perfil si no tiene usuarios
    await prisma.perfiles_comision.delete({
      where: { id: perfilId }
    });

    return NextResponse.json({
      success: true,
      message: 'Perfil de comisión eliminado correctamente'
    });

  } catch (error) {
    console.error('Error deleting commission profile:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}
