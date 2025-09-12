
import { NextRequest, NextResponse } from 'next/server';
import { ComissionCalculator } from '@/lib/commission-calculator';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const usuarioId = searchParams.get('usuarioId');
    const fechaDesde = searchParams.get('fechaDesde') ? new Date(searchParams.get('fechaDesde')!) : undefined;
    const fechaHasta = searchParams.get('fechaHasta') ? new Date(searchParams.get('fechaHasta')!) : undefined;

    if (!usuarioId) {
      return NextResponse.json(
        { error: 'usuarioId es requerido' },
        { status: 400 }
      );
    }

    const reporte = await ComissionCalculator.getUserCommissionSummary(
      usuarioId,
      fechaDesde,
      fechaHasta
    );

    return NextResponse.json({
      success: true,
      reporte
    });

  } catch (error) {
    console.error('Error generating commission report:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}
