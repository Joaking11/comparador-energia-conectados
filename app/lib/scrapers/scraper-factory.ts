
import { ScrapingCredentials } from './base-scraper';
import { IberdrolaScraper } from './iberdrola-scraper';
import { EndesaScraper } from './endesa-scraper';
import { LogosEnergiaScraper } from './logos-energia-scraper';

export class ScraperFactory {
  static createScraper(empresa: string, credentials: ScrapingCredentials) {
    const empresaNormalizada = empresa.toUpperCase().trim();
    
    switch (empresaNormalizada) {
      // Distribuidoras
      case 'IBERDROLA':
        return new IberdrolaScraper(credentials);
        
      case 'ENDESA':
        return new EndesaScraper(credentials);
        
      // Comercializadoras
      case 'LOGOS_ENERGIA':
      case 'LOGOS ENERGIA':
      case 'LOGOS':
        return new LogosEnergiaScraper(credentials);
        
      // Otras distribuidoras
      case 'NATURGY':
      case 'EDP':
      case 'VIESGO':
      case 'UFD':
        // Por ahora usar el scraper de Iberdrola como base y adaptarlo
        return new IberdrolaScraper({
          ...credentials,
          url_portal: getPortalUrl(empresaNormalizada)
        });
        
      default:
        throw new Error(`Empresa no soportada: ${empresa}`);
    }
  }

  static getSupportedEmpresas(): string[] {
    return [
      // Distribuidoras
      'IBERDROLA',
      'ENDESA', 
      'NATURGY',
      'EDP',
      'VIESGO',
      'UFD',
      // Comercializadoras
      'LOGOS_ENERGIA'
    ];
  }

  static getPortalInfo(empresa: string) {
    const info: Record<string, { name: string; url: string; description: string }> = {
      // Distribuidoras
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
      },
      // Comercializadoras
      'LOGOS_ENERGIA': {
        name: 'Logos Energía',
        url: 'https://cconsulting.logosenergia.wolfcrm.es/documents/',
        description: 'Portal de consulta Logos Energía - Consulta de SIPS'
      }
    };

    return info[empresa.toUpperCase()] || null;
  }
}

function getPortalUrl(empresa: string): string {
  const urls: Record<string, string> = {
    'NATURGY': 'https://www.naturgy.es/area_privada',
    'EDP': 'https://www.edpenergia.es/es/clientes',
    'VIESGO': 'https://www.viesgo.com/area-clientes', 
    'UFD': 'https://www.ufd.es/clientes',
    'LOGOS_ENERGIA': 'https://cconsulting.logosenergia.wolfcrm.es/documents/'
  };

  return urls[empresa] || 'https://www.iberdrola.es/clientes/zona-clientes';
}
