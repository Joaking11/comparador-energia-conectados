
// Funciones de cálculo para comparativas de energía

import { Oferta } from './types';

/**
 * Calcula el importe anual de una oferta basado en consumo y potencia
 */
export function calcularImporteAnual(
  oferta: Oferta,
  consumoAnual: number,
  potenciaContratada: number
): number {
  // Término de energía (€/año)
  const costoEnergia = consumoAnual * oferta.precioEnergia;
  
  // Término de potencia (€/año) - multiplicado por 12 meses
  const costoPotencia = potenciaContratada * oferta.precioTermino * 12;
  
  return costoEnergia + costoPotencia;
}

/**
 * Calcula el ahorro anual comparado con la factura actual
 */
export function calcularAhorro(
  importeCalculado: number,
  importeActual: number
): number {
  return Math.max(0, importeActual - importeCalculado);
}

/**
 * Calcula la comisión basada en las reglas de la oferta
 */
export function calcularComision(
  oferta: Oferta,
  consumoAnual: number,
  potenciaContratada: number
): number {
  let valorBase = 0;
  
  if (oferta.comisionTipo === 'E') {
    // Comisión basada en energía (kWh)
    valorBase = consumoAnual;
  } else if (oferta.comisionTipo === 'P') {
    // Comisión basada en potencia (kW)
    valorBase = potenciaContratada;
  }
  
  // Verificar si está en el rango mínimo/máximo
  if (valorBase < oferta.comisionMinimo) {
    return 0;
  }
  
  if (oferta.comisionMaximo && valorBase > oferta.comisionMaximo) {
    return 0;
  }
  
  // Calcular comisión
  return oferta.comisionValor;
}

/**
 * Procesa todas las ofertas para una comparativa
 */
export function procesarOfertas(
  ofertas: Oferta[],
  consumoAnual: number,
  potenciaContratada: number,
  importeActual: number
) {
  return ofertas
    .filter(oferta => oferta.activa)
    .map(oferta => {
      const importeCalculado = calcularImporteAnual(oferta, consumoAnual, potenciaContratada);
      const ahorroAnual = calcularAhorro(importeCalculado, importeActual);
      const comisionGanada = calcularComision(oferta, consumoAnual, potenciaContratada);
      const ahorroPercentaje = importeActual > 0 ? (ahorroAnual / importeActual) * 100 : 0;
      
      return {
        oferta,
        importeCalculado,
        ahorroAnual,
        comisionGanada,
        ahorroPercentaje,
        comercializadora: oferta.comercializadora?.nombre || '',
        nombreOferta: oferta.nombre,
        tipoOferta: oferta.tipo,
      };
    })
    .sort((a, b) => b.ahorroAnual - a.ahorroAnual); // Ordenar por ahorro descendente
}
