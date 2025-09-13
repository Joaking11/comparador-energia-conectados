
import { NextRequest, NextResponse } from 'next/server';
import { ScraperFactory } from '@/lib/scrapers/scraper-factory';

export async function GET(request: NextRequest) {
  try {
    const distribuidorasSoportadas = ScraperFactory.getSupportedDistribuidoras();
    
    const distribuidorasInfo = distribuidorasSoportadas.map(dist => {
      const info = ScraperFactory.getPortalInfo(dist);
      return {
        codigo: dist,
        nombre: info?.name || dist,
        url_portal: info?.url || '',
        descripcion: info?.description || `Portal de ${dist}`,
        soportada: true
      };
    });

    return NextResponse.json(distribuidorasInfo);

  } catch (error) {
    console.error('Error obteniendo distribuidoras:', error);
    return NextResponse.json(
      { error: 'Error obteniendo lista de distribuidoras' },
      { status: 500 }
    );
  }
}
