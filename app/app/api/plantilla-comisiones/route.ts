

import { NextResponse } from 'next/server';
import * as XLSX from 'xlsx';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    // Crear datos de ejemplo para la plantilla de comisiones
    const plantillaComisiones = [
      {
        'Comercializadora': 'Iberdrola',
        'Tarifa': '2.0TD',
        'Zona': 'PENINSULA',
        'Tipo Cliente': 'Residencial',
        'Comisión Energía (%)': 25.00,
        'Comisión Potencia (%)': 45.00,
        'Fee Fijo Energía (€/MWh)': 15.00,
        'Fee Fijo Potencia (€/kW)': 8.50,
        'Mínimo Energía (€)': 2000,
        'Máximo Energía (€)': 15000,
        'Mínimo Potencia (€)': 500,
        'Máximo Potencia (€)': 5000,
        'Observaciones': 'Comisión estándar para clientes residenciales'
      },
      {
        'Comercializadora': 'Endesa',
        'Tarifa': '3.0TD',
        'Zona': 'PENINSULA',
        'Tipo Cliente': 'Empresas',
        'Comisión Energía (%)': 30.00,
        'Comisión Potencia (%)': 50.00,
        'Fee Fijo Energía (€/MWh)': 18.00,
        'Fee Fijo Potencia (€/kW)': 10.00,
        'Mínimo Energía (€)': 5000,
        'Máximo Energía (€)': 25000,
        'Mínimo Potencia (€)': 1000,
        'Máximo Potencia (€)': 10000,
        'Observaciones': 'Comisión empresarial con bonificaciones por volumen'
      },
      {
        'Comercializadora': 'Naturgy',
        'Tarifa': '6.1TD',
        'Zona': 'BALEARES',
        'Tipo Cliente': 'Industrial',
        'Comisión Energía (%)': 20.00,
        'Comisión Potencia (%)': 40.00,
        'Fee Fijo Energía (€/MWh)': 12.00,
        'Fee Fijo Potencia (€/kW)': 6.00,
        'Mínimo Energía (€)': 10000,
        'Máximo Energía (€)': 50000,
        'Mínimo Potencia (€)': 2000,
        'Máximo Potencia (€)': 15000,
        'Observaciones': 'Tarifas especiales para grandes consumidores industriales'
      }
    ];

    // Crear workbook
    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.json_to_sheet(plantillaComisiones);
    
    // Configurar anchos de columna
    const wscols = [
      { wch: 20 }, // Comercializadora
      { wch: 10 }, // Tarifa
      { wch: 12 }, // Zona
      { wch: 15 }, // Tipo Cliente
      { wch: 18 }, // Comisión Energía
      { wch: 18 }, // Comisión Potencia
      { wch: 20 }, // Fee Fijo Energía
      { wch: 20 }, // Fee Fijo Potencia
      { wch: 16 }, // Mínimo Energía
      { wch: 16 }, // Máximo Energía
      { wch: 16 }, // Mínimo Potencia
      { wch: 16 }, // Máximo Potencia
      { wch: 50 }  // Observaciones
    ];
    ws['!cols'] = wscols;

    // Añadir hoja al workbook
    XLSX.utils.book_append_sheet(wb, ws, "Plantilla_Comisiones");

    // Crear segunda hoja con instrucciones
    const instrucciones = [
      { 'INSTRUCCIONES': 'Formato de Importación de Comisiones Energéticas' },
      { 'INSTRUCCIONES': '' },
      { 'INSTRUCCIONES': 'Columnas requeridas:' },
      { 'INSTRUCCIONES': '• Comercializadora: Nombre de la comercializadora energética' },
      { 'INSTRUCCIONES': '• Tarifa: 2.0TD, 3.0TD, 6.1TD, 6.2TD, etc.' },
      { 'INSTRUCCIONES': '• Zona: PENINSULA, BALEARES, CANARIAS, CEUTA_MELILLA' },
      { 'INSTRUCCIONES': '• Tipo Cliente: Residencial, Empresas, Industrial, etc.' },
      { 'INSTRUCCIONES': '• Comisión Energía (%): Porcentaje sobre el coste de energía' },
      { 'INSTRUCCIONES': '• Comisión Potencia (%): Porcentaje sobre el coste de potencia' },
      { 'INSTRUCCIONES': '• Fee Fijo Energía (€/MWh): Comisión fija por MWh consumido' },
      { 'INSTRUCCIONES': '• Fee Fijo Potencia (€/kW): Comisión fija por kW contratado' },
      { 'INSTRUCCIONES': '• Mínimo/Máximo: Valores límite para aplicar comisiones' },
      { 'INSTRUCCIONES': '• Observaciones: Descripción opcional de condiciones especiales' },
      { 'INSTRUCCIONES': '' },
      { 'INSTRUCCIONES': 'Tipos de comisión:' },
      { 'INSTRUCCIONES': '• Porcentual: Se aplica el % sobre el coste total' },
      { 'INSTRUCCIONES': '• Fee Fijo: Se aplica una cantidad fija por unidad' },
      { 'INSTRUCCIONES': '• Mixta: Combina porcentaje + fee fijo' },
      { 'INSTRUCCIONES': '• Si no se especifica fee fijo, se aplica solo porcentual' },
      { 'INSTRUCCIONES': '' },
      { 'INSTRUCCIONES': 'Zonas geográficas:' },
      { 'INSTRUCCIONES': '• PENINSULA: España peninsular' },
      { 'INSTRUCCIONES': '• BALEARES: Islas Baleares' },
      { 'INSTRUCCIONES': '• CANARIAS: Islas Canarias' },
      { 'INSTRUCCIONES': '• CEUTA_MELILLA: Ceuta y Melilla' },
      { 'INSTRUCCIONES': '' },
      { 'INSTRUCCIONES': 'Notas importantes:' },
      { 'INSTRUCCIONES': '• Puede procesar miles de filas simultáneamente' },
      { 'INSTRUCCIONES': '• Si la comercializadora no existe, se creará automáticamente' },
      { 'INSTRUCCIONES': '• Los porcentajes deben estar entre 0 y 100' },
      { 'INSTRUCCIONES': '• Los fees fijos son opcionales (pueden estar vacíos)' },
      { 'INSTRUCCIONES': '• Las comisiones duplicadas se actualizarán con los nuevos valores' }
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
  }
}
