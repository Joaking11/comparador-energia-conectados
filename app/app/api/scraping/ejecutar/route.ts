
import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { decryptPassword } from '@/lib/crypto-utils';
import { ScraperFactory } from '@/lib/scrapers/scraper-factory';

const prisma = new PrismaClient();

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { credencialId, cups, distribuidora, comparativaId } = body;

    if (!cups) {
      return NextResponse.json(
        { error: 'CUPS es requerido' },
        { status: 400 }
      );
    }

    // Determinar la credencial a usar
    let credencial: any;
    
    if (credencialId) {
      // Usar credencial específica
      credencial = await prisma.credenciales_distribuidoras.findUnique({
        where: { id: credencialId }
      });
    } else if (distribuidora) {
      // Buscar credencial por distribuidora
      credencial = await prisma.credenciales_distribuidoras.findFirst({
        where: { 
          distribuidora: distribuidora.toUpperCase(),
          activa: true
        }
      });
    }

    if (!credencial) {
      return NextResponse.json(
        { error: 'No se encontraron credenciales válidas para la distribuidora' },
        { status: 400 }
      );
    }

    console.log(`🚀 Iniciando scraping para ${credencial.distribuidora} - CUPS: ${cups}`);

    // Crear registro de scraping con estado "pendiente"
    const registroScraping = await prisma.datos_consumo_scraping.create({
      data: {
        credencialId: credencial.id,
        cups: cups,
        distribuidora: credencial.distribuidora,
        comparativaId: comparativaId || null,
        consumoTotal: 0, // Se actualizará después
        tipo_dato: 'historico',
        estado_scraping: 'pendiente',
        mensaje_error: null
      }
    });

    // Ejecutar scraping en background
    setImmediate(async () => {
      await ejecutarScrapingAsync(credencial, cups, registroScraping.id);
    });

    return NextResponse.json({
      success: true,
      message: 'Scraping iniciado exitosamente',
      scrapingId: registroScraping.id,
      status: 'pendiente'
    });

  } catch (error) {
    console.error('Error ejecutando scraping:', error);
    return NextResponse.json(
      { error: 'Error ejecutando scraping', details: error instanceof Error ? error.message : 'Error desconocido' },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}

async function ejecutarScrapingAsync(credencial: any, cups: string, registroId: string) {
  const prismaAsync = new PrismaClient();
  
  try {
    console.log(`🔄 Ejecutando scraping async para ${credencial.distribuidora}...`);

    // Desencriptar contraseña
    const password = decryptPassword(credencial.password_encrypted);
    
    // Crear scraper
    const scraper = ScraperFactory.createScraper(credencial.distribuidora, {
      usuario: credencial.usuario,
      password: password,
      url_portal: credencial.url_portal
    });

    // Ejecutar scraping
    const result = await scraper.scrape(cups);

    if (result.success && result.data) {
      // Actualizar registro con datos exitosos
      await prismaAsync.datos_consumo_scraping.update({
        where: { id: registroId },
        data: {
          consumoP1: result.data.consumoP1 || null,
          consumoP2: result.data.consumoP2 || null,
          consumoP3: result.data.consumoP3 || null,
          consumoP4: result.data.consumoP4 || null,
          consumoP5: result.data.consumoP5 || null,
          consumoP6: result.data.consumoP6 || null,
          consumoTotal: result.data.consumoTotal,
          potenciaP1: result.data.potenciaP1 || null,
          potenciaP2: result.data.potenciaP2 || null,
          potenciaP3: result.data.potenciaP3 || null,
          potenciaP4: result.data.potenciaP4 || null,
          potenciaP5: result.data.potenciaP5 || null,
          potenciaP6: result.data.potenciaP6 || null,
          potenciaMaxima: result.data.potenciaMaxima || null,
          periodo_analizado: result.data.periodo_analizado || 'No especificado',
          estado_scraping: 'exitoso',
          mensaje_error: null,
          datos_raw: JSON.stringify(result.data.datos_raw || {})
        }
      });

      // Actualizar última conexión de la credencial
      await prismaAsync.credenciales_distribuidoras.update({
        where: { id: credencial.id },
        data: { ultima_conexion: new Date() }
      });

      console.log(`✅ Scraping completado exitosamente para CUPS: ${cups}`);

    } else {
      // Actualizar registro con error
      await prismaAsync.datos_consumo_scraping.update({
        where: { id: registroId },
        data: {
          estado_scraping: 'error',
          mensaje_error: result.error || 'Error desconocido durante el scraping'
        }
      });

      console.log(`❌ Scraping falló para CUPS: ${cups} - ${result.error}`);
    }

  } catch (error) {
    console.error('❌ Error en scraping async:', error);
    
    // Actualizar registro con error
    await prismaAsync.datos_consumo_scraping.update({
      where: { id: registroId },
      data: {
        estado_scraping: 'error',
        mensaje_error: error instanceof Error ? error.message : 'Error desconocido'
      }
    });
    
  } finally {
    await prismaAsync.$disconnect();
  }
}

// Endpoint para consultar el estado de un scraping
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const scrapingId = searchParams.get('id');
    const cups = searchParams.get('cups');

    let whereClause: any = {};
    
    if (scrapingId) {
      whereClause.id = scrapingId;
    } else if (cups) {
      whereClause.cups = cups;
    }

    const resultados = await prisma.datos_consumo_scraping.findMany({
      where: whereClause,
      include: {
        credencial: {
          select: {
            distribuidora: true,
            usuario: true,
            ultima_conexion: true
          }
        }
      },
      orderBy: {
        fecha_obtencion: 'desc'
      }
    });

    return NextResponse.json(resultados);

  } catch (error) {
    console.error('Error consultando scraping:', error);
    return NextResponse.json(
      { error: 'Error consultando resultados de scraping' },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}
