
import { ScrapingCredentials } from './base-scraper';
import { IberdrolaScraper } from './iberdrola-scraper';
import { EndesaScraper } from './endesa-scraper';

export class ScraperFactory {
  static createScraper(distribuidora: string, credentials: ScrapingCredentials) {
    const distribuidoraNormalizada = distribuidora.toUpperCase().trim();
    
    switch (distribuidoraNormalizada) {
      case 'IBERDROLA':
        return new IberdrolaScraper(credentials);
        
      case 'ENDESA':
        return new EndesaScraper(credentials);
        
      // Aquí se pueden añadir más distribuidoras
      case 'NATURGY':
      case 'EDP':
      case 'VIESGO':
      case 'UFD':
        // Por ahora usar el scraper de Iberdrola como base y adaptarlo
        return new IberdrolaScraper({
          ...credentials,
          url_portal: getPortalUrl(distribuidoraNormalizada)
        });
        
      default:
        throw new Error(`Distribuidora no soportada: ${distribuidora}`);
    }
  }

  static getSupportedDistribuidoras(): string[] {
    return [
      'IBERDROLA',
      'ENDESA', 
      'NATURGY',
      'EDP',
      'VIESGO',
      'UFD'
    ];
  }

  static getPortalInfo(distribuidora: string) {
    const info: Record<string, { name: string; url: string; description: string }> = {
      'IBERDROLA': {
        name: 'Iberdrola',
        url: 'https://www.iberdrola.es/clientes/zona-clientes',
        description: 'Área de clientes de Iberdrola'
      },
      'ENDESA': {
        name: 'Endesa',
        url: 'https://www.endesa.com/es/clientes/area-clientes', 
        description: 'Área de clientes de Endesa'
      },
      'NATURGY': {
        name: 'Naturgy',
        url: 'https://www.naturgy.es/area_privada',
        description: 'Área privada de Naturgy'
      },
      'EDP': {
        name: 'EDP',
        url: 'https://www.edpenergia.es/es/clientes',
        description: 'Área de clientes de EDP'
      },
      'VIESGO': {
        name: 'Viesgo',
        url: 'https://www.viesgo.com/area-clientes',
        description: 'Área de clientes de Viesgo'
      },
      'UFD': {
        name: 'Unión Fenosa Distribución',
        url: 'https://www.ufd.es/clientes',
        description: 'Portal de clientes UFD'
      }
    };

    return info[distribuidora.toUpperCase()] || null;
  }
}

function getPortalUrl(distribuidora: string): string {
  const urls: Record<string, string> = {
    'NATURGY': 'https://www.naturgy.es/area_privada',
    'EDP': 'https://www.edpenergia.es/es/clientes',
    'VIESGO': 'https://www.viesgo.com/area-clientes', 
    'UFD': 'https://www.ufd.es/clientes'
  };

  return urls[distribuidora] || 'https://www.iberdrola.es/clientes/zona-clientes';
}
