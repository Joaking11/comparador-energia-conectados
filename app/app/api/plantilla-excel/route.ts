
import { NextResponse } from 'next/server';
import * as XLSX from 'xlsx';
import { PrismaClient } from '@prisma/client';

export const dynamic = 'force-dynamic';

export async function GET() {
  const prisma = new PrismaClient();
  
  try {
    // Obtener TODAS las tarifas reales de la base de datos
    const tarifasReales = await prisma.tarifas.findMany({
      include: {
        comercializadoras: true
      },
      orderBy: [
        { comercializadoras: { nombre: 'asc' } },
        { tarifa: 'asc' },
        { nombreOferta: 'asc' }
      ]
    });

    console.log(`📊 Generando plantilla con ${tarifasReales.length} tarifas reales`);

    // Convertir las tarifas reales al formato Excel
    const plantillaData = tarifasReales.map((tarifa: any) => ({
      'Comercializadora': tarifa.comercializadoras?.nombre || 'Sin nombre',
      'Oferta': tarifa.nombreOferta || 'Oferta estándar',
      'Tarifa': tarifa.tarifa || 'N/A',
      'Tipo': tarifa.tipoOferta || 'Variable',
      'P1 Energía (€/MWh)': Number(tarifa.energiaP1 || 0),
      'P2 Energía (€/MWh)': Number(tarifa.energiaP2 || 0),
      'P3 Energía (€/MWh)': Number(tarifa.energiaP3 || 0),
      'P1 Potencia (€/kW año)': Number(tarifa.potenciaP1 || 0),
      'P2 Potencia (€/kW año)': Number(tarifa.potenciaP2 || 0),
      'P3 Potencia (€/kW año)': Number(tarifa.potenciaP3 || 0),
      'Zona': tarifa.zona || 'PENINSULA',
      'Tipo Cliente': tarifa.tipoCliente || 'Empresas',
      'Rango': tarifa.rango || 'Estándar',
      'Activa': tarifa.activa ? 'SÍ' : 'NO',
      'ID': tarifa.id
    }));

    // Si no hay tarifas, crear mensaje informativo
    if (plantillaData.length === 0) {
      plantillaData.push({
        'Comercializadora': '[SIN DATOS]',
        'Oferta': 'No hay tarifas en la base de datos',
        'Tarifa': 'N/A',
        'Tipo': 'N/A',
        'P1 Energía (€/MWh)': 0,
        'P2 Energía (€/MWh)': 0,
        'P3 Energía (€/MWh)': 0,
        'P1 Potencia (€/kW año)': 0,
        'P2 Potencia (€/kW año)': 0,
        'P3 Potencia (€/kW año)': 0,
        'Zona': 'PENINSULA',
        'Tipo Cliente': 'Empresas',
        'Rango': 'N/A',
        'Activa': 'NO',
        'ID': 0
      });
    }

    // Crear workbook
    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.json_to_sheet(plantillaData);
    
    // Configurar anchos de columna para todas las columnas reales
    const wscols = [
      { wch: 20 }, // Comercializadora
      { wch: 30 }, // Oferta
      { wch: 10 }, // Tarifa
      { wch: 12 }, // Tipo
      { wch: 16 }, // P1 Energía
      { wch: 16 }, // P2 Energía
      { wch: 16 }, // P3 Energía
      { wch: 18 }, // P1 Potencia
      { wch: 18 }, // P2 Potencia
      { wch: 18 }, // P3 Potencia
      { wch: 12 }, // Zona
      { wch: 15 }, // Tipo Cliente
      { wch: 15 }, // Rango
      { wch: 8 },  // Activa
      { wch: 8 }   // ID
    ];
    ws['!cols'] = wscols;

    // Añadir hoja al workbook con nombre descriptivo
    XLSX.utils.book_append_sheet(wb, ws, `Tarifas_Reales_${new Date().toISOString().slice(0,10)}`);

    // Crear segunda hoja con instrucciones actualizadas
    const instrucciones = [
      { 'INSTRUCCIONES': '📊 PLANTILLA TARIFAS REALES - TODAS LAS TARIFAS DE LA BASE DE DATOS' },
      { 'INSTRUCCIONES': '' },
      { 'INSTRUCCIONES': 'Esta plantilla contiene TODAS las tarifas reales importadas en su sistema:' },
      { 'INSTRUCCIONES': `Total de tarifas exportadas: ${plantillaData.length}` },
      { 'INSTRUCCIONES': '' },
      { 'INSTRUCCIONES': '📋 Descripción de columnas:' },
      { 'INSTRUCCIONES': '• Comercializadora: Nombre de la empresa energética' },
      { 'INSTRUCCIONES': '• Oferta: Nombre específico de la tarifa/producto' },
      { 'INSTRUCCIONES': '• Tarifa: Código oficial (2.0TD, 3.0TD, 6.1TD, etc.)' },
      { 'INSTRUCCIONES': '• Tipo: Fija, Variable, Indexada, etc.' },
      { 'INSTRUCCIONES': '• P1/P2/P3 Energía: Precios por periodo horario (€/MWh)' },
      { 'INSTRUCCIONES': '• P1/P2/P3 Potencia: Precios de término de potencia (€/kW año)' },
      { 'INSTRUCCIONES': '• Zona: PENINSULA, BALEARES, CANARIAS, CEUTA_MELILLA' },
      { 'INSTRUCCIONES': '• Tipo Cliente: Residencial, Empresas, Industrial, etc.' },
      { 'INSTRUCCIONES': '• Descripción: Detalles adicionales de la tarifa' },
      { 'INSTRUCCIONES': '• Activa: SÍ/NO - indica si la tarifa está disponible' },
      { 'INSTRUCCIONES': '• ID: Identificador único interno' },
      { 'INSTRUCCIONES': '' },
      { 'INSTRUCCIONES': '⚡ Periodos horarios:' },
      { 'INSTRUCCIONES': '• P1 (Punta): Horario de mayor demanda y precio' },
      { 'INSTRUCCIONES': '• P2 (Llano): Horario intermedio' },
      { 'INSTRUCCIONES': '• P3 (Valle): Horario de menor demanda y precio' },
      { 'INSTRUCCIONES': '' },
      { 'INSTRUCCIONES': '💡 Uso recomendado:' },
      { 'INSTRUCCIONES': '• Exportar para análisis externos (Excel, Power BI, etc.)' },
      { 'INSTRUCCIONES': '• Comparar precios entre comercializadoras' },
      { 'INSTRUCCIONES': '• Crear informes personalizados' },
      { 'INSTRUCCIONES': '• Backup de datos de tarifas' },
      { 'INSTRUCCIONES': '' },
      { 'INSTRUCCIONES': '🔄 Para importar/actualizar tarifas usar:' },
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
  } finally {
    await prisma.$disconnect();
  }
}
