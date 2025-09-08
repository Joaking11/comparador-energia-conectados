
import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import * as XLSX from 'xlsx';

const prisma = new PrismaClient();

export async function POST(request: NextRequest) {
  let tempFilePath: string | null = null;
  
  try {
    console.log('🔍 Iniciando importación inteligente...');
    
    const formData = await request.formData();
    const file = formData.get('file') as File;
    const tipo = formData.get('tipo') as string; // 'tarifas' o 'comisiones'
    
    if (!file) {
      return NextResponse.json({ error: 'No se proporcionó archivo' }, { status: 400 });
    }

    console.log(`📁 Archivo recibido: ${file.name} (${file.type})`);
    
    // Verificar tipo de archivo
    const extension = file.name.split('.').pop()?.toLowerCase();
    
    if (!['xlsx', 'xlsm', 'xls', 'pdf'].includes(extension || '')) {
      return NextResponse.json({ 
        error: 'Tipo de archivo no soportado. Use Excel (.xlsx, .xlsm, .xls) o PDF' 
      }, { status: 400 });
    }

    let datosInterpretados;
    
    if (extension === 'pdf') {
      // Procesar PDF con OCR/IA
      datosInterpretados = await procesarPDF(file, tipo);
    } else {
      // Procesar Excel con interpretación inteligente
      datosInterpretados = await procesarExcelInteligente(file, tipo);
    }

    // Importar los datos interpretados
    let resultado;
    if (tipo === 'tarifas') {
      resultado = await importarTarifas(datosInterpretados);
    } else if (tipo === 'comisiones') {
      resultado = await importarComisiones(datosInterpretados);
    } else {
      return NextResponse.json({ error: 'Tipo no válido' }, { status: 400 });
    }

    console.log(`✅ Importación completada: ${resultado.imported} registros`);

    return NextResponse.json({
      success: true,
      imported: resultado.imported,
      updated: resultado.updated,
      errors: resultado.errors,
      message: `${resultado.imported} registros importados exitosamente`
    });

  } catch (error) {
    console.error('❌ Error en importación inteligente:', error);
    
    return NextResponse.json({
      error: 'Error procesando archivo',
      details: error instanceof Error ? error.message : 'Error desconocido'
    }, { status: 500 });
  } finally {
    try {
      await prisma.$disconnect();
    } catch (e) {
      console.error('Error desconectando Prisma:', e);
    }
  }
}

async function procesarExcelInteligente(file: File, tipo: string) {
  console.log('📊 Procesando Excel con IA...');
  
  const buffer = Buffer.from(await file.arrayBuffer());
  const workbook = XLSX.read(buffer, { type: 'buffer' });
  
  // Obtener todas las hojas
  const hojasDisponibles = workbook.SheetNames;
  console.log('📋 Hojas disponibles:', hojasDisponibles);
  
  // Detectar la hoja más relevante usando IA/patrón matching
  const hojaRelevante = detectarHojaRelevante(hojasDisponibles, tipo);
  
  if (!hojaRelevante) {
    throw new Error(`No se encontró una hoja relevante para ${tipo} en el archivo`);
  }
  
  console.log(`📄 Usando hoja: ${hojaRelevante}`);
  
  const worksheet = workbook.Sheets[hojaRelevante];
  const datos = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
  
  // Analizar estructura e interpretar columnas con IA
  const datosInterpretados = await interpretarEstructuraConIA(datos, tipo);
  
  return datosInterpretados;
}

async function procesarPDF(file: File, tipo: string) {
  console.log('📄 Procesando PDF con OCR...');
  
  // Aquí iría la lógica de OCR para PDF
  // Por ahora retornamos un placeholder
  throw new Error('Procesamiento de PDF aún no implementado completamente');
}

