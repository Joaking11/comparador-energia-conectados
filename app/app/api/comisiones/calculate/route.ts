
import { NextRequest, NextResponse } from 'next/server';
import { ComissionCalculator } from '@/lib/commission-calculator';

export async function POST(request: NextRequest) {
  try {
    const { usuarioId, comercializadoraId, nombreOferta, tarifaAcceso, importeAnual } = await request.json();

    if (!usuarioId || !comercializadoraId || !nombreOferta || !tarifaAcceso || !importeAnual) {
      return NextResponse.json(
        { error: 'Faltan parámetros requeridos' },
        { status: 400 }
      );
    }

    const result = await ComissionCalculator.calculateCommission({
      usuarioId,
      comercializadoraId,
      nombreOferta,
      tarifaAcceso,
      importeAnual
    });

    return NextResponse.json({
      success: true,
      comision: result
    });

  } catch (error) {
    console.error('Error calculating commission:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Error interno del servidor' },
      { status: 500 }
    );
  }
}
