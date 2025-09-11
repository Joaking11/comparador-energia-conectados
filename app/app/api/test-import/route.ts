
import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import * as XLSX from 'xlsx';

const prisma = new PrismaClient();

export async function POST(request: NextRequest) {
  try {
    console.log('🧪 Test de importación iniciado...');
    
    const formData = await request.formData();
    const file = formData.get('file') as File;
    
    if (!file) {
      return NextResponse.json({ error: 'No file' }, { status: 400 });
    }

    console.log(`📁 Archivo: ${file.name}`);
    
    // Leer Excel
    const buffer = Buffer.from(await file.arrayBuffer());
    const workbook = XLSX.read(buffer, { type: 'buffer' });
    
    console.log(`📄 Hojas: ${workbook.SheetNames}`);
    
    const worksheet = workbook.Sheets[workbook.SheetNames[0]];
    const datos = XLSX.utils.sheet_to_json(worksheet, { header: 1 }) as any[][];
    
    console.log(`📊 Filas: ${datos.length}`);
    
    if (datos.length > 0) {
      console.log('🔍 Headers:', datos[0]);
    }
    
    if (datos.length > 1) {
      console.log('📋 Primera fila de datos:', datos[1]);
    }

    return NextResponse.json({
      success: true,
      sheets: workbook.SheetNames,
      rows: datos.length,
      headers: datos.length > 0 ? datos[0] : [],
      firstRow: datos.length > 1 ? datos[1] : []
    });

  } catch (error) {
    console.error('❌ Error:', error);
    return NextResponse.json({
      error: 'Error procesando archivo',
      details: error instanceof Error ? error.message : 'Error desconocido'
    }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}