function detectarHojaRelevante(hojas: string[], tipo: string): string | null {
  console.log(`🔍 Detectando hoja relevante para ${tipo}...`);
  
  if (tipo === 'tarifas') {
    // Buscar patrones comunes para hojas de tarifas
    const patronesTarifas = [
      /^TARIFAS?2?$/i,
      /^PRECIOS?$/i,
      /^OFERTAS?$/i,
      /^TARIF/i,
      /^Sheet1$/i // Fallback
    ];
    
    for (const patron of patronesTarifas) {
      const hoja = hojas.find(h => patron.test(h));
      if (hoja) return hoja;
    }
  } else if (tipo === 'comisiones') {
    // Buscar patrones comunes para hojas de comisiones
    const patronesComisiones = [
      /^COMISION(ES)?$/i,
      /^COMMISSION(S)?$/i,
      /^FEE(S)?$/i,
      /^Sheet1$/i // Fallback
    ];
    
    for (const patron of patronesComisiones) {
      const hoja = hojas.find(h => patron.test(h));
      if (hoja) return hoja;
    }
  }
  
  // Fallback: usar la primera hoja disponible
  return hojas[0] || null;
}

async function interpretarEstructuraConIA(datos: any[][], tipo: string) {
  console.log('🤖 Interpretando estructura con IA...');
  
  if (datos.length < 2) {
    throw new Error('El archivo no contiene suficientes datos');
  }
  
  // Encontrar la fila de headers
  let filaHeaders = 0;
  const posiblesHeaders = datos.slice(0, 5); // Revisar las primeras 5 filas
  
  for (let i = 0; i < posiblesHeaders.length; i++) {
    const fila = posiblesHeaders[i];
    if (fila && Array.isArray(fila) && fila.some(celda => 
      typeof celda === 'string' && celda.trim().length > 0
    )) {
      filaHeaders = i;
      break;
    }
  }
  
  const headers = datos[filaHeaders];
  const filasDatos = datos.slice(filaHeaders + 1).filter(fila => 
    fila && Array.isArray(fila) && fila.some(celda => celda !== null && celda !== undefined && celda !== '')
  );
  
  console.log(`📋 Headers detectados en fila ${filaHeaders}:`, headers);
  console.log(`📊 ${filasDatos.length} filas de datos encontradas`);
  
  if (tipo === 'tarifas') {
    return interpretarTarifas(headers, filasDatos);
  } else if (tipo === 'comisiones') {
    return interpretarComisiones(headers, filasDatos);
  }
  
  throw new Error(`Tipo no reconocido: ${tipo}`);
}

function interpretarTarifas(headers: any[], filasDatos: any[][]) {
  console.log('⚡ Interpretando datos de tarifas...');
  
  // Mapear headers a campos conocidos usando patrones
  const mapeoHeaders = mapearHeadersTarifas(headers);
  
  const tarifasInterpretadas = [];
  
  for (const fila of filasDatos) {
    try {
      const tarifa: any = {};
      
      // Mapear cada columna usando el mapeo de headers
      headers.forEach((header, index) => {
        const campo = mapeoHeaders[index];
        const valor = fila[index];
        
        if (campo && valor !== null && valor !== undefined && valor !== '') {
          if (campo.includes('energia') || campo.includes('potencia') || campo.includes('fee')) {
            // Convertir a número
            const numero = typeof valor === 'number' ? valor : parseFloat(String(valor).replace(/[^\d.,]/g, '').replace(',', '.'));
            if (!isNaN(numero)) {
              tarifa[campo] = numero;
            }
          } else {
            tarifa[campo] = String(valor).trim();
          }
        }
      });
      
      // Validar que tenga campos mínimos requeridos
      if (tarifa.comercializadora && tarifa.nombreOferta) {
        tarifasInterpretadas.push(tarifa);
      }
    } catch (error) {
      console.warn('⚠️ Error procesando fila de tarifa:', error);
    }
  }
  
  console.log(`✅ ${tarifasInterpretadas.length} tarifas interpretadas`);
  return tarifasInterpretadas;
}

