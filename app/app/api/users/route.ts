
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import bcryptjs from 'bcryptjs';
import { CreateUserDTO } from '@/types/users';
import crypto from 'crypto';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const search = searchParams.get('search') || '';
    const tipoUsuario = searchParams.get('tipoUsuario') || '';
    const activo = searchParams.get('activo');

    const skip = (page - 1) * limit;

    // Construir filtros
    const where: any = {};
    
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
        { username: { contains: search, mode: 'insensitive' } }
      ];
    }

    if (tipoUsuario) {
      where.tipoUsuario = tipoUsuario;
    }

    if (activo !== null && activo !== undefined) {
      where.activo = activo === 'true';
    }

    const [users, total] = await Promise.all([
      prisma.users.findMany({
        where,
        skip,
        take: limit,
        include: {
          perfilComision: true,
          _count: {
            select: {
              ventas: true,
              comision_ventas: true
            }
          }
        },
        orderBy: { createdAt: 'desc' }
      }),
      prisma.users.count({ where })
    ]);

    // No devolver passwords
    const usersWithoutPasswords = users.map(({ password, ...user }) => user);

    return NextResponse.json({
      users: usersWithoutPasswords,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Error fetching users:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body: CreateUserDTO = await request.json();
    
    // Validaciones
    if (!body.email) {
      return NextResponse.json(
        { error: 'Email es obligatorio' },
        { status: 400 }
      );
    }

    if (!body.tipoUsuario) {
      return NextResponse.json(
        { error: 'Tipo de usuario es obligatorio' },
        { status: 400 }
      );
    }

    // Verificar que el email no existe
    const existingUser = await prisma.users.findUnique({
      where: { email: body.email }
    });

    if (existingUser) {
      return NextResponse.json(
        { error: 'Ya existe un usuario con este email' },
        { status: 400 }
      );
    }

    // Verificar username si se proporciona
    if (body.username) {
      const existingUsername = await prisma.users.findUnique({
        where: { username: body.username }
      });

      if (existingUsername) {
        return NextResponse.json(
          { error: 'Ya existe un usuario con este nombre de usuario' },
          { status: 400 }
        );
      }
    }

    // Encriptar password si se proporciona
    let hashedPassword = undefined;
    if (body.password) {
      hashedPassword = await bcryptjs.hash(body.password, 12);
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

    const newUser = await prisma.users.create({
      data: {
        id: crypto.randomUUID(),
        name: body.name,
        email: body.email,
        username: body.username,
        password: hashedPassword,
        tipoUsuario: body.tipoUsuario,
        perfilComisionId: body.perfilComisionId,
        telefono: body.telefono,
        observaciones: body.observaciones,
      },
      include: {
        perfilComision: true
      }
    });

    // No devolver password
    const { password, ...userWithoutPassword } = newUser;

    return NextResponse.json({
      success: true,
      user: userWithoutPassword
    }, { status: 201 });
    
  } catch (error) {
    console.error('Error creating user:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}
