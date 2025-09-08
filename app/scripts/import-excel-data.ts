
import { PrismaClient } from '@prisma/client';
import * as XLSX from 'xlsx';
import * as fs from 'fs';
import * as path from 'path';

const prisma = new PrismaClient();

// Función auxiliar para convertir valores de Excel
function parseExcelValue(value: any): number | null {
  if (value === null || value === undefined || value === '') {
    return null;
  }
  if (typeof value === 'number') {
    return value;
  }
  if (typeof value === 'string') {
    const cleanValue = value.replace(',', '.').replace(/[^\d.-]/g, '');
    const parsed = parseFloat(cleanValue);
    return isNaN(parsed) ? null : parsed;
  }
  return null;
}

async function importExcelData() {
  console.log('📊 Iniciando importación de datos del Excel...');

  // Ruta al archivo Excel
  const excelPath = process.env.EXCEL_FILE_PATH || path.join(process.cwd(), '..', '..', 'Uploads', 'COMPARATIVAS_2Septiembre.xlsm');
  
  if (!fs.existsSync(excelPath)) {
    throw new Error(`No se encuentra el archivo Excel en: ${excelPath}`);
  }

  // Leer el archivo Excel
  console.log('📖 Leyendo archivo Excel...');
  const workbook = XLSX.readFile(excelPath);

  // PASO 0: Limpiar datos existentes (excepto usuarios)
  console.log('🧹 Limpiando datos existentes...');
  await prisma.comision.deleteMany({});
  await prisma.tarifa.deleteMany({});
  console.log('✅ Datos limpiados');

  // PASO 1: Extraer comercializadoras únicas desde la hoja "TARIFAS2"
  console.log('🏢 Extrayendo comercializadoras de TARIFAS2...');
  
  if (!workbook.SheetNames.includes('TARIFAS2')) {
    throw new Error('No se encontró la hoja "TARIFAS2"');
  }

  const tarifasSheetTemp = workbook.Sheets['TARIFAS2'];
  const tarifasDataTemp = XLSX.utils.sheet_to_json(tarifasSheetTemp, { header: 1 });
  
  // Extraer nombres únicos de comercializadoras (columna 0)
  const nombresComercializadoras = new Set<string>();
  for (let i = 1; i < tarifasDataTemp.length; i++) {
    const row = tarifasDataTemp[i] as any[];
    if (row[0] && row[0].toString().trim()) {
      nombresComercializadoras.add(row[0].toString().trim());
    }
  }
  
  console.log(`📝 Encontradas ${nombresComercializadoras.size} comercializadoras únicas`);
  
  const comercializadorasCreadas = [];
  
  // Crear o actualizar cada comercializadora
  for (const nombre of nombresComercializadoras) {
    const comercializadora = await prisma.comercializadora.upsert({
      where: { nombre },
      update: { activa: true },
      create: { nombre, activa: true }
    });
    comercializadorasCreadas.push(comercializadora);
  }

  console.log(`✅ Comercializadoras importadas: ${comercializadorasCreadas.length}`);

  // PASO 2: Importar tarifas desde la hoja "TARIFAS2"
  console.log('💰 Importando tarifas...');
  
  if (!workbook.SheetNames.includes('TARIFAS2')) {
    throw new Error('No se encontró la hoja "TARIFAS2"');
  }

  const tarifasSheet = workbook.Sheets['TARIFAS2'];
  const tarifasData = XLSX.utils.sheet_to_json(tarifasSheet, { header: 1 });
  
  let tarifasCreadas = 0;
  
  // Headers esperados: comercializadora, nombre oferta, tarifa, tipo oferta, zona, rango, desde, hasta, energia p1, energia p2, energia p3, potencia p1, potencia p2, potencia p3
  for (let i = 1; i < tarifasData.length; i++) {
    const row = tarifasData[i] as any[];
    
    if (!row[0] || !row[1]) continue; // Saltar filas sin comercializadora o nombre
    
    const nombreComercializadora = row[0].toString().trim();
    const comercializadora = comercializadorasCreadas.find(c => 
      c.nombre.toLowerCase() === nombreComercializadora.toLowerCase()
    );
    
    if (!comercializadora) {
      console.log(`⚠️  Comercializadora no encontrada: ${nombreComercializadora}`);
      continue;
    }
    
    try {
      await prisma.tarifa.create({
        data: {
          comercializadoraId: comercializadora.id,
          nombreOferta: row[1]?.toString().trim() || '',
          tarifa: row[2]?.toString().trim() || '',
          tipoOferta: row[3]?.toString().trim() || '',
          zona: row[4]?.toString().trim() || '',
          rango: row[5]?.toString().trim() || '',
          rangoDesde: parseExcelValue(row[6]) || 0,
          rangoHasta: parseExcelValue(row[7]) || 999999,
          energiaP1: parseExcelValue(row[8]) || 0,
          energiaP2: parseExcelValue(row[9]),
          energiaP3: parseExcelValue(row[10]),
          potenciaP1: parseExcelValue(row[11]),
          potenciaP2: parseExcelValue(row[12]),
          potenciaP3: parseExcelValue(row[13]),
          activa: true
        }
      });
      tarifasCreadas++;
    } catch (error) {
      console.log(`⚠️  Error creando tarifa ${row[1]}: ${error}`);
    }
  }

  console.log(`✅ Tarifas importadas: ${tarifasCreadas}`);

  // PASO 3: Importar comisiones desde la hoja "comisiones"
  console.log('💼 Importando comisiones...');
  
  if (!workbook.SheetNames.includes('COMISIONES')) {
    throw new Error('No se encontró la hoja "COMISIONES"');
  }

  const comisionesSheet = workbook.Sheets['COMISIONES'];
  const comisionesData = XLSX.utils.sheet_to_json(comisionesSheet, { header: 1 });
  
  let comisionesCreadas = 0;
  
  // Headers esperados: comercializadora, zona, rango, desde, hasta, tipo, comision energia, comision potencia
  for (let i = 1; i < comisionesData.length; i++) {
    const row = comisionesData[i] as any[];
    
    if (!row[0]) continue; // Saltar filas sin comercializadora
    
    const nombreComercializadora = row[0].toString().trim();
    const comercializadora = comercializadorasCreadas.find(c => 
      c.nombre.toLowerCase() === nombreComercializadora.toLowerCase()
    );
    
    if (!comercializadora) {
      console.log(`⚠️  Comercializadora no encontrada para comisión: ${nombreComercializadora}`);
      continue;
    }
    
    try {
      await prisma.comision.create({
        data: {
          comercializadoraId: comercializadora.id,
          nombreOferta: row[1]?.toString().trim() || 'Sin nombre', // Columna 1: Oferta
          energiaVerde: row[2]?.toString().toLowerCase() === 'si' || false, // Columna 2: ¿Energía verde?
          tarifa: row[3]?.toString().trim() || '', // Columna 3: Tarifa
          zona: row[4]?.toString().trim() || '', // Columna 4: Zona
          tipoOferta: row[5]?.toString().trim() || '', // Columna 5: Tipo oferta
          rango: row[6]?.toString().trim() || '', // Columna 6: Rango
          rangoDesde: parseExcelValue(row[7]) || 0, // Columna 7: Desde
          rangoHasta: parseExcelValue(row[8]) || null, // Columna 8: Hasta
          comision: parseExcelValue(row[12]) || 0 // Columna 12: COMISION (campo requerido)
        }
      });
      comisionesCreadas++;
    } catch (error) {
      console.log(`⚠️  Error creando comisión: ${error}`);
    }
  }

  console.log(`✅ Comisiones importadas: ${comisionesCreadas}`);

  // PASO 4: Crear usuario demo
  console.log('👤 Creando usuario demo...');
  
  const bcryptjs = require('bcryptjs');
  const hashedPassword = await bcryptjs.hash('demo123', 12);
  
  try {
    const userDemo = await prisma.user.create({
      data: {
        email: 'demo@energia.com',
        name: 'Usuario Demo',
        password: hashedPassword
      }
    });
    console.log('✅ Usuario demo creado');
  } catch (error) {
    console.log('⚠️  Usuario demo ya existe o error creándolo');
  }

  // Resumen final
  console.log('\n🎉 Importación completada exitosamente!');
  console.log(`📊 Comercializadoras: ${comercializadorasCreadas.length}`);
  console.log(`💰 Tarifas: ${tarifasCreadas}`);
  console.log(`💼 Comisiones: ${comisionesCreadas}`);
  console.log(`🔐 Usuario demo: demo@energia.com / demo123`);
}

async function main() {
  try {
    await importExcelData();
  } catch (error) {
    console.error('❌ Error durante la importación:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

if (require.main === module) {
  main();
}

export { importExcelData };
