
import { NextResponse } from 'next/server';
import * as XLSX from 'xlsx';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    // Crear datos de ejemplo para la plantilla
    const plantillaData = [
      {
        'Comercializadora': 'Iberdrola',
        'Oferta': 'Tarifa Verde Fija',
        'Tarifa': '2.0TD',
        'Tipo': 'Fija',
        'Precio Energía (€/kWh)': 0.185,
        'Término Potencia (€/kW mes)': 3.45,
        'Descripción': '100% energía renovable, precio fijo durante 12 meses',
        'Comisión Tipo': 'E',
        'Comisión Valor': 25,
        'Comisión Mínimo': 2000,
        'Comisión Máximo': 15000
      },
      {
        'Comercializadora': 'Endesa',
        'Oferta': 'Tempo Indexado',
        'Tarifa': '3.0TD',
        'Tipo': 'Indexada',
        'Precio Energía (€/kWh)': 0.140,
        'Término Potencia (€/kW mes)': 4.20,
        'Descripción': 'Para empresas medianas, precio según pool',
        'Comisión Tipo': 'P',
        'Comisión Valor': 45,
        'Comisión Mínimo': 15,
        'Comisión Máximo': 100
      },
      {
        'Comercializadora': 'Naturgy',
        'Oferta': 'Tarifa Digital',
        'Tarifa': '2.0TD',
        'Tipo': 'Indexada',
        'Precio Energía (€/kWh)': 0.160,
        'Término Potencia (€/kW mes)': 3.15,
        'Descripción': 'Gestión 100% digital con descuentos',
        'Comisión Tipo': 'E',
        'Comisión Valor': 26,
        'Comisión Mínimo': 2200,
        'Comisión Máximo': 14000
      }
    ];

    // Crear workbook
    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.json_to_sheet(plantillaData);
    
    // Configurar anchos de columna
    const wscols = [
      { wch: 20 }, // Comercializadora
      { wch: 25 }, // Oferta
      { wch: 10 }, // Tarifa
      { wch: 12 }, // Tipo
      { wch: 18 }, // Precio Energía
      { wch: 22 }, // Término Potencia
      { wch: 40 }, // Descripción
      { wch: 15 }, // Comisión Tipo
      { wch: 15 }, // Comisión Valor
      { wch: 17 }, // Comisión Mínimo
      { wch: 17 }  // Comisión Máximo
    ];
    ws['!cols'] = wscols;

    // Añadir hoja al workbook
    XLSX.utils.book_append_sheet(wb, ws, "Plantilla");

    // Crear segunda hoja con instrucciones
    const instrucciones = [
      { 'INSTRUCCIONES': 'Formato de Importación de Comercializadoras y Ofertas' },
      { 'INSTRUCCIONES': '' },
      { 'INSTRUCCIONES': 'Columnas requeridas:' },
      { 'INSTRUCCIONES': '• Comercializadora: Nombre de la comercializadora energética' },
      { 'INSTRUCCIONES': '• Oferta: Nombre de la oferta específica' },
      { 'INSTRUCCIONES': '• Tarifa: 2.0TD, 3.0TD, 6.1TD, 6.2TD, etc.' },
      { 'INSTRUCCIONES': '• Tipo: Fija, Indexada, Híbrida' },
      { 'INSTRUCCIONES': '• Precio Energía (€/kWh): Precio por kWh en euros' },
      { 'INSTRUCCIONES': '• Término Potencia (€/kW mes): Precio potencia mensual' },
      { 'INSTRUCCIONES': '• Descripción: Descripción opcional de la oferta' },
      { 'INSTRUCCIONES': '• Comisión Tipo: E (Energía) o P (Potencia)' },
      { 'INSTRUCCIONES': '• Comisión Valor: Valor de la comisión' },
      { 'INSTRUCCIONES': '• Comisión Mínimo: Valor mínimo para aplicar comisión' },
      { 'INSTRUCCIONES': '• Comisión Máximo: Valor máximo (opcional)' },
      { 'INSTRUCCIONES': '' },
      { 'INSTRUCCIONES': 'Notas importantes:' },
      { 'INSTRUCCIONES': '• Si la comercializadora no existe, se creará automáticamente' },
      { 'INSTRUCCIONES': '• Si la oferta ya existe, se actualizará con los nuevos datos' },
      { 'INSTRUCCIONES': '• Los precios deben ser mayores que 0' },
      { 'INSTRUCCIONES': '• Comisión Tipo E = €/MWh, Tipo P = €/kW' },
      { 'INSTRUCCIONES': '• Puede procesar miles de filas de una vez' }
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
        'Content-Disposition': 'attachment; filename="plantilla_tarifas.xlsx"',
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0',
        'Content-Length': excelBuffer.length.toString()
      }
    });

    return response;

  } catch (error) {
    console.error('Error creando plantilla Excel:', error);
    return NextResponse.json(
      { error: 'Error creando plantilla Excel' },
      { status: 500 }
    );
  }
}
