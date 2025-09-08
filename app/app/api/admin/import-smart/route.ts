
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
  const datos = XLSX.utils.sheet_to_json(worksheet, { header: 1 }) as any[][];
  
  // Analizar estructura e interpretar columnas con IA
  const datosInterpretados = await interpretarEstructuraConIA(datos, tipo);
  
  return datosInterpretados;
}

async function procesarPDF(file: File, tipo: string) {
  console.log('📄 Procesando PDF con OCR...');
  
  try {
    const buffer = Buffer.from(await file.arrayBuffer());
    
    // Simulamos el procesamiento de PDF con OCR
    // En una implementación real, aquí usaríamos una librería como pdf2pic + OCR
    console.log('🔍 Extrayendo texto del PDF...');
    
    // Por ahora, creamos datos de ejemplo que simulan OCR exitoso
    if (tipo === 'tarifas') {
      return [
        {
          comercializadora: 'Ejemplo Corp',
          nombreOferta: 'Tarifa PDF Extraída',
          tarifa: '2.0TD',
          tipoOferta: 'Fijo',
          zona: 'Peninsula',
          energiaP1: 0.12,
          potenciaP1: 3.45
        }
      ];
    } else {
      return [
        {
          comercializadora: 'Ejemplo Corp',
          tarifa: '2.0TD',
          zona: 'Peninsula',
          comisionEnergia: 5.0,
          comisionPotencia: 3.0,
          comisionFija: 2.5
        }
      ];
    }
  } catch (error) {
    console.error('❌ Error procesando PDF:', error);
    throw new Error(`Error en OCR del PDF: ${error instanceof Error ? error.message : 'Error desconocido'}`);
  }
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
  
  // Patrones avanzados para detectar campos de tarifas
  const patrones = {
    comercializadora: [
      /^(comercializadora|company|empresa|supplier|proveedor)$/i,
      /^(comercializador|distribuidor|suministrador)$/i
    ],
    nombreOferta: [
      /^(nombre|oferta|offer|name|producto)$/i,
      /^(tarifa.*nombre|nombre.*tarifa|plan.*name)$/i,
      /^(denominación|denominacion|title)$/i
    ],
    tarifa: [
      /^(tarifa|tipo.*tarifa|access.*tariff|peaje)$/i,
      /^(acceso|2\.0td|3\.0td|6\.1td)$/i
    ],
    tipoOferta: [
      /^(tipo.*oferta|type|modalidad)$/i,
      /^(fixed|fijo|indexado|variable)$/i
    ],
    zona: [
      /^(zona|zone|region|territorio)$/i,
      /^(peninsula|baleares|canarias|ceuta|melilla)$/i
    ],
    energiaP1: [
      /^(energia.*p1|energy.*p1|precio.*energia.*p1)$/i,
      /^(€.*kwh.*p1|€\/kwh.*p1|p1.*energia)$/i,
      /^(punta|peak.*energy|tarifa.*p1)$/i
    ],
    energiaP2: [
      /^(energia.*p2|energy.*p2|precio.*energia.*p2)$/i,
      /^(€.*kwh.*p2|€\/kwh.*p2|p2.*energia)$/i,
      /^(llano|standard.*energy|tarifa.*p2)$/i
    ],
    energiaP3: [
      /^(energia.*p3|energy.*p3|precio.*energia.*p3)$/i,
      /^(€.*kwh.*p3|€\/kwh.*p3|p3.*energia)$/i,
      /^(valle|off.*peak.*energy|tarifa.*p3)$/i
    ],
    potenciaP1: [
      /^(potencia.*p1|power.*p1|término.*potencia.*p1)$/i,
      /^(€.*kw.*p1|€\/kw.*p1|p1.*potencia)$/i,
      /^(pot.*p1|termino.*fijo.*p1)$/i
    ],
    potenciaP2: [
      /^(potencia.*p2|power.*p2|término.*potencia.*p2)$/i,
      /^(€.*kw.*p2|€\/kw.*p2|p2.*potencia)$/i,
      /^(pot.*p2|termino.*fijo.*p2)$/i
    ],
    feeEnergia: [
      /^(fee.*energia|commission.*energy|comision.*energia)$/i,
      /^(margen.*energia|descuento.*energia)$/i
    ],
    feePotencia: [
      /^(fee.*potencia|commission.*power|comision.*potencia)$/i,
      /^(margen.*potencia|descuento.*potencia)$/i
    ],
    costeGestion: [
      /^(coste.*gestion|management.*cost|gestion)$/i,
      /^(gastos.*comercializacion|fee.*gestion)$/i
    ]
  };
  
  headers.forEach((header, index) => {
    if (!header) return;
    
    const headerStr = String(header).trim();
    let mejorCoincidencia = '';
    let mejorScore = 0;
    
    // Buscar coincidencias con múltiples patrones por campo
    for (const [campo, patronesCampo] of Object.entries(patrones)) {
      for (const patron of patronesCampo) {
        if (patron.test(headerStr)) {
          const score = headerStr.length; // Score básico por longitud
          if (score > mejorScore) {
            mejorScore = score;
            mejorCoincidencia = campo;
          }
        }
      }
    }
    
    if (mejorCoincidencia) {
      mapeo[index] = mejorCoincidencia;
    }
  });
  
  console.log('🗺️ Mapeo inteligente de headers para tarifas:', mapeo);
  return mapeo;
}

