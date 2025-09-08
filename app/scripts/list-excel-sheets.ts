
import * as XLSX from 'xlsx';
import * as fs from 'fs';
import * as path from 'path';

const excelPath = process.env.EXCEL_FILE_PATH || path.join(process.cwd(), '..', '..', 'Uploads', 'COMPARATIVAS_2Septiembre.xlsm');

console.log('📖 Leyendo archivo Excel...');
const workbook = XLSX.readFile(excelPath);

console.log('\n📊 Hojas disponibles en el Excel:');
workbook.SheetNames.forEach((name, index) => {
  console.log(`${index + 1}. ${name}`);
  
  // También vamos a ver las dimensiones de cada hoja
  const sheet = workbook.Sheets[name];
  const range = XLSX.utils.decode_range(sheet['!ref'] || 'A1');
  console.log(`   Dimensiones: ${range.e.r + 1} filas x ${range.e.c + 1} columnas`);
});

// Vamos a ver también las primeras filas de algunas hojas clave
console.log('\n🔍 Muestra de datos de hojas importantes:');

['TARIFAS2', 'comisiones', 'comercializadora', 'ofertas'].forEach(sheetName => {
  if (workbook.SheetNames.includes(sheetName)) {
    console.log(`\n--- Hoja: ${sheetName} ---`);
    const sheet = workbook.Sheets[sheetName];
    const data = XLSX.utils.sheet_to_json(sheet, { header: 1 });
    
    // Mostrar las primeras 3 filas
    for (let i = 0; i < Math.min(3, data.length); i++) {
      console.log(`Fila ${i + 1}:`, data[i]);
    }
  }
});
