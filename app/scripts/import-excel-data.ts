
import { PrismaClient } from '@prisma/client';
import * as XLSX from 'xlsx';
import * as path from 'path';
import * as dotenv from 'dotenv';

// Cargar variables de entorno
dotenv.config({ path: path.join(__dirname, '..', '.env') });

const prisma = new PrismaClient();

// Función para convertir valores de Excel a números seguros
function toNumber(value: any): number {
  if (value === null || value === undefined || value === '' || value === '-') {
    return 0;
  }
  const num = parseFloat(String(value));
  return isNaN(num) ? 0 : num;
}

// Función para convertir valores de Excel a números opcionales
function toNumberOptional(value: any): number | null {
  if (value === null || value === undefined || value === '' || value === '-') {
    return null;
  }
  const num = parseFloat(String(value));
  return isNaN(num) ? null : num;
}

// Función para convertir valores de Excel a booleanos
function toBoolean(value: any): boolean {
  if (typeof value === 'boolean') return value;
  const str = String(value).toLowerCase().trim();
  return str === 'si' || str === 'sí' || str === 'true' || str === '1';
}

// Función para limpiar strings
function cleanString(value: any): string {
  if (value === null || value === undefined) return '';
  return String(value).trim();
}

async function importExcelData() {
  try {
    console.log('🚀 Iniciando importación de datos del Excel...');
    
    // Cargar el archivo Excel
    const excelPath = '/home/ubuntu/Uploads/COMPARATIVAS_2Septiembre.xlsm';
    const workbook = XLSX.readFile(excelPath);
    
    // Verificar que las hojas existan
    if (!workbook.SheetNames.includes('TARIFAS2')) {
      throw new Error('Hoja TARIFAS2 no encontrada en el Excel');
    }
    if (!workbook.SheetNames.includes('COMISIONES')) {
      throw new Error('Hoja COMISIONES no encontrada en el Excel');
    }
    
    // Leer las hojas
    const tarifasSheet = workbook.Sheets['TARIFAS2'];
    const comisionesSheet = workbook.Sheets['COMISIONES'];
    
    // Convertir a JSON
    const tarifasData: any[] = XLSX.utils.sheet_to_json(tarifasSheet, { header: 1 });
    const comisionesData: any[] = XLSX.utils.sheet_to_json(comisionesSheet, { header: 1 });
    
    console.log(`📊 Datos encontrados:`);
    console.log(`   - TARIFAS2: ${tarifasData.length} filas`);
    console.log(`   - COMISIONES: ${comisionesData.length} filas`);
    
    // PASO 1: Crear comercializadoras únicas
    console.log('\n📋 Creando comercializadoras...');
    const comercializadorasSet = new Set<string>();
    
    // Extraer comercializadoras de ambas hojas (saltar primera fila - encabezados)
    for (let i = 1; i < tarifasData.length; i++) {
      const comercializadora = cleanString(tarifasData[i][0]);
      if (comercializadora) comercializadorasSet.add(comercializadora);
    }
    
    for (let i = 1; i < comisionesData.length; i++) {
      const comercializadora = cleanString(comisionesData[i][0]);
      if (comercializadora) comercializadorasSet.add(comercializadora);
    }
    
    // Crear comercializadoras en la BD
    const comercializadorasCreadas = new Map<string, string>(); // nombre -> id
    for (const nombreComercializadora of comercializadorasSet) {
      try {
        const comercializadora = await prisma.comercializadora.upsert({
          where: { nombre: nombreComercializadora },
          update: { activa: true },
          create: { 
            nombre: nombreComercializadora,
            activa: true 
          }
        });
        comercializadorasCreadas.set(nombreComercializadora, comercializadora.id);
        console.log(`   ✅ ${nombreComercializadora}`);
      } catch (error) {
        console.log(`   ❌ Error con ${nombreComercializadora}:`, error);
      }
    }
    
    // PASO 2: Importar TARIFAS
    console.log('\n🔋 Importando tarifas...');
    const tarifasHeaders = tarifasData[0];
    console.log('Encabezados TARIFAS:', tarifasHeaders);
    
    let tarifasImportadas = 0;
    for (let i = 1; i < tarifasData.length; i++) {
      const row = tarifasData[i];
      if (!row || row.length === 0) continue;
      
      const comercializadoraNombre = cleanString(row[0]);
      if (!comercializadoraNombre) continue;
      
      const comercializadoraId = comercializadorasCreadas.get(comercializadoraNombre);
      if (!comercializadoraId) continue;
      
      try {
        const tarifa = await prisma.tarifa.create({
          data: {
            comercializadoraId: comercializadoraId,
            nombreOferta: cleanString(row[1]) || '',
            energiaVerde: toBoolean(row[2]),
            tarifa: cleanString(row[3]) || '',
            zona: cleanString(row[4]) || '',
            tipoOferta: cleanString(row[5]) || '',
            rango: cleanString(row[6]) || 'E',
            rangoDesde: toNumber(row[7]),
            rangoHasta: toNumberOptional(row[8]),
            tieneFee: toBoolean(row[9]),
            
            // Precios energía P1-P6 (columnas 10-15)
            energiaP1: toNumber(row[10]),
            energiaP2: toNumberOptional(row[11]),
            energiaP3: toNumberOptional(row[12]),
            energiaP4: toNumberOptional(row[13]),
            energiaP5: toNumberOptional(row[14]),
            energiaP6: toNumberOptional(row[15]),
            energiaDescuento: toNumberOptional(row[16]),
            
            // Precios potencia P1-P6 (columnas 17-22)
            potenciaP1: toNumberOptional(row[17]),
            potenciaP2: toNumberOptional(row[18]),
            potenciaP3: toNumberOptional(row[19]),
            potenciaP4: toNumberOptional(row[20]),
            potenciaP5: toNumberOptional(row[21]),
            potenciaP6: toNumberOptional(row[22]),
            potenciaDescuento: toNumberOptional(row[23]),
            
            // FEE (columnas 24-29)
            feeEnergia: toNumberOptional(row[24]),
            feeEnergiaMinimo: toNumberOptional(row[25]),
            feeEnergiaMaximo: toNumberOptional(row[26]),
            feePotencia: toNumberOptional(row[27]),
            feePotenciaMinimo: toNumberOptional(row[28]),
            feePotenciaMaximo: toNumberOptional(row[29]),
            
            // Otros campos
            validaHasta: null, // Se puede procesar después si es necesario
            tipoCliente: cleanString(row[33]) || 'PAC',
            costeGestion: toNumber(row[32]),
            costeTotal: toNumber(row[34]),
            activa: true
          }
        });
        
        tarifasImportadas++;
        if (tarifasImportadas % 100 === 0) {
          console.log(`   📈 ${tarifasImportadas} tarifas importadas...`);
        }
      } catch (error) {
        console.log(`   ❌ Error importando tarifa fila ${i}:`, error);
      }
    }
    
    console.log(`   ✅ ${tarifasImportadas} tarifas importadas exitosamente`);
    
    // PASO 3: Importar COMISIONES
    console.log('\n💰 Importando comisiones...');
    const comisionesHeaders = comisionesData[0];
    console.log('Encabezados COMISIONES:', comisionesHeaders);
    
    let comisionesImportadas = 0;
    for (let i = 1; i < comisionesData.length; i++) {
      const row = comisionesData[i];
      if (!row || row.length === 0) continue;
      
      const comercializadoraNombre = cleanString(row[0]);
      if (!comercializadoraNombre) continue;
      
      const comercializadoraId = comercializadorasCreadas.get(comercializadoraNombre);
      if (!comercializadoraId) continue;
      
      try {
        const comision = await prisma.comision.create({
          data: {
            comercializadoraId: comercializadoraId,
            nombreOferta: cleanString(row[1]) || '',
            energiaVerde: toBoolean(row[2]),
            tarifa: cleanString(row[3]) || '',
            zona: cleanString(row[4]) || null,
            tipoOferta: cleanString(row[5]) || '',
            rango: cleanString(row[6]) || 'E',
            rangoDesde: toNumber(row[7]),
            rangoHasta: toNumberOptional(row[8]),
            tieneFee: toBoolean(row[9]),
            
            // Porcentajes FEE (columnas 10-11)
            porcentajeFeePotencia: toNumberOptional(row[10]),
            porcentajeFeeEnergia: toNumberOptional(row[11]),
            
            // Comisión (columna 12)
            comision: toNumber(row[12]),
            activa: true
          }
        });
        
        comisionesImportadas++;
        if (comisionesImportadas % 100 === 0) {
          console.log(`   📈 ${comisionesImportadas} comisiones importadas...`);
        }
      } catch (error) {
        console.log(`   ❌ Error importando comisión fila ${i}:`, error);
      }
    }
    
    console.log(`   ✅ ${comisionesImportadas} comisiones importadas exitosamente`);
    
    console.log('\n🎉 Importación completada exitosamente!');
    console.log(`📊 Resumen:`);
    console.log(`   - Comercializadoras: ${comercializadorasCreadas.size}`);
    console.log(`   - Tarifas: ${tarifasImportadas}`);
    console.log(`   - Comisiones: ${comisionesImportadas}`);
    
  } catch (error) {
    console.error('❌ Error durante la importación:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Ejecutar si es llamado directamente
if (require.main === module) {
  importExcelData()
    .then(() => {
      console.log('✅ Script completado');
      process.exit(0);
    })
    .catch((error) => {
      console.error('❌ Error ejecutando script:', error);
      process.exit(1);
    });
}

export { importExcelData };
