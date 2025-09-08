
import { PrismaClient, Tarifa, Comision, Comparativa } from '@prisma/client';

const prisma = new PrismaClient();

export interface CalculationResult {
  tarifaId: string;
  comercializadora: string;
  nombreOferta: string;
  tarifa: string;
  tipoOferta: string;
  importeCalculado: number;
  ahorroAnual: number;
  comisionGanada: number;
  detalleCalculo: {
    totalEnergia: number;
    totalPotencia: number;
    totalBase: number;
    impuestoElectricidad: number;
    iva: number;
    total: number;
  };
}

export class CalculationEngine {
  /**
   * Calcula todas las ofertas disponibles para una comparativa específica
   */
  static async calculateOffers(comparativaId: string, parametrosPersonalizados?: any): Promise<CalculationResult[]> {
    try {
      console.log('🔢 Iniciando cálculo de ofertas para comparativa:', comparativaId);
      
      // Obtener datos de la comparativa
      const comparativa = await prisma.comparativa.findUnique({
        where: { id: comparativaId }
      });

      if (!comparativa) {
        throw new Error(`Comparativa ${comparativaId} no encontrada`);
      }

      console.log('📊 Datos de comparativa cargados:', {
        consumoAnual: comparativa.consumoAnualElectricidad,
        potenciaMaxima: Math.max(
          comparativa.potenciaP1 || 0,
          comparativa.potenciaP2 || 0,
          comparativa.potenciaP3 || 0,
          comparativa.potenciaP4 || 0,
          comparativa.potenciaP5 || 0,
          comparativa.potenciaP6 || 0
        ),
        tarifa: comparativa.tarifaAccesoElectricidad
      });

      // Obtener todas las tarifas aplicables
      const tarifasAplicables = await this.findApplicableTarifas(comparativa);
      console.log(`📋 Encontradas ${tarifasAplicables.length} tarifas aplicables`);

      // Calcular cada tarifa
      const resultados: CalculationResult[] = [];
      
      for (const tarifa of tarifasAplicables) {
        try {
          const resultado = await this.calculateSingleTarifa(comparativa, tarifa, parametrosPersonalizados);
          if (resultado) {
            resultados.push(resultado);
          }
        } catch (error) {
          console.log(`❌ Error calculando tarifa ${tarifa.id}:`, error);
        }
      }

      // Ordenar por importe calculado (menor = mejor)
      resultados.sort((a, b) => a.importeCalculado - b.importeCalculado);

      console.log(`✅ Calculadas ${resultados.length} ofertas exitosamente`);
      return resultados;

    } catch (error) {
      console.error('❌ Error en calculateOffers:', error);
      throw error;
    }
  }

  /**
   * Encuentra tarifas aplicables según el rango de consumo/potencia
   */
  private static async findApplicableTarifas(comparativa: Comparativa): Promise<Tarifa[]> {
    // Calcular valores clave
    const consumoAnual = comparativa.consumoAnualElectricidad;
    const potenciaMaxima = Math.max(
      comparativa.potenciaP1 || 0,
      comparativa.potenciaP2 || 0,
      comparativa.potenciaP3 || 0,
      comparativa.potenciaP4 || 0,
      comparativa.potenciaP5 || 0,
      comparativa.potenciaP6 || 0
    );

    // Buscar tarifas donde el consumo/potencia esté dentro del rango
    const tarifas = await prisma.tarifa.findMany({
      where: {
        activa: true,
        tarifa: comparativa.tarifaAccesoElectricidad, // Debe coincidir la tarifa de acceso
        OR: [
          {
            // Para tarifas basadas en energía
            rango: 'E',
            rangoDesde: { lte: consumoAnual },
            OR: [
              { rangoHasta: null }, // Sin límite superior
              { rangoHasta: { gte: consumoAnual } }
            ]
          },
          {
            // Para tarifas basadas en potencia
            rango: 'P',
            rangoDesde: { lte: potenciaMaxima },
            OR: [
              { rangoHasta: null }, // Sin límite superior
              { rangoHasta: { gte: potenciaMaxima } }
            ]
          }
        ]
      },
      include: {
        comercializadora: true
      }
    });

    return tarifas;
  }

