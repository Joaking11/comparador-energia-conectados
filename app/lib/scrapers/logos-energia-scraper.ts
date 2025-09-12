

import { BaseScraper, ConsumptionData, ScrapingCredentials } from './base-scraper';

export class LogosEnergiaScraper extends BaseScraper {
  constructor(credentials: ScrapingCredentials) {
    super('LOGOS_ENERGIA', {
      ...credentials,
      url_portal: credentials.url_portal || 'https://cconsulting.logosenergia.wolfcrm.es/documents/'
    });
  }

  protected async login(): Promise<boolean> {
    try {
      if (!this.page) throw new Error('Página no inicializada');

      console.log('🔐 Iniciando login en Logos Energía...');

      // Navegar a la página de login
      await this.page.goto(this.credentials.url_portal, { 
        waitUntil: 'networkidle2',
        timeout: 30000 
      });

      // Esperar a que cargue la página de login
      await this.waitForSelector('input[placeholder="User"], input[name="user"], input[type="text"]');
      
      // Limpiar e introducir usuario
      await this.page.evaluate(() => {
        const userInput = document.querySelector('input[placeholder="User"], input[name="user"], input[type="text"]') as HTMLInputElement;
        if (userInput) userInput.value = '';
      });

      await this.safeType('input[placeholder="User"], input[name="user"], input[type="text"]', this.credentials.usuario);
      await this.wait(500);

      // Introducir contraseña
      await this.page.evaluate(() => {
        const passInput = document.querySelector('input[placeholder="Password"], input[name="password"], input[type="password"]') as HTMLInputElement;
        if (passInput) passInput.value = '';
      });

      await this.safeType('input[placeholder="Password"], input[name="password"], input[type="password"]', this.credentials.password);
      await this.wait(500);

      // Hacer clic en el botón de login
      await this.safeClick('button[type="submit"], .btn, input[value="Sign in"], button:contains("Sign in")');

      // Esperar a que se complete el login - buscar elementos que indiquen que estamos dentro
      try {
        // Esperar por algún elemento que indique que el login fue exitoso
        await this.page.waitForFunction(
          () => {
            // Verificar si hay elementos del panel de control o menú
            return document.querySelector('[class*="menu"], [class*="dashboard"], [class*="nav"], .sidebar, #sidebar') !== null ||
                   // O si ya no estamos en la página de login
                   !document.querySelector('input[placeholder="User"], input[placeholder="Password"]');
          },
          { timeout: 15000 }
        );

        console.log('✅ Login exitoso en Logos Energía');
        return true;

      } catch (waitError) {
        console.error('❌ Timeout esperando confirmación de login');
        
        // Verificar si hay mensajes de error
        const errorElement = await this.page.$('.error, .alert-danger, [class*="error"]');
        if (errorElement) {
          const errorText = await this.page.evaluate(el => el.textContent, errorElement);
          console.error('❌ Error de login:', errorText);
        }
        
        return false;
      }

    } catch (error) {
      console.error('❌ Error durante el login:', error);
      return false;
    }
  }

  protected async extractConsumptionData(cups: string): Promise<ConsumptionData> {
    try {
      if (!this.page) throw new Error('Página no inicializada');

      console.log(`📊 Buscando datos para CUPS: ${cups}`);

      // Buscar y acceder al menú de Consulta de SIPS
      await this.navigateToSipsConsulta();

      // Introducir el CUPS en el campo de búsqueda
      await this.searchByCups(cups);

      // Extraer los datos de la página de resultados
      const consumptionData = await this.extractDataFromResultsPage(cups);

      return consumptionData;

    } catch (error) {
      console.error('❌ Error extrayendo datos de consumo:', error);
      throw error;
    }
  }

  private async navigateToSipsConsulta(): Promise<void> {
    try {
      console.log('🧭 Navegando a Consulta de SIPS...');

      // Buscar el menú - puede ser un enlace, botón o elemento de navegación
      const menuSelectors = [
        'a[href*="sips"], a:contains("SIPS"), a:contains("Consulta")',
        '[class*="menu"] a, [class*="nav"] a',
        'li a, .menu-item a',
        'a[title*="SIPS"], a[title*="Consulta"]'
      ];

      let menuFound = false;
      for (const selector of menuSelectors) {
        try {
          await this.page.waitForSelector(selector, { timeout: 3000 });
          
          // Buscar específicamente elementos que contengan "SIPS" o "Consulta"
          const elements = await this.page.$$(selector);
          for (const element of elements) {
            const text = await this.page.evaluate(el => el.textContent?.toLowerCase() || '', element);
            if (text.includes('sips') || text.includes('consulta')) {
              await element.click();
              menuFound = true;
              break;
            }
          }
          
          if (menuFound) break;
        } catch (e) {
          // Continuar con el siguiente selector
        }
      }

      if (!menuFound) {
        // Si no encontramos el menú específico, buscar cualquier enlace que pueda llevarnos allí
        console.log('ℹ️  Menú específico no encontrado, explorando opciones disponibles...');
        
        // Imprimir todos los enlaces disponibles para debug
        const links = await this.page.$$eval('a', anchors => 
          anchors.map(anchor => ({
            text: anchor.textContent?.trim(),
            href: anchor.href
          })).filter(link => link.text && link.text.length > 0)
        );
        
        console.log('🔍 Enlaces disponibles:', links);
        
        throw new Error('No se pudo encontrar el menú de Consulta de SIPS');
      }

      // Esperar a que cargue la página de consulta
      await this.wait(2000);
      console.log('✅ Navegación a Consulta de SIPS completada');

    } catch (error) {
      console.error('❌ Error navegando a Consulta de SIPS:', error);
      throw error;
    }
  }

