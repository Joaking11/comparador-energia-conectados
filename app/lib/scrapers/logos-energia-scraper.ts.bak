

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

      // Esperar a que cargue la página de login - usando placeholder específicos
      await this.waitForSelector('input[placeholder="User"]');
      
      // Introducir usuario
      await this.page.focus('input[placeholder="User"]');
      await this.page.evaluate(() => {
        const userInput = document.querySelector('input[placeholder="User"]') as HTMLInputElement;
        if (userInput) userInput.value = '';
      });
      await this.page.type('input[placeholder="User"]', this.credentials.usuario);
      await this.wait(500);

      // Introducir contraseña
      await this.page.focus('input[placeholder="Password"]');
      await this.page.evaluate(() => {
        const passInput = document.querySelector('input[placeholder="Password"]') as HTMLInputElement;
        if (passInput) passInput.value = '';
      });
      await this.page.type('input[placeholder="Password"]', this.credentials.password);
      await this.wait(500);

      // Hacer clic en el botón "Sign in" - buscar por texto
      await this.page.evaluate(() => {
        const buttons = Array.from(document.querySelectorAll('button, input[type="submit"]'));
        const signInButton = buttons.find(btn => 
          btn.textContent?.includes('Sign in') || 
          (btn as HTMLInputElement).value?.includes('Sign in')
        ) as HTMLElement;
        if (signInButton) {
          signInButton.click();
        } else {
          // Si no encontramos por texto, usar el primer botón submit
          const submitBtn = document.querySelector('button[type="submit"], input[type="submit"]') as HTMLElement;
          if (submitBtn) submitBtn.click();
        }
      });

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

      // Paso 1: Buscar botón/menú en esquina superior izquierda
      console.log('🔍 Buscando botón de menú en esquina superior izquierda...');
      
      const menuButtonSelectors = [
        // Típicos selectores para botones de menú en esquina superior izquierda
        '.navbar-toggle, .menu-toggle, .hamburger',
        '[class*="menu-button"], [class*="nav-toggle"]',
        'button[class*="menu"], button[class*="nav"]',
        '.sidebar-toggle, .offcanvas-toggle',
        // También buscar por posición (elementos en top-left)
        'button:first-child, .navbar button:first-child'
      ];

      let menuOpened = false;
      for (const selector of menuButtonSelectors) {
        try {
          console.log(`Probando selector: ${selector}`);
          await this.page.waitForSelector(selector, { timeout: 2000 });
          await this.page.click(selector);
          await this.wait(1000);
          menuOpened = true;
          break;
        } catch (e) {
          console.log(`Selector ${selector} no funciona`);
          // Continuar con el siguiente
        }
      }

      // Si no encontramos botón específico, buscar cualquier elemento clickeable en esquina superior izquierda
      if (!menuOpened) {
        console.log('🔍 Probando enfoque alternativo - buscar elementos clickeables en esquina superior...');
        
        await this.page.evaluate(() => {
          // Buscar elementos en la parte superior izquierda de la página
          const elements = Array.from(document.querySelectorAll('*'));
          const clickableElements = elements.filter(el => {
            const rect = el.getBoundingClientRect();
            const styles = window.getComputedStyle(el);
            return rect.top < 100 && rect.left < 200 && 
                   (el.tagName === 'BUTTON' || el.tagName === 'A' || 
                    styles.cursor === 'pointer' || el.getAttribute('onclick'));
          });
          
          // Intentar hacer click en el primer elemento clickeable encontrado
          if (clickableElements.length > 0) {
            console.log('Elemento clickeable encontrado:', clickableElements[0]);
            (clickableElements[0] as HTMLElement).click();
            return true;
          }
          return false;
        });
        
        await this.wait(2000);
      }

      // Paso 2: Buscar y hacer click en "Consulta de SIPS" en el menú desplegado
      console.log('🔍 Buscando "Consulta de SIPS" en el menú...');
      
      const sipsConsultaFound = await this.page.evaluate(() => {
        // Buscar todos los elementos que podrían contener el texto "SIPS" o "Consulta"
        const allElements = Array.from(document.querySelectorAll('*'));
        const sipsElements = allElements.filter(el => {
          const text = el.textContent?.toLowerCase() || '';
          return text.includes('sips') || 
                 (text.includes('consulta') && text.includes('sips'));
        });
        
        console.log('Elementos con SIPS encontrados:', sipsElements.map(el => el.textContent?.trim()));
        
        // Hacer click en el primer elemento que contenga "consulta de sips" o similar
        const sipsConsulta = sipsElements.find(el => {
          const text = el.textContent?.toLowerCase() || '';
          return text.includes('consulta') || text.includes('sips');
        });
        
        if (sipsConsulta && (sipsConsulta.tagName === 'A' || sipsConsulta.tagName === 'BUTTON' || 
                            sipsConsulta.parentElement?.tagName === 'A')) {
          console.log('Haciendo click en:', sipsConsulta.textContent?.trim());
          (sipsConsulta as HTMLElement).click();
          return true;
        }
        
        return false;
      });

      if (!sipsConsultaFound) {
        throw new Error('No se pudo encontrar el enlace "Consulta de SIPS"');
      }

      // Esperar a que cargue la página de consulta SIPS
      await this.wait(3000);
      console.log('✅ Navegación a Consulta de SIPS completada');

    } catch (error) {
      console.error('❌ Error navegando a Consulta de SIPS:', error);
      throw error;
    }
  }

  private async searchByCups(cups: string): Promise<void> {
    try {
      console.log(`🔍 Buscando campo CUPS en la parte superior...`);

      // Según las instrucciones del usuario: "un rectángulo blanco en la parte de arriba que pone cups"
      // Buscar específicamente por elementos que contengan "cups" en su texto o etiqueta
      
      const cupsFieldFound = await this.page.evaluate((cupsValue) => {
        // Buscar elementos que contengan "cups" cerca
        const allElements = Array.from(document.querySelectorAll('*'));
        
        // Buscar labels o texto que diga "cups"
        const cupsLabels = allElements.filter(el => {
          const text = el.textContent?.toLowerCase() || '';
          return text.includes('cups') && el.tagName !== 'INPUT';
        });
        
        console.log('Elementos que contienen "cups":', cupsLabels.map(el => el.textContent?.trim()));
        
        // Para cada label/texto que dice "cups", buscar el input más cercano
        for (const label of cupsLabels) {
          // Buscar input hermano o hijo
          let inputElement = label.querySelector('input[type="text"]') as HTMLInputElement;
          
          if (!inputElement) {
            // Buscar input siguiente hermano
            inputElement = label.nextElementSibling as HTMLInputElement;
            if (inputElement?.tagName !== 'INPUT') {
              inputElement = label.parentElement?.querySelector('input[type="text"]') as HTMLInputElement;
            }
          }
          
          // También buscar inputs cerca por posición
          if (!inputElement) {
            const labelRect = label.getBoundingClientRect();
            const inputs = Array.from(document.querySelectorAll('input[type="text"]')) as HTMLInputElement[];
            inputElement = inputs.find(input => {
              const inputRect = input.getBoundingClientRect();
              // Buscar input que esté cerca (máximo 100px de distancia)
              const distance = Math.abs(inputRect.top - labelRect.top) + Math.abs(inputRect.left - labelRect.left);
              return distance < 100;
            }) || null;
          }
          
          if (inputElement) {
            console.log('Campo CUPS encontrado, introduciendo valor...');
            inputElement.focus();
            inputElement.value = '';
            inputElement.value = cupsValue;
            // Disparar eventos para asegurar que la aplicación detecte el cambio
            inputElement.dispatchEvent(new Event('input', { bubbles: true }));
            inputElement.dispatchEvent(new Event('change', { bubbles: true }));
            return true;
          }
        }
        
        // Si no encontramos por label, buscar por placeholder o name
        const inputs = Array.from(document.querySelectorAll('input[type="text"]')) as HTMLInputElement[];
        const cupsInput = inputs.find(input => 
          input.placeholder?.toLowerCase().includes('cups') ||
          input.name?.toLowerCase().includes('cups') ||
          input.id?.toLowerCase().includes('cups')
        );
        
        if (cupsInput) {
          console.log('Campo CUPS encontrado por placeholder/name, introduciendo valor...');
          cupsInput.focus();
          cupsInput.value = '';
          cupsInput.value = cupsValue;
          cupsInput.dispatchEvent(new Event('input', { bubbles: true }));
          cupsInput.dispatchEvent(new Event('change', { bubbles: true }));
          return true;
        }
        
        return false;
      }, cups);

      if (!cupsFieldFound) {
        // Como último recurso, usar el primer campo de texto visible en la parte superior
        console.log('⚠️ Campo CUPS específico no encontrado, usando primer campo visible...');
        
        await this.page.evaluate((cupsValue) => {
          const inputs = Array.from(document.querySelectorAll('input[type="text"]')) as HTMLInputElement[];
          const visibleInput = inputs.find(input => {
            const rect = input.getBoundingClientRect();
            return rect.top < 300 && rect.width > 0 && rect.height > 0; // En la parte superior y visible
          });
          
          if (visibleInput) {
            visibleInput.focus();
            visibleInput.value = '';
            visibleInput.value = cupsValue;
            visibleInput.dispatchEvent(new Event('input', { bubbles: true }));
            visibleInput.dispatchEvent(new Event('change', { bubbles: true }));
          }
        }, cups);
      }

      await this.wait(1000);

      // Buscar botón de búsqueda/consultar
      console.log('🔍 Buscando botón de búsqueda...');
      
      const searchTriggered = await this.page.evaluate(() => {
        // Buscar botones que puedan ejecutar la búsqueda
        const buttons = Array.from(document.querySelectorAll('button, input[type="submit"], input[type="button"]'));
        
        const searchButton = buttons.find(btn => {
          const text = (btn.textContent || (btn as HTMLInputElement).value || '').toLowerCase();
          return text.includes('buscar') || text.includes('consultar') || 
                 text.includes('search') || text.includes('submit') ||
                 text.includes('ver') || text.includes('obtener');
        });
        
        if (searchButton) {
          console.log('Botón de búsqueda encontrado:', searchButton.textContent || (searchButton as HTMLInputElement).value);
          (searchButton as HTMLElement).click();
          return true;
        }
        
        // Si no hay botón específico, probar Enter en el campo CUPS
        const inputs = Array.from(document.querySelectorAll('input[type="text"]'));
        if (inputs.length > 0) {
          const event = new KeyboardEvent('keydown', { key: 'Enter', bubbles: true });
          inputs[0].dispatchEvent(event);
          return true;
        }
        
        return false;
      });

      // Esperar a que carguen los resultados
      await this.wait(5000);
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
      await this.wait(3000);

      // Capturar screenshot de la página de resultados para debug
      if (this.page) {
        try {
          await this.page.screenshot({
            path: `/tmp/logos-energia-results-${cups}.png`,
            fullPage: true
          });
          console.log('📷 Screenshot guardado para debug');
        } catch (e) {
          console.log('⚠️ No se pudo guardar screenshot');
        }
      }

      // Extraer toda la información disponible de la página
      const data = await this.page.evaluate((cupsValue) => {
        const result: any = {
          cups: cupsValue,
          timestamp: new Date().toISOString(),
          extractedData: {},
          fullPageContent: '',
          tables: [],
          downloadLinks: [],
          estruturedData: {}
        };

        // Capturar todo el contenido textual de la página
        result.fullPageContent = document.body.textContent || '';
        
        // Buscar y extraer tablas
        const tables = Array.from(document.querySelectorAll('table'));
        result.tables = tables.map((table, index) => ({
          index: index,
          content: table.outerHTML,
          textContent: table.textContent?.trim(),
          rows: Array.from(table.querySelectorAll('tr')).map(row => 
            Array.from(row.querySelectorAll('td, th')).map(cell => cell.textContent?.trim())
          )
        }));

        // Buscar enlaces de descarga (Excel, PDF)
        const links = Array.from(document.querySelectorAll('a[href], button[onclick]'));
        result.downloadLinks = links
          .map(link => ({
            text: link.textContent?.trim() || '',
            href: (link as HTMLAnchorElement).href || '',
            onclick: link.getAttribute('onclick') || '',
            title: link.getAttribute('title') || ''
          }))
          .filter(link => {
            const text = link.text.toLowerCase();
            const href = link.href.toLowerCase();
            return text.includes('excel') || text.includes('pdf') || text.includes('descargar') ||
                   text.includes('download') || href.includes('.xlsx') || href.includes('.pdf');
          });

        // Buscar patrones específicos de datos energéticos
        const patterns = {
          // Consumo por periodos
          consumoP1: [/P1.*?(\d+[.,]\d+).*?kWh/gi, /Periodo\s*1.*?(\d+[.,]\d+)/gi],
          consumoP2: [/P2.*?(\d+[.,]\d+).*?kWh/gi, /Periodo\s*2.*?(\d+[.,]\d+)/gi],
          consumoP3: [/P3.*?(\d+[.,]\d+).*?kWh/gi, /Periodo\s*3.*?(\d+[.,]\d+)/gi],
          consumoP4: [/P4.*?(\d+[.,]\d+).*?kWh/gi, /Periodo\s*4.*?(\d+[.,]\d+)/gi],
          consumoP5: [/P5.*?(\d+[.,]\d+).*?kWh/gi, /Periodo\s*5.*?(\d+[.,]\d+)/gi],
          consumoP6: [/P6.*?(\d+[.,]\d+).*?kWh/gi, /Periodo\s*6.*?(\d+[.,]\d+)/gi],
          
          // Potencia por periodos
          potenciaP1: [/P1.*?(\d+[.,]\d+).*?kW[^h]/gi, /Potencia.*P1.*?(\d+[.,]\d+)/gi],
          potenciaP2: [/P2.*?(\d+[.,]\d+).*?kW[^h]/gi, /Potencia.*P2.*?(\d+[.,]\d+)/gi],
          potenciaP3: [/P3.*?(\d+[.,]\d+).*?kW[^h]/gi, /Potencia.*P3.*?(\d+[.,]\d+)/gi],
          potenciaP4: [/P4.*?(\d+[.,]\d+).*?kW[^h]/gi, /Potencia.*P4.*?(\d+[.,]\d+)/gi],
          potenciaP5: [/P5.*?(\d+[.,]\d+).*?kW[^h]/gi, /Potencia.*P5.*?(\d+[.,]\d+)/gi],
          potenciaP6: [/P6.*?(\d+[.,]\d+).*?kW[^h]/gi, /Potencia.*P6.*?(\d+[.,]\d+)/gi],
          
          // Totales
          consumoTotal: [/total.*?(\d+[.,]\d+).*?kWh/gi, /Consumo.*total.*?(\d+[.,]\d+)/gi],
          potenciaMaxima: [/máxima?.*?(\d+[.,]\d+).*?kW/gi, /Potencia.*máxima.*?(\d+[.,]\d+)/gi]
        };

        // Aplicar todos los patrones
        for (const [key, patternArray] of Object.entries(patterns)) {
          for (const pattern of patternArray) {
            const match = pattern.exec(result.fullPageContent);
            if (match && match[1]) {
              result.extractedData[key] = parseFloat(match[1].replace(',', '.'));
              break; // Usar el primer match encontrado
            }
          }
        }

        // Buscar datos específicos en tablas
        result.tables.forEach((table, tableIndex) => {
          if (table.textContent.toLowerCase().includes('consumo') || 
              table.textContent.toLowerCase().includes('potencia')) {
            
            result.estructuredData[`tabla_${tableIndex}`] = {
              type: 'consumption_table',
              data: table.rows
            };
          }
        });

        // Buscar información adicional relevante
        const additionalInfo = {
          distribuidora: '',
          comercializadora: '',
          tipoTarifa: '',
          periodoFacturacion: ''
        };

        // Patrones para información adicional
        const infoPatterns = {
          distribuidora: /distribuidora?:?\s*([A-Za-z\s]+)/gi,
          comercializadora: /comercializadora?:?\s*([A-Za-z\s]+)/gi,
          tarifa: /tarifa?:?\s*([0-9.A-Z]+)/gi,
          periodo: /periodo?:?\s*([0-9\/\-\s]+)/gi
        };

        for (const [key, pattern] of Object.entries(infoPatterns)) {
          const match = pattern.exec(result.fullPageContent);
          if (match && match[1]) {
            additionalInfo[key as keyof typeof additionalInfo] = match[1].trim();
          }
        }

        result.additionalInfo = additionalInfo;
        
        return result;
      }, cups);

      console.log('📊 Datos completos extraídos:', {
        extractedData: data.extractedData,
        tablesFound: data.tables.length,
        downloadLinksFound: data.downloadLinks.length
      });

      // Intentar descargar archivos Excel/PDF si están disponibles
      if (data.downloadLinks.length > 0) {
        console.log('🔽 Enlaces de descarga encontrados:', data.downloadLinks);
        try {
          await this.downloadFiles(data.downloadLinks, cups);
        } catch (error) {
          console.log('⚠️ Error descargando archivos:', error);
        }
      }

      // Crear el objeto de respuesta con todos los datos
      const consumptionData: ConsumptionData = {
        cups: cups,
        distribuidora: 'LOGOS_ENERGIA', 
        consumoTotal: data.extractedData.consumoTotal || 0,
        consumoP1: data.extractedData.consumoP1,
        consumoP2: data.extractedData.consumoP2,
        consumoP3: data.extractedData.consumoP3,
        consumoP4: data.extractedData.consumoP4,
        consumoP5: data.extractedData.consumoP5,
        consumoP6: data.extractedData.consumoP6,
        potenciaP1: data.extractedData.potenciaP1,
        potenciaP2: data.extractedData.potenciaP2,
        potenciaP3: data.extractedData.potenciaP3,
        potenciaP4: data.extractedData.potenciaP4,
        potenciaP5: data.extractedData.potenciaP5,
        potenciaP6: data.extractedData.potenciaP6,
        potenciaMaxima: data.extractedData.potenciaMaxima,
        periodo_analizado: new Date().toISOString(),
        datos_raw: {
          ...data,
          screenshot_path: `/tmp/logos-energia-results-${cups}.png`
        }
      };

      console.log('✅ Datos de consumo extraídos y guardados exitosamente');
      return consumptionData;

    } catch (error) {
      console.error('❌ Error extrayendo datos de resultados:', error);
      throw error;
    }
  }

  private async downloadFiles(downloadLinks: any[], cups: string): Promise<void> {
    try {
      console.log('🔽 Intentando descargar archivos...');
      
      for (const link of downloadLinks.slice(0, 2)) { // Máximo 2 descargas
        try {
          if (link.href) {
            // Navegar al enlace de descarga
            await this.page!.goto(link.href, { waitUntil: 'networkidle2', timeout: 10000 });
            console.log(`📥 Archivo descargado: ${link.text}`);
          } else if (link.onclick) {
            // Ejecutar onclick
            await this.page!.evaluate((onclick) => {
              eval(onclick);
            }, link.onclick);
            await this.wait(3000);
            console.log(`📥 Descarga ejecutada: ${link.text}`);
          }
        } catch (error) {
          console.log(`⚠️ Error descargando ${link.text}:`, error);
        }
      }
    } catch (error) {
      console.log('⚠️ Error en proceso de descarga:', error);
    }
  }
}
