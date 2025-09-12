
import puppeteer, { Browser, Page } from 'puppeteer';

export interface ScrapingCredentials {
  usuario: string;
  password: string;
  url_portal: string;
}

export interface ConsumptionData {
  cups: string;
  distribuidora: string;
  consumoP1?: number;
  consumoP2?: number;
  consumoP3?: number;
  consumoP4?: number;
  consumoP5?: number;
  consumoP6?: number;
  consumoTotal: number;
  potenciaP1?: number;
  potenciaP2?: number;
  potenciaP3?: number;
  potenciaP4?: number;
  potenciaP5?: number;
  potenciaP6?: number;
  potenciaMaxima?: number;
  periodo_analizado?: string;
  datos_raw?: any;
}

export interface ScrapingResult {
  success: boolean;
  data?: ConsumptionData;
  error?: string;
  mensaje?: string;
}

export abstract class BaseScraper {
  protected browser: Browser | null = null;
  protected page: Page | null = null;
  
  constructor(
    protected empresa: string, // Puede ser distribuidora o comercializadora
    protected credentials: ScrapingCredentials
  ) {}

  /**
   * Inicializa el navegador con configuración optimizada
   */
  protected async initBrowser(): Promise<void> {
    console.log(`🔧 Inicializando navegador para ${this.empresa}...`);
    
    this.browser = await puppeteer.launch({
      headless: true, // Cambiar a false para debugging
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--disable-gpu',
        '--no-zygote',
        '--disable-extensions',
        '--disable-background-networking',
        '--disable-background-timer-throttling',
        '--disable-renderer-backgrounding',
        '--disable-features=TranslateUI,BlinkGenPropertyTrees',
        '--user-agent=Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
      ],
      defaultViewport: {
        width: 1366,
        height: 768
      },
      timeout: 30000
    });

    this.page = await this.browser.newPage();
    
    // Configurar headers para parecer un navegador real
    await this.page.setExtraHTTPHeaders({
      'Accept-Language': 'es-ES,es;q=0.9,en;q=0.8',
      'Accept-Encoding': 'gzip, deflate, br',
      'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
      'Connection': 'keep-alive',
      'Upgrade-Insecure-Requests': '1'
    });
    
    // Timeout para operaciones de página
    await this.page.setDefaultTimeout(15000);
    await this.page.setDefaultNavigationTimeout(30000);
  }

  /**
   * Cierra el navegador
   */
  protected async closeBrowser(): Promise<void> {
    if (this.page) {
      await this.page.close();
      this.page = null;
    }
    if (this.browser) {
      await this.browser.close();
      this.browser = null;
    }
  }

  /**
   * Método principal para ejecutar el scraping
   */
  public async scrape(cups: string): Promise<ScrapingResult> {
    try {
      await this.initBrowser();
      
      console.log(`🌐 Iniciando scraping para ${this.empresa} - CUPS: ${cups}`);
      
      // Login
      const loginSuccess = await this.login();
      if (!loginSuccess) {
        return {
          success: false,
          error: 'Error en el proceso de login'
        };
      }

      // Obtener datos de consumo
      const data = await this.extractConsumptionData(cups);
      
      return {
        success: true,
        data,
        mensaje: 'Datos obtenidos exitosamente'
      };

    } catch (error) {
      console.error(`❌ Error en scraping ${this.empresa}:`, error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Error desconocido',
        mensaje: 'Error durante el proceso de scraping'
      };
    } finally {
      await this.closeBrowser();
    }
  }

  /**
   * Implementar login específico para cada distribuidora
   */
  protected abstract login(): Promise<boolean>;

  /**
   * Implementar extracción de datos específica para cada distribuidora
   */
  protected abstract extractConsumptionData(cups: string): Promise<ConsumptionData>;

  /**
   * Utilidad para esperar a que aparezca un elemento
   */
  protected async waitForSelector(selector: string, timeout: number = 10000): Promise<void> {
    if (!this.page) throw new Error('Página no inicializada');
    await this.page.waitForSelector(selector, { timeout });
  }

  /**
   * Utilidad para hacer clic en un elemento de forma segura
   */
  protected async safeClick(selector: string): Promise<void> {
    if (!this.page) throw new Error('Página no inicializada');
    await this.page.waitForSelector(selector);
    await this.page.click(selector);
  }

  /**
   * Utilidad para escribir texto de forma segura
   */
  protected async safeType(selector: string, text: string): Promise<void> {
    if (!this.page) throw new Error('Página no inicializada');
    await this.page.waitForSelector(selector);
    await this.page.type(selector, text);
  }

  /**
   * Esperar un tiempo específico
   */
  protected async wait(milliseconds: number): Promise<void> {
    await new Promise(resolve => setTimeout(resolve, milliseconds));
  }
}
