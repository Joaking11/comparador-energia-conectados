

import { NextResponse } from 'next/server';
import * as XLSX from 'xlsx';
import { PrismaClient } from '@prisma/client';

export const dynamic = 'force-dynamic';

export async function GET() {
  const prisma = new PrismaClient();
  
  try {
    // Obtener TODAS las comisiones reales de la base de datos
    const comisionesReales = await prisma.comisiones.findMany({
      include: {
        comercializadoras: true
      },
      orderBy: [
        { comercializadoras: { nombre: 'asc' } },
        { tarifa: 'asc' },
        { zona: 'asc' }
      ]
    });

    console.log(`📊 Generando plantilla con ${comisionesReales.length} comisiones reales`);

    // Convertir las comisiones reales al formato Excel
    const plantillaComisiones = comisionesReales.map((comision: any) => ({
      'Comercializadora': comision.comercializadoras?.nombre || 'Sin nombre',
      'Oferta': comision.nombreOferta || 'N/A',
      'Tarifa': comision.tarifa || 'N/A',
      'Zona': comision.zona || 'PENINSULA',
      'Tipo Oferta': comision.tipoOferta || 'Empresas',
      'Rango': comision.rango || 'Estándar',
      'Desde (€)': Number(comision.rangoDesde || 0),
      'Hasta (€)': Number(comision.rangoHasta || 0),
      'Comisión (%)': Number(comision.comision || 0),
      'Tiene Fee': comision.tieneFee ? 'SÍ' : 'NO',
      'Fee Energía (%)': Number(comision.porcentajeFeeEnergia || 0),
      'Fee Potencia (%)': Number(comision.porcentajeFeePotencia || 0),
      'Activa': comision.activa ? 'SÍ' : 'NO',
      'ID': comision.id
    }));

    // Si no hay comisiones, crear mensaje informativo
    if (plantillaComisiones.length === 0) {
      plantillaComisiones.push({
        'Comercializadora': '[SIN DATOS]',
        'Oferta': 'No hay comisiones en la base de datos',
        'Tarifa': 'N/A',
        'Zona': 'N/A',
        'Tipo Oferta': 'N/A',
        'Rango': 'N/A',
        'Desde (€)': 0,
        'Hasta (€)': 0,
        'Comisión (%)': 0,
        'Tiene Fee': 'NO',
        'Fee Energía (%)': 0,
        'Fee Potencia (%)': 0,
        'Activa': 'NO',
        'ID': 0
      });
    }

    // Crear workbook
    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.json_to_sheet(plantillaComisiones);
    
    // Configurar anchos de columna para las nuevas columnas
    const wscols = [
      { wch: 20 }, // Comercializadora
      { wch: 25 }, // Oferta
      { wch: 10 }, // Tarifa
      { wch: 12 }, // Zona
      { wch: 15 }, // Tipo Oferta
      { wch: 15 }, // Rango
      { wch: 12 }, // Desde (€)
      { wch: 12 }, // Hasta (€)
      { wch: 15 }, // Comisión (%)
      { wch: 12 }, // Tiene Fee
      { wch: 15 }, // Fee Energía (%)
      { wch: 15 }, // Fee Potencia (%)
      { wch: 8 },  // Activa
      { wch: 8 }   // ID
    ];
    ws['!cols'] = wscols;

    // Añadir hoja al workbook con nombre descriptivo
    XLSX.utils.book_append_sheet(wb, ws, `Comisiones_Reales_${new Date().toISOString().slice(0,10)}`);

    // Crear segunda hoja con instrucciones actualizadas
    const instrucciones = [
      { 'INSTRUCCIONES': '💰 PLANTILLA COMISIONES REALES - TODAS LAS COMISIONES DE LA BASE DE DATOS' },
      { 'INSTRUCCIONES': '' },
      { 'INSTRUCCIONES': 'Esta plantilla contiene TODAS las comisiones reales importadas en su sistema:' },
      { 'INSTRUCCIONES': `Total de comisiones exportadas: ${plantillaComisiones.length}` },
      { 'INSTRUCCIONES': '' },
      { 'INSTRUCCIONES': '📋 Descripción de columnas:' },
      { 'INSTRUCCIONES': '• Comercializadora: Nombre de la empresa energética' },
      { 'INSTRUCCIONES': '• Tarifa: Código oficial (2.0TD, 3.0TD, 6.1TD, etc.)' },
      { 'INSTRUCCIONES': '• Zona: PENINSULA, BALEARES, CANARIAS, CEUTA_MELILLA' },
      { 'INSTRUCCIONES': '• Tipo Cliente: Residencial, Empresas, Industrial, etc.' },
      { 'INSTRUCCIONES': '• Comisión Energía (%): Porcentaje sobre el coste de energía' },
      { 'INSTRUCCIONES': '• Comisión Potencia (%): Porcentaje sobre el coste de potencia' },
      { 'INSTRUCCIONES': '• Fee Fijo Energía (€/MWh): Comisión fija por MWh consumido' },
      { 'INSTRUCCIONES': '• Fee Fijo Potencia (€/kW): Comisión fija por kW contratado' },
      { 'INSTRUCCIONES': '• Mínimo/Máximo Energía/Potencia: Límites para aplicar comisiones' },
      { 'INSTRUCCIONES': '• Observaciones: Condiciones especiales y notas' },
      { 'INSTRUCCIONES': '• ID: Identificador único interno' },
      { 'INSTRUCCIONES': '' },
      { 'INSTRUCCIONES': '💰 Tipos de comisión:' },
      { 'INSTRUCCIONES': '• Porcentual: Se aplica el % sobre el coste calculado' },
      { 'INSTRUCCIONES': '• Fee Fijo: Cantidad fija por unidad (MWh o kW)' },
      { 'INSTRUCCIONES': '• Mixta: Combina porcentaje + fee fijo' },
      { 'INSTRUCCIONES': '• Los mínimos y máximos limitan la comisión total' },
      { 'INSTRUCCIONES': '' },
      { 'INSTRUCCIONES': '🗺️ Zonas geográficas españolas:' },
      { 'INSTRUCCIONES': '• PENINSULA: España peninsular (tarifas estándar)' },
      { 'INSTRUCCIONES': '• BALEARES: Islas Baleares (tarifas específicas)' },
      { 'INSTRUCCIONES': '• CANARIAS: Islas Canarias (sin IVA, con IGIC)' },
      { 'INSTRUCCIONES': '• CEUTA_MELILLA: Ceuta y Melilla (tarifas especiales)' },
      { 'INSTRUCCIONES': '' },
      { 'INSTRUCCIONES': '💡 Uso recomendado:' },
      { 'INSTRUCCIONES': '• Análisis de rentabilidad por comercializadora' },
      { 'INSTRUCCIONES': '• Comparativa de comisiones entre tarifas' },
      { 'INSTRUCCIONES': '• Exportar para análisis externos (Excel, Power BI)' },
      { 'INSTRUCCIONES': '• Backup de estructura de comisiones' },
      { 'INSTRUCCIONES': '' },
      { 'INSTRUCCIONES': '🔄 Para importar/actualizar comisiones usar:' },
      { 'INSTRUCCIONES': 'Admin -> Importación Inteligente -> Subir Excel original' }
    ];

    const wsInstrucciones = XLSX.utils.json_to_sheet(instrucciones);
    wsInstrucciones['!cols'] = [{ wch: 70 }];
    XLSX.utils.book_append_sheet(wb, wsInstrucciones, "Instrucciones");

    // Generar buffer del Excel
    const excelBuffer = XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' });

    // Crear respuesta con headers para descarga forzada
    const response = new NextResponse(excelBuffer, {
      status: 200,
      headers: {
        'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'Content-Disposition': 'attachment; filename="plantilla_comisiones.xlsx"',
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0',
        'Content-Length': excelBuffer.length.toString()
      }
    });

    return response;

  } catch (error) {
    console.error('Error creando plantilla comisiones:', error);
    return NextResponse.json(
      { error: 'Error creando plantilla de comisiones' },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}