  /**
   * Calcula el coste de una tarifa específica
   */
  private static async calculateSingleTarifa(
    comparativa: Comparativa, 
    tarifa: any,
    parametrosPersonalizados?: any
  ): Promise<CalculationResult | null> {
    try {
      // PASO 1: Calcular coste energía
      const totalEnergia = this.calculateEnergiaCost(comparativa, tarifa, parametrosPersonalizados);

      // PASO 2: Calcular coste potencia
      const totalPotencia = this.calculatePotenciaCost(comparativa, tarifa, parametrosPersonalizados);

      // PASO 3: Calcular base imponible
      const totalBase = totalEnergia + totalPotencia + tarifa.costeGestion;

      // PASO 4: Calcular impuesto eléctrico (5.11269632% en España)
      const impuestoElectricidad = totalBase * 0.0511269632;

      // PASO 5: Calcular IVA (21% sobre base + impuesto)
      const baseConImpuesto = totalBase + impuestoElectricidad;
      const iva = baseConImpuesto * 0.21;

      // PASO 6: Total final
      const total = baseConImpuesto + iva;

      // PASO 7: Buscar comisión correspondiente
      const comisionGanada = await this.findMatchingComision(comparativa, tarifa);

      // PASO 8: Calcular ahorro vs factura actual (permitir valores negativos)
      const ahorroAnual = comparativa.totalFacturaElectricidad - total;

      return {
        tarifaId: tarifa.id,
        comercializadora: tarifa.comercializadora.nombre,
        nombreOferta: tarifa.nombreOferta,
        tarifa: tarifa.tarifa,
        tipoOferta: tarifa.tipoOferta,
        importeCalculado: total,
        ahorroAnual,
        comisionGanada,
        detalleCalculo: {
          totalEnergia,
          totalPotencia,
          totalBase,
          impuestoElectricidad,
          iva,
          total
        }
      };

    } catch (error) {
      console.log(`❌ Error calculando tarifa ${tarifa.id}:`, error);
      return null;
    }
  }

  /**
   * Calcula el coste de energía según los períodos
   */
  private static calculateEnergiaCost(comparativa: Comparativa, tarifa: Tarifa, parametrosPersonalizados?: any): number {
    let totalEnergia = 0;

    // Calcular para cada período (P1-P6)
    const periodos = [
      { consumo: comparativa.consumoP1, precio: tarifa.energiaP1 },
      { consumo: comparativa.consumoP2 || 0, precio: tarifa.energiaP2 || 0 },
      { consumo: comparativa.consumoP3 || 0, precio: tarifa.energiaP3 || 0 },
      { consumo: comparativa.consumoP4 || 0, precio: tarifa.energiaP4 || 0 },
      { consumo: comparativa.consumoP5 || 0, precio: tarifa.energiaP5 || 0 },
      { consumo: comparativa.consumoP6 || 0, precio: tarifa.energiaP6 || 0 }
    ];

    for (const periodo of periodos) {
      if (periodo.consumo > 0 && periodo.precio > 0) {
        totalEnergia += periodo.consumo * periodo.precio;
      }
    }

    // Aplicar FEE de energía - usar parámetros personalizados si están disponibles
    let feeEnergia = parametrosPersonalizados?.feeEnergia ?? tarifa.feeEnergia ?? 0;
    let feeEnergiaMinimo = parametrosPersonalizados?.feeEnergiaMinimo ?? tarifa.feeEnergiaMinimo;
    let feeEnergiaMaximo = parametrosPersonalizados?.feeEnergiaMaximo ?? tarifa.feeEnergiaMaximo;
    
    if ((parametrosPersonalizados && feeEnergia > 0) || (tarifa.tieneFee && tarifa.feeEnergia)) {
      let feeAplicar = feeEnergia;
      
      // Aplicar límites de FEE
      if (feeEnergiaMinimo && feeAplicar < feeEnergiaMinimo) {
        feeAplicar = feeEnergiaMinimo;
      }
      if (feeEnergiaMaximo && feeAplicar > feeEnergiaMaximo) {
        feeAplicar = feeEnergiaMaximo;
      }
      
      totalEnergia += comparativa.consumoAnualElectricidad * feeAplicar;
      
      if (parametrosPersonalizados) {
        console.log('🎯 Aplicado fee energía personalizado:', feeAplicar, '€/kWh');
      }
    }

    // Aplicar descuento si existe
    if (tarifa.energiaDescuento) {
      totalEnergia -= totalEnergia * (tarifa.energiaDescuento / 100);
    }

    return totalEnergia;
  }