function interpretarComisiones(headers: any[], filasDatos: any[][]) {
  console.log('💰 Interpretando datos de comisiones...');
  
  // Mapear headers a campos conocidos
  const mapeoHeaders = mapearHeadersComisiones(headers);
  
  const comisionesInterpretadas = [];
  
  for (const fila of filasDatos) {
    try {
      const comision: any = {};
      
      headers.forEach((header, index) => {
        const campo = mapeoHeaders[index];
        const valor = fila[index];
        
        if (campo && valor !== null && valor !== undefined && valor !== '') {
          if (campo.includes('comision') || campo.includes('porcentaje')) {
            const numero = typeof valor === 'number' ? valor : parseFloat(String(valor).replace(/[^\d.,]/g, '').replace(',', '.'));
            if (!isNaN(numero)) {
              comision[campo] = numero;
            }
          } else {
            comision[campo] = String(valor).trim();
          }
        }
      });
      
      if (comision.comercializadora) {
        comisionesInterpretadas.push(comision);
      }
    } catch (error) {
      console.warn('⚠️ Error procesando fila de comisión:', error);
    }
  }
  
  console.log(`✅ ${comisionesInterpretadas.length} comisiones interpretadas`);
  return comisionesInterpretadas;
}

function mapearHeadersTarifas(headers: any[]): { [index: number]: string } {
  const mapeo: { [index: number]: string } = {};
  
  // Patrones para detectar campos de tarifas
  const patrones = {
    comercializadora: /^(comercializadora|company|empresa|supplier)$/i,
    nombreOferta: /^(nombre|oferta|offer|name|tarifa.*nombre)$/i,
    tarifa: /^(tarifa|tipo.*tarifa|access.*tariff)$/i,
    tipoOferta: /^(tipo.*oferta|type|fixed|fijo|indexado)$/i,
    zona: /^(zona|zone|region)$/i,
    energiaP1: /^(energia.*p1|energy.*p1|price.*p1|precio.*p1|€.*kwh.*p1)$/i,
    energiaP2: /^(energia.*p2|energy.*p2|price.*p2|precio.*p2|€.*kwh.*p2)$/i,
    energiaP3: /^(energia.*p3|energy.*p3|price.*p3|precio.*p3|€.*kwh.*p3)$/i,
    potenciaP1: /^(potencia.*p1|power.*p1|pot.*p1|€.*kw.*p1)$/i,
    potenciaP2: /^(potencia.*p2|power.*p2|pot.*p2|€.*kw.*p2)$/i,
    feeEnergia: /^(fee.*energia|commission.*energy|comision.*energia)$/i,
    feePotencia: /^(fee.*potencia|commission.*power|comision.*potencia)$/i,
    costeGestion: /^(coste.*gestion|management.*cost|gestion)$/i
  };
  
  headers.forEach((header, index) => {
    if (!header) return;
    
    const headerStr = String(header).trim();
    
    // Buscar coincidencia con patrones
    for (const [campo, patron] of Object.entries(patrones)) {
      if (patron.test(headerStr)) {
        mapeo[index] = campo;
        break;
      }
    }
  });
  
  console.log('🗺️ Mapeo de headers para tarifas:', mapeo);
  return mapeo;
}

function mapearHeadersComisiones(headers: any[]): { [index: number]: string } {
  const mapeo: { [index: number]: string } = {};
  
  const patrones = {
    comercializadora: /^(comercializadora|company|empresa|supplier)$/i,
    tarifa: /^(tarifa|tipo.*tarifa|access.*tariff)$/i,
    zona: /^(zona|zone|region)$/i,
    tipoCliente: /^(tipo.*cliente|client.*type|customer.*type)$/i,
    comisionEnergia: /^(comision.*energia|commission.*energy|%.*energia)$/i,
    comisionPotencia: /^(comision.*potencia|commission.*power|%.*potencia)$/i,
    comisionFija: /^(comision.*fija|fixed.*commission|€.*mes)$/i
  };
  
  headers.forEach((header, index) => {
    if (!header) return;
    
    const headerStr = String(header).trim();
    
    for (const [campo, patron] of Object.entries(patrones)) {
      if (patron.test(headerStr)) {
        mapeo[index] = campo;
        break;
      }
    }
  });
  
  console.log('🗺️ Mapeo de headers para comisiones:', mapeo);
  return mapeo;
}

