
import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { encryptPassword, decryptPassword } from '@/lib/crypto-utils';

const prisma = new PrismaClient();

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const distribuidora = searchParams.get('distribuidora');

    let whereClause: any = { activa: true };
    if (distribuidora) {
      whereClause.distribuidora = distribuidora;
    }

    const credenciales = await prisma.credenciales_distribuidoras.findMany({
      where: whereClause,
      select: {
        id: true,
        distribuidora: true,
        usuario: true,
        url_portal: true,
        activa: true,
        ultima_conexion: true,
        createdAt: true,
        // NO devolvemos la contraseña encriptada por seguridad
      },
      orderBy: {
        distribuidora: 'asc'
      }
    });

    return NextResponse.json(credenciales);
  } catch (error) {
    console.error('Error obteniendo credenciales:', error);
    return NextResponse.json(
      { error: 'Error obteniendo credenciales' },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { distribuidora, usuario, password, url_portal } = body;

    if (!distribuidora || !usuario || !password) {
      return NextResponse.json(
        { error: 'Distribuidora, usuario y contraseña son requeridos' },
        { status: 400 }
      );
    }

    // Encriptar la contraseña
    const passwordEncrypted = encryptPassword(password);

    // Verificar si ya existe una credencial para esta distribuidora
    const credencialExistente = await prisma.credenciales_distribuidoras.findFirst({
      where: {
        distribuidora: distribuidora.toUpperCase(),
        usuario: usuario
      }
    });

    if (credencialExistente) {
      // Actualizar credencial existente
      const credencialActualizada = await prisma.credenciales_distribuidoras.update({
        where: { id: credencialExistente.id },
        data: {
          password_encrypted: passwordEncrypted,
          url_portal: url_portal || credencialExistente.url_portal,
          activa: true,
          updatedAt: new Date()
        },
        select: {
          id: true,
          distribuidora: true,
          usuario: true,
          url_portal: true,
          activa: true
        }
      });

      return NextResponse.json({
        message: 'Credencial actualizada exitosamente',
        credencial: credencialActualizada
      });
    } else {
      // Crear nueva credencial
      const nuevaCredencial = await prisma.credenciales_distribuidoras.create({
        data: {
          distribuidora: distribuidora.toUpperCase(),
          usuario: usuario,
          password_encrypted: passwordEncrypted,
          url_portal: url_portal || `https://www.${distribuidora.toLowerCase()}.com/area-clientes`,
          activa: true
        },
        select: {
          id: true,
          distribuidora: true,
          usuario: true,
          url_portal: true,
          activa: true
        }
      });

      return NextResponse.json({
        message: 'Credencial creada exitosamente',
        credencial: nuevaCredencial
      });
    }

  } catch (error) {
    console.error('Error gestionando credencial:', error);
    return NextResponse.json(
      { error: 'Error procesando credencial', details: error instanceof Error ? error.message : 'Error desconocido' },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { error: 'ID de credencial requerido' },
        { status: 400 }
      );
    }

    await prisma.credenciales_distribuidoras.delete({
      where: { id }
    });

    return NextResponse.json({
      message: 'Credencial eliminada exitosamente'
    });

  } catch (error) {
    console.error('Error eliminando credencial:', error);
    return NextResponse.json(
      { error: 'Error eliminando credencial' },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}
