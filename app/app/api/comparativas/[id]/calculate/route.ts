
import { NextResponse } from 'next/server';
import { CalculationEngine } from '@/lib/calculation-engine';

export const dynamic = 'force-dynamic';

export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    console.log('🔢 Iniciando recálculo para comparativa:', params.id);

    // Ejecutar el motor de cálculo real
    const results = await CalculationEngine.calculateAndSave(params.id);

    console.log(`✅ Recálculo completado: ${results.length} ofertas procesadas`);

    return NextResponse.json({ 
      success: true,
      message: `Recálculo completado exitosamente`,
      resultados: results.length,
      ofertas: results
    });

  } catch (error) {
    console.error('❌ Error en recálculo:', error);
    
    return NextResponse.json(
      { 
        error: 'Error procesando recálculo',
        details: error instanceof Error ? error.message : 'Error desconocido'
      },
      { status: 500 }
    );
  }
}