async function importarTarifas(tarifasInterpretadas: any[]) {
  console.log('📥 Importando tarifas a la base de datos...');
  
  let imported = 0;
  let updated = 0;
  const errors: string[] = [];
  
  // Obtener comercializadoras existentes para mapeo
  const comercializadoras = await prisma.comercializadora.findMany({
    select: { id: true, nombre: true }
  });
  
  for (const tarifaData of tarifasInterpretadas) {
    try {
      // Encontrar comercializadora
      const comercializadora = comercializadoras.find(c => 
        c.nombre.toLowerCase().includes(tarifaData.comercializadora.toLowerCase()) ||
        tarifaData.comercializadora.toLowerCase().includes(c.nombre.toLowerCase())
      );
      
      if (!comercializadora) {
        errors.push(`Comercializadora no encontrada: ${tarifaData.comercializadora}`);
        continue;
      }
      
      // Preparar datos de tarifa
      const tarifaParaDB = {
        comercializadoraId: comercializadora.id,
        nombreOferta: tarifaData.nombreOferta,
        tarifa: tarifaData.tarifa || '2.0TD',
        tipoOferta: tarifaData.tipoOferta || 'Fijo',
        zona: tarifaData.zona || 'Peninsula',
        energiaP1: tarifaData.energiaP1 || 0,
        energiaP2: tarifaData.energiaP2 || 0,
        energiaP3: tarifaData.energiaP3 || 0,
        potenciaP1: tarifaData.potenciaP1 || 0,
        potenciaP2: tarifaData.potenciaP2 || 0,
        tieneFee: !!(tarifaData.feeEnergia || tarifaData.feePotencia),
        feeEnergia: tarifaData.feeEnergia || 0,
        feePotencia: tarifaData.feePotencia || 0,
        costeGestion: tarifaData.costeGestion || 0
      };
      
      // Verificar si la tarifa ya existe (por nombre y comercializadora)
      const tarifaExistente = await prisma.tarifa.findFirst({
        where: {
          comercializadoraId: comercializadora.id,
          nombreOferta: tarifaParaDB.nombreOferta
        }
      });
      
      if (tarifaExistente) {
        // Actualizar tarifa existente
        await prisma.tarifa.update({
          where: { id: tarifaExistente.id },
          data: tarifaParaDB
        });
        updated++;
      } else {
        // Crear nueva tarifa
        await prisma.tarifa.create({
          data: tarifaParaDB
        });
        imported++;
      }
      
    } catch (error) {
      errors.push(`Error procesando ${tarifaData.nombreOferta}: ${error}`);
    }
  }
  
  return { imported, updated, errors };
}

async function importarComisiones(comisionesInterpretadas: any[]) {
  console.log('💰 Importando comisiones a la base de datos...');
  
  let imported = 0;
  let updated = 0;
  const errors: string[] = [];
  
  // Obtener comercializadoras para mapeo
  const comercializadoras = await prisma.comercializadora.findMany({
    select: { id: true, nombre: true }
  });
  
  for (const comisionData of comisionesInterpretadas) {
    try {
      const comercializadora = comercializadoras.find(c => 
        c.nombre.toLowerCase().includes(comisionData.comercializadora.toLowerCase()) ||
        comisionData.comercializadora.toLowerCase().includes(c.nombre.toLowerCase())
      );
      
      if (!comercializadora) {
        errors.push(`Comercializadora no encontrada: ${comisionData.comercializadora}`);
        continue;
      }
      
      const comisionParaDB = {
        comercializadoraId: comercializadora.id,
        tarifa: comisionData.tarifa || '2.0TD',
        zona: comisionData.zona || 'Peninsula',
        tipoCliente: comisionData.tipoCliente || 'General',
        comisionEnergia: comisionData.comisionEnergia || 0,
        comisionPotencia: comisionData.comisionPotencia || 0,
        comisionFija: comisionData.comisionFija || 0
      };
      
      // Verificar si la comisión ya existe
      const comisionExistente = await prisma.comision.findFirst({
        where: {
          comercializadoraId: comercializadora.id,
          tarifa: comisionParaDB.tarifa,
          zona: comisionParaDB.zona,
          tipoCliente: comisionParaDB.tipoCliente
        }
      });
      
      if (comisionExistente) {
        await prisma.comision.update({
          where: { id: comisionExistente.id },
          data: comisionParaDB
        });
        updated++;
      } else {
        await prisma.comision.create({
          data: comisionParaDB
        });
        imported++;
      }
      
    } catch (error) {
      errors.push(`Error procesando comisión: ${error}`);
    }
  }
  
  return { imported, updated, errors };
}
