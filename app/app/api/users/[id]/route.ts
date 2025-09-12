
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import bcryptjs from 'bcryptjs';
import { UpdateUserDTO } from '@/types/users';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const userId = params.id;

    const user = await prisma.users.findUnique({
      where: { id: userId },
      include: {
        perfilComision: true,
        _count: {
          select: {
            ventas: true,
            comision_ventas: true
          }
        }
      }
    });

    if (!user) {
      return NextResponse.json(
        { error: 'Usuario no encontrado' },
        { status: 404 }
      );
    }

    // No devolver password
    const { password, ...userWithoutPassword } = user;

    return NextResponse.json({ user: userWithoutPassword });
  } catch (error) {
    console.error('Error fetching user:', error);
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
    const userId = params.id;
    const body: UpdateUserDTO = await request.json();

    // Verificar que el usuario existe
    const existingUser = await prisma.users.findUnique({
      where: { id: userId }
    });

    if (!existingUser) {
      return NextResponse.json(
        { error: 'Usuario no encontrado' },
        { status: 404 }
      );
    }

    // Validar email único si se está actualizando
    if (body.email && body.email !== existingUser.email) {
      const emailExists = await prisma.users.findUnique({
        where: { email: body.email }
      });

      if (emailExists) {
        return NextResponse.json(
          { error: 'Ya existe un usuario con este email' },
          { status: 400 }
        );
      }
    }

    // Validar username único si se está actualizando
    if (body.username && body.username !== existingUser.username) {
      const usernameExists = await prisma.users.findUnique({
        where: { username: body.username }
      });

      if (usernameExists) {
        return NextResponse.json(
          { error: 'Ya existe un usuario con este nombre de usuario' },
          { status: 400 }
        );
      }
    }

    // Validar perfil de comisión si se proporciona
    if (body.perfilComisionId) {
      const perfil = await prisma.perfiles_comision.findUnique({
        where: { id: body.perfilComisionId }
      });

      if (!perfil || !perfil.activo) {
        return NextResponse.json(
          { error: 'Perfil de comisión no válido o inactivo' },
          { status: 400 }
        );
      }
    }

    // Preparar datos de actualización
    const updateData: any = {};
    
    if (body.name !== undefined) updateData.name = body.name;
    if (body.email !== undefined) updateData.email = body.email;
    if (body.username !== undefined) updateData.username = body.username;
    if (body.tipoUsuario !== undefined) updateData.tipoUsuario = body.tipoUsuario;
    if (body.perfilComisionId !== undefined) updateData.perfilComisionId = body.perfilComisionId;
    if (body.activo !== undefined) updateData.activo = body.activo;
    if (body.telefono !== undefined) updateData.telefono = body.telefono;
    if (body.observaciones !== undefined) updateData.observaciones = body.observaciones;

    // Encriptar nueva password si se proporciona
    if (body.password) {
      updateData.password = await bcryptjs.hash(body.password, 12);
    }

    const updatedUser = await prisma.users.update({
      where: { id: userId },
      data: updateData,
      include: {
        perfilComision: true,
        _count: {
          select: {
            ventas: true,
            comision_ventas: true
          }
        }
      }
    });

    // No devolver password
    const { password, ...userWithoutPassword } = updatedUser;

    return NextResponse.json({
      success: true,
      user: userWithoutPassword
    });

  } catch (error) {
    console.error('Error updating user:', error);
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
    const userId = params.id;

    // Verificar que el usuario existe
    const existingUser = await prisma.users.findUnique({
      where: { id: userId }
    });

    if (!existingUser) {
      return NextResponse.json(
        { error: 'Usuario no encontrado' },
        { status: 404 }
      );
    }

    // Verificar si el usuario tiene ventas asociadas
    const ventasCount = await prisma.ventas.count({
      where: { usuarioId: userId }
    });

    if (ventasCount > 0) {
      // No eliminar, solo desactivar
      const deactivatedUser = await prisma.users.update({
        where: { id: userId },
        data: { activo: false }
      });

      return NextResponse.json({
        success: true,
        message: 'Usuario desactivado (no se puede eliminar porque tiene ventas asociadas)',
        user: { id: deactivatedUser.id, activo: deactivatedUser.activo }
      });
    }

    // Eliminar usuario si no tiene ventas
    await prisma.users.delete({
      where: { id: userId }
    });

    return NextResponse.json({
      success: true,
      message: 'Usuario eliminado correctamente'
    });

  } catch (error) {
    console.error('Error deleting user:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}