  private async searchByCups(cups: string): Promise<void> {
    try {
      console.log(`🔍 Buscando CUPS: ${cups}`);

      // Buscar el campo de entrada para el CUPS
      const inputSelectors = [
        'input[name*="cups"], input[id*="cups"]',
        'input[placeholder*="CUPS"], input[placeholder*="cups"]',
        'input[type="text"]',
        'input.form-control, input.input'
      ];

      let inputFound = false;
      for (const selector of inputSelectors) {
        try {
          await this.page.waitForSelector(selector, { timeout: 3000 });
          
          // Verificar si este input es para CUPS
          const inputs = await this.page.$$(selector);
          for (const input of inputs) {
            const placeholder = await this.page.evaluate(el => el.placeholder?.toLowerCase() || '', input);
            const name = await this.page.evaluate(el => el.name?.toLowerCase() || '', input);
            const id = await this.page.evaluate(el => el.id?.toLowerCase() || '', input);
            
            if (placeholder.includes('cups') || name.includes('cups') || id.includes('cups') || 
                placeholder.includes('código') || name.includes('codigo')) {
              
              // Limpiar e introducir el CUPS
              await input.click();
              await this.page.evaluate(el => (el as HTMLInputElement).value = '', input);
              await input.type(cups);
              inputFound = true;
              break;
            }
          }
          
          if (inputFound) break;
        } catch (e) {
          // Continuar con el siguiente selector
        }
      }

      if (!inputFound) {
        // Si no encontramos un campo específico, usar el primer campo de texto disponible
        console.log('ℹ️  Campo CUPS específico no encontrado, usando primer campo de texto...');
        await this.safeType('input[type="text"]:first-child', cups);
      }

      // Buscar y hacer clic en el botón de búsqueda
      const searchButtons = [
        'button[type="submit"], input[type="submit"]',
        'button:contains("Buscar"), button:contains("Search")',
        'button:contains("Consultar"), button:contains("Ver")',
        '.btn, .button'
      ];

      for (const btnSelector of searchButtons) {
        try {
          await this.page.waitForSelector(btnSelector, { timeout: 2000 });
          await this.safeClick(btnSelector);
          break;
        } catch (e) {
          // Continuar con el siguiente
        }
      }

      // Esperar a que carguen los resultados
      await this.wait(3000);
      console.log('✅ Búsqueda de CUPS completada');

    } catch (error) {
      console.error('❌ Error en búsqueda por CUPS:', error);
      throw error;
    }
  }

  private async extractDataFromResultsPage(cups: string): Promise<ConsumptionData> {
    try {
      console.log('📋 Extrayendo datos de la página de resultados...');

      // Esperar a que carguen los datos
      await this.wait(2000);

      // Intentar extraer datos de tablas o elementos estructurados
      const data = await this.page.evaluate(() => {
        const tables = document.querySelectorAll('table');
        const divs = document.querySelectorAll('div[class*="data"], div[class*="result"]');
        const spans = document.querySelectorAll('span, td, div');
        
        const extractedData: any = {};
        const textContent = document.body.textContent || '';
        
        // Buscar patrones de datos de energía y potencia
        const patterns = {
          consumoP1: /P1.*?(\d+[.,]\d+).*?kWh/gi,
          consumoP2: /P2.*?(\d+[.,]\d+).*?kWh/gi,
          consumoP3: /P3.*?(\d+[.,]\d+).*?kWh/gi,
          potenciaP1: /P1.*?(\d+[.,]\d+).*?kW/gi,
          potenciaP2: /P2.*?(\d+[.,]\d+).*?kW/gi,
          potenciaP3: /P3.*?(\d+[.,]\d+).*?kW/gi,
          consumoTotal: /total.*?(\d+[.,]\d+).*?kWh/gi,
          potenciaMaxima: /máxima?.*?(\d+[.,]\d+).*?kW/gi
        };

        // Aplicar patrones
        for (const [key, pattern] of Object.entries(patterns)) {
          const match = pattern.exec(textContent);
          if (match && match[1]) {
            extractedData[key] = parseFloat(match[1].replace(',', '.'));
          }
        }

        return {
          rawData: textContent.substring(0, 1000), // Primeros 1000 caracteres para debug
          extractedData,
          tables: Array.from(tables).map(table => table.textContent?.substring(0, 500)),
          divs: Array.from(divs).map(div => div.textContent?.substring(0, 200))
        };
      });

      console.log('📊 Datos extraídos:', data);

      // Crear el objeto de respuesta
      const consumptionData: ConsumptionData = {
        cups: cups,
        distribuidora: 'LOGOS_ENERGIA',
        consumoTotal: data.extractedData.consumoTotal || 0,
        consumoP1: data.extractedData.consumoP1,
        consumoP2: data.extractedData.consumoP2,
        consumoP3: data.extractedData.consumoP3,
        potenciaP1: data.extractedData.potenciaP1,
        potenciaP2: data.extractedData.potenciaP2,
        potenciaP3: data.extractedData.potenciaP3,
        potenciaMaxima: data.extractedData.potenciaMaxima,
        periodo_analizado: new Date().toISOString(),
        datos_raw: data
      };

      console.log('✅ Datos de consumo extraídos exitosamente');
      return consumptionData;

    } catch (error) {
      console.error('❌ Error extrayendo datos de resultados:', error);
      throw error;
    }
  }
}