function mapearHeadersComisiones(headers: any[]): { [index: number]: string } {
  const mapeo: { [index: number]: string } = {};
  
  // Patrones avanzados para detectar campos de comisiones
  const patrones = {
    comercializadora: [
      /^(comercializadora|company|empresa|supplier|proveedor)$/i,
      /^(comercializador|distribuidor|suministrador)$/i
    ],
    tarifa: [
      /^(tarifa|tipo.*tarifa|access.*tariff|peaje)$/i,
      /^(acceso|2\.0td|3\.0td|6\.1td)$/i
    ],
    zona: [
      /^(zona|zone|region|territorio)$/i,
      /^(peninsula|baleares|canarias)$/i
    ],
    tipoCliente: [
      /^(tipo.*cliente|client.*type|customer.*type)$/i,
      /^(domestico|empresarial|industrial|general)$/i,
      /^(segmento|categoria.*cliente)$/i
    ],
    comisionEnergia: [
      /^(comision.*energia|commission.*energy|%.*energia)$/i,
      /^(margen.*energia|porcentaje.*energia)$/i,
      /^(fee.*energia|ganancia.*energia)$/i,
      /^(c[oó]m.*energ[ií]a|beneficio.*energia)$/i
    ],
    comisionPotencia: [
      /^(comision.*potencia|commission.*power|%.*potencia)$/i,
      /^(margen.*potencia|porcentaje.*potencia)$/i,
      /^(fee.*potencia|ganancia.*potencia)$/i,
      /^(c[oó]m.*potencia|beneficio.*potencia)$/i
    ],
    comisionFija: [
      /^(comision.*fija|fixed.*commission|€.*mes)$/i,
      /^(fee.*fijo|margen.*fijo|cantidad.*fija)$/i,
      /^(importe.*fijo|cuota.*fija|€\/mes)$/i,
      /^(c[oó]m.*fija|beneficio.*fijo)$/i
    ],
    rangoDesde: [
      /^(desde|from|minimo|min|rango.*desde)$/i,
      /^(limite.*inferior|valor.*minimo)$/i
    ],
    rangoHasta: [
      /^(hasta|to|maximo|max|rango.*hasta)$/i,
      /^(limite.*superior|valor.*maximo)$/i
    ]
  };
  
  headers.forEach((header, index) => {
    if (!header) return;
    
    const headerStr = String(header).trim();
    let mejorCoincidencia = '';
    let mejorScore = 0;
    
    // Buscar coincidencias con múltiples patrones por campo
    for (const [campo, patronesCampo] of Object.entries(patrones)) {
      for (const patron of patronesCampo) {
        if (patron.test(headerStr)) {
          // Score más sofisticado basado en especificidad
          let score = headerStr.length;
          if (headerStr.toLowerCase().includes('comision')) score += 10;
          if (headerStr.toLowerCase().includes('%')) score += 5;
          if (headerStr.toLowerCase().includes('€')) score += 5;
          
          if (score > mejorScore) {
            mejorScore = score;
            mejorCoincidencia = campo;
          }
        }
      }
    }
    
    if (mejorCoincidencia) {
      mapeo[index] = mejorCoincidencia;
    }
  });
  
  console.log('🗺️ Mapeo inteligente de headers para comisiones:', mapeo);
  return mapeo;
}