  /**
   * Calcula el coste de potencia según los períodos
   */
  private static calculatePotenciaCost(comparativa: Comparativa, tarifa: Tarifa, parametrosPersonalizados?: any): number {
    let totalPotencia = 0;

    // Calcular para cada período (P1-P6)
    const periodos = [
      { potencia: comparativa.potenciaP1, precio: tarifa.potenciaP1 || 0 },
      { potencia: comparativa.potenciaP2 || 0, precio: tarifa.potenciaP2 || 0 },
      { potencia: comparativa.potenciaP3 || 0, precio: tarifa.potenciaP3 || 0 },
      { potencia: comparativa.potenciaP4 || 0, precio: tarifa.potenciaP4 || 0 },
      { potencia: comparativa.potenciaP5 || 0, precio: tarifa.potenciaP5 || 0 },
      { potencia: comparativa.potenciaP6 || 0, precio: tarifa.potenciaP6 || 0 }
    ];

    for (const periodo of periodos) {
      if (periodo.potencia > 0 && periodo.precio > 0) {
        // Convertir €/kW mes a €/kW año (x12 meses)
        totalPotencia += periodo.potencia * periodo.precio * 12;
      }
    }

    // Aplicar FEE de potencia - usar parámetros personalizados si están disponibles
    let feePotencia = parametrosPersonalizados?.feePotencia ?? tarifa.feePotencia ?? 0;
    let feePotenciaMinimo = parametrosPersonalizados?.feePotenciaMinimo ?? tarifa.feePotenciaMinimo;
    let feePotenciaMaximo = parametrosPersonalizados?.feePotenciaMaximo ?? tarifa.feePotenciaMaximo;
    
    if ((parametrosPersonalizados && feePotencia > 0) || (tarifa.tieneFee && tarifa.feePotencia)) {
      let feeAplicar = feePotencia;
      
      // Aplicar límites de FEE
      if (feePotenciaMinimo && feeAplicar < feePotenciaMinimo) {
        feeAplicar = feePotenciaMinimo;
      }
      if (feePotenciaMaximo && feeAplicar > feePotenciaMaximo) {
        feeAplicar = feePotenciaMaximo;
      }
      
      const potenciaMaxima = Math.max(
        comparativa.potenciaP1 || 0,
        comparativa.potenciaP2 || 0,
        comparativa.potenciaP3 || 0,
        comparativa.potenciaP4 || 0,
        comparativa.potenciaP5 || 0,
        comparativa.potenciaP6 || 0
      );
      
      totalPotencia += potenciaMaxima * feeAplicar * 12; // €/kW año
      
      if (parametrosPersonalizados) {
        console.log('🎯 Aplicado fee potencia personalizado:', feeAplicar, '€/kW·día');
      }
    }

    // Aplicar descuento si existe
    if (tarifa.potenciaDescuento) {
      totalPotencia -= totalPotencia * (tarifa.potenciaDescuento / 100);
    }

    return totalPotencia;
  }

  /**
   * Encuentra la comisión correspondiente según tu lógica exacta:
   * - Mismo comercializadora, oferta, tarifa, tipo oferta
   * - Rango E: buscar donde cae el consumo
   * - Rango P: buscar donde cae la potencia máxima
   */
  private static async findMatchingComision(
    comparativa: Comparativa, 
    tarifa: any
  ): Promise<number> {
    try {
      const consumoAnual = comparativa.consumoAnualElectricidad;
      const potenciaMaxima = Math.max(
        comparativa.potenciaP1 || 0,
        comparativa.potenciaP2 || 0,
        comparativa.potenciaP3 || 0,
        comparativa.potenciaP4 || 0,
        comparativa.potenciaP5 || 0,
        comparativa.potenciaP6 || 0
      );

      // Buscar comisión con matching exacto
      const comision = await prisma.comision.findFirst({
        where: {
          comercializadoraId: tarifa.comercializadoraId,
          nombreOferta: tarifa.nombreOferta,
          tarifa: tarifa.tarifa,
          tipoOferta: tarifa.tipoOferta,
          activa: true,
          
          // Aplicar lógica de rangos
          OR: [
            {
              // Para comisiones basadas en energía (Rango = 'E')
              rango: 'E',
              rangoDesde: { lte: consumoAnual },
              OR: [
                { rangoHasta: null }, // Sin límite superior
                { rangoHasta: { gte: consumoAnual } }
              ]
            },
            {
              // Para comisiones basadas en potencia (Rango = 'P')
              rango: 'P',
              rangoDesde: { lte: potenciaMaxima },
              OR: [
                { rangoHasta: null }, // Sin límite superior  
                { rangoHasta: { gte: potenciaMaxima } }
              ]
            }
          ]
        },
        orderBy: {
          comision: 'desc' // Tomar la comisión más alta si hay varias opciones
        }
      });

      return comision?.comision || 0;

    } catch (error) {
      console.log('❌ Error buscando comisión:', error);
      return 0;
    }
  }

  /**
   * Guarda los resultados calculados en la base de datos
   */
  static async saveCalculationResults(
    comparativaId: string, 
    results: CalculationResult[]
  ): Promise<void> {
    try {
      // Eliminar resultados anteriores
      await prisma.comparativaOferta.deleteMany({
        where: { comparativaId }
      });

      // Insertar nuevos resultados
      for (const result of results) {
        await prisma.comparativaOferta.create({
          data: {
            comparativaId,
            tarifaId: result.tarifaId,
            importeCalculado: result.importeCalculado,
            ahorroAnual: result.ahorroAnual,
            comisionGanada: result.comisionGanada
          }
        });
      }

      console.log(`✅ Guardados ${results.length} resultados de cálculo`);

    } catch (error) {
      console.error('❌ Error guardando resultados:', error);
      throw error;
    }
  }

  /**
   * Función principal: calcular y guardar
   */
  static async calculateAndSave(comparativaId: string, parametrosPersonalizados?: any): Promise<CalculationResult[]> {
    const results = await this.calculateOffers(comparativaId, parametrosPersonalizados);
    await this.saveCalculationResults(comparativaId, results);
    return results;
  }
}