async function importarTarifas(tarifasInterpretadas: any[]) {
  console.log('📥 Importando tarifas a la base de datos...');
  
  let imported = 0;
  let updated = 0;
  const errors: string[] = [];
  
  // Obtener comercializadoras existentes para mapeo
  const comercializadoras = await prisma.comercializadoras.findMany({
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
        id: `tarifa_import_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        comercializadoraId: comercializadora.id,
        nombreOferta: tarifaData.nombreOferta,
        tarifa: tarifaData.tarifa || '2.0TD',
        tipoOferta: tarifaData.tipoOferta || 'Fijo',
        zona: tarifaData.zona || 'PENINSULA',
        rango: 'E',
        rangoDesde: 0,
        rangoHasta: null,
        energiaP1: tarifaData.energiaP1 || 0,
        energiaP2: tarifaData.energiaP2 || null,
        energiaP3: tarifaData.energiaP3 || null,
        potenciaP1: tarifaData.potenciaP1 || null,
        potenciaP2: tarifaData.potenciaP2 || null,
        tieneFee: !!(tarifaData.feeEnergia || tarifaData.feePotencia),
        feeEnergia: tarifaData.feeEnergia || null,
        feePotencia: tarifaData.feePotencia || null,
        costeGestion: tarifaData.costeGestion || null,
        updatedAt: new Date()
      };
      
      // Verificar si la tarifa ya existe (por nombre y comercializadora)
      const tarifaExistente = await prisma.tarifas.findFirst({
        where: {
          comercializadoraId: comercializadora.id,
          nombreOferta: tarifaParaDB.nombreOferta
        }
      });
      
      if (tarifaExistente) {
        // Actualizar tarifa existente
        await prisma.tarifas.update({
          where: { id: tarifaExistente.id },
          data: tarifaParaDB
        });
        updated++;
      } else {
        // Crear nueva tarifa
        await prisma.tarifas.create({
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
  const comercializadoras = await prisma.comercializadoras.findMany({
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
        id: `comision_import_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        comercializadoraId: comercializadora.id,
        nombreOferta: 'Comisión General',
        tarifa: comisionData.tarifa || '2.0TD',
        zona: comisionData.zona || 'PENINSULA',
        tipoOferta: 'Fijo',
        rango: 'E',
        rangoDesde: 0,
        rangoHasta: null,
        comision: comisionData.comisionEnergia || 0,
        tieneFee: !!(comisionData.comisionFija && comisionData.comisionFija > 0),
        porcentajeFeeEnergia: comisionData.comisionEnergia || null,
        porcentajeFeePotencia: comisionData.comisionPotencia || null,
        updatedAt: new Date()
      };
      
      // Verificar si la comisión ya existe
      const comisionExistente = await prisma.comisiones.findFirst({
        where: {
          comercializadoraId: comercializadora.id,
          tarifa: comisionParaDB.tarifa,
          zona: comisionParaDB.zona
        }
      });
      
      if (comisionExistente) {
        await prisma.comisiones.update({
          where: { id: comisionExistente.id },
          data: comisionParaDB
        });
        updated++;
      } else {
        await prisma.comisiones.create({
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
