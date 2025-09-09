
'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { 
  X, 
  Calculator, 
  TrendingUp, 
  Building, 
  Zap, 
  Euro,
  FileText,
  Download,
  Share2,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';

interface InformeDetalladoProps {
  resultado: any;
  comparativa: any;
  onClose: () => void;
}

export default function InformeDetalladoComparativa({ 
  resultado, 
  comparativa, 
  onClose 
}: InformeDetalladoProps) {
  
  const [paginaActual, setPaginaActual] = useState(1);
  const [precioExcedentes, setPrecioExcedentes] = useState(0.07); // €/kWh por defecto
  
  const handleDescargarPDF = () => {
    // Generar PDF usando window.print
    window.print();
  };

  const handleCompartir = async () => {
    try {
      const titulo = `Comparativa - ${resultado.tarifas?.nombreOferta || 'Sin nombre'}`;
      const texto = `Informe de comparativa energética para ${comparativa.clientes?.razonSocial || 'Cliente'}`;
      const url = window.location.href;

      if (navigator.share && typeof navigator.canShare === 'function') {
        // Compartir nativo (móvil) con opciones de WhatsApp, email, etc.
        await navigator.share({
          title: titulo,
          text: texto,
          url: url
        });
      } else {
        // Fallback para escritorio - crear opciones de compartir
        const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(`${titulo}\n${texto}\n${url}`)}`;
        const emailUrl = `mailto:?subject=${encodeURIComponent(titulo)}&body=${encodeURIComponent(`${texto}\n\n${url}`)}`;
        
        const compartirOpciones = [
          {
            nombre: 'WhatsApp',
            url: whatsappUrl
          },
          {
            nombre: 'Email',
            url: emailUrl
          },
          {
            nombre: 'Copiar enlace',
            accion: () => {
              navigator.clipboard.writeText(url);
              alert('✅ Enlace copiado al portapapeles');
            }
          }
        ];

        // Mostrar opciones
        const opcion = prompt(`Selecciona cómo compartir:\n1. WhatsApp\n2. Email\n3. Copiar enlace\n\nEscribe el número:`);
        
        switch(opcion) {
          case '1':
            window.open(whatsappUrl, '_blank');
            break;
          case '2':
            window.location.href = emailUrl;
            break;
          case '3':
          default:
            // Copiar por defecto
            navigator.clipboard.writeText(url);
            alert('✅ Enlace copiado al portapapeles');
            break;
        }
      }
    } catch (error) {
      console.error('Error al compartir:', error);
      // Fallback final
      await navigator.clipboard.writeText(window.location.href);
      alert('✅ Enlace copiado al portapapeles');
    }
  };
  
  // Cálculos básicos para el informe
  const consumoAnual = comparativa.consumoAnualElectricidad;
  const potenciaContratada = comparativa.potenciaP1;
  
  // OBTENER CONSUMOS REALES POR PERÍODO (no distribución inventada)
  const consumosReales = {
    P1: comparativa.consumoP1 || 0,
    P2: comparativa.consumoP2 || 0, 
    P3: comparativa.consumoP3 || 0,
    P4: comparativa.consumoP4 || 0,
    P5: comparativa.consumoP5 || 0,
    P6: comparativa.consumoP6 || 0
  };
  
  // OBTENER POTENCIAS REALES POR PERÍODO (no solo P1)
  const potenciasReales = {
    P1: comparativa.potenciaP1 || 0,
    P2: comparativa.potenciaP2 || 0,
    P3: comparativa.potenciaP3 || 0, 
    P4: comparativa.potenciaP4 || 0,
    P5: comparativa.potenciaP5 || 0,
    P6: comparativa.potenciaP6 || 0
  };
  
  const facturaActual = comparativa.totalFacturaElectricidad;
  const nuevaFactura = resultado.importeCalculado;
  const ahorroAnual = facturaActual - nuevaFactura;
  const porcentajeAhorro = (ahorroAnual / facturaActual) * 100;
  
  // Período de facturación (asumiendo 30 días para el ejemplo)
  const diasFacturacion = comparativa.diasPeriodoFactura || 30;
  const fechaInicio = new Date();
  const fechaFin = new Date();
  fechaFin.setDate(fechaInicio.getDate() + diasFacturacion);
  
  // Obtener períodos reales de la tarifa desde la base de datos
  const periodosEnergia: Array<{periodo: string, precio: number}> = [];
  const periodosPotencia: Array<{periodo: string, precio: number}> = [];
  
  // Revisar qué períodos de energía están disponibles
  if (resultado.tarifas?.energiaP1) periodosEnergia.push({ periodo: 'P1', precio: resultado.tarifas.energiaP1 });
  if (resultado.tarifas?.energiaP2) periodosEnergia.push({ periodo: 'P2', precio: resultado.tarifas.energiaP2 });
  if (resultado.tarifas?.energiaP3) periodosEnergia.push({ periodo: 'P3', precio: resultado.tarifas.energiaP3 });
  if (resultado.tarifas?.energiaP4) periodosEnergia.push({ periodo: 'P4', precio: resultado.tarifas.energiaP4 });
  if (resultado.tarifas?.energiaP5) periodosEnergia.push({ periodo: 'P5', precio: resultado.tarifas.energiaP5 });
  if (resultado.tarifas?.energiaP6) periodosEnergia.push({ periodo: 'P6', precio: resultado.tarifas.energiaP6 });
  
  // Revisar qué períodos de potencia están disponibles
  if (resultado.tarifas?.potenciaP1) periodosPotencia.push({ periodo: 'P1', precio: resultado.tarifas.potenciaP1 });
  if (resultado.tarifas?.potenciaP2) periodosPotencia.push({ periodo: 'P2', precio: resultado.tarifas.potenciaP2 });
  if (resultado.tarifas?.potenciaP3) periodosPotencia.push({ periodo: 'P3', precio: resultado.tarifas.potenciaP3 });
  if (resultado.tarifas?.potenciaP4) periodosPotencia.push({ periodo: 'P4', precio: resultado.tarifas.potenciaP4 });
  if (resultado.tarifas?.potenciaP5) periodosPotencia.push({ periodo: 'P5', precio: resultado.tarifas.potenciaP5 });
  if (resultado.tarifas?.potenciaP6) periodosPotencia.push({ periodo: 'P6', precio: resultado.tarifas.potenciaP6 });
  
  // Distribución de consumo según el tipo de tarifa
  const getDistribucionConsumo = (tipoTarifa: string, numPeriodos: number) => {
    if (tipoTarifa === '2.0TD') {
      // Para 2.0TD: típicamente 3 períodos de energía
      if (numPeriodos === 1) return [1.0];
      if (numPeriodos === 2) return [0.6, 0.4];
      if (numPeriodos === 3) return [0.4, 0.35, 0.25]; // P1: punta, P2: llano, P3: valle
      return [0.4, 0.35, 0.25]; // por defecto
    }
    // Para otras tarifas, distribución más compleja
    if (numPeriodos <= 3) return [0.4, 0.35, 0.25];
    return [0.25, 0.20, 0.20, 0.15, 0.10, 0.10];
  };
  
  const distribucionConsumo = getDistribucionConsumo(resultado.tarifas?.tarifa || '2.0TD', periodosEnergia.length);
  
  // CÁLCULOS CORREGIDOS usando datos REALES por período
  const calculosPorPeriodo: any = {};
  
  // Calcular costos de energía usando CONSUMOS REALES por período
  periodosEnergia.forEach((periodoEn) => {
    const periodo = periodoEn.periodo as keyof typeof consumosReales;
    const consumoRealPeriodo = consumosReales[periodo] || 0;
    
    // USAR CONSUMO REAL DIRECTO - Ya es del período de facturación, no anual
    const consumoPeriodo = consumoRealPeriodo; // SIN conversión
    
    if (!calculosPorPeriodo[periodoEn.periodo]) calculosPorPeriodo[periodoEn.periodo] = {};
    calculosPorPeriodo[periodoEn.periodo].costoEnergia = periodoEn.precio * consumoPeriodo;
    calculosPorPeriodo[periodoEn.periodo].consumo = consumoPeriodo;
    calculosPorPeriodo[periodoEn.periodo].precioEnergia = periodoEn.precio;
  });
  
  // Calcular costos de potencia usando POTENCIAS REALES por período
  periodosPotencia.forEach((periodoP) => {
    const periodo = periodoP.periodo as keyof typeof potenciasReales;
    const potenciaRealPeriodo = potenciasReales[periodo] || 0;
    
    // Fórmula: kW contratados × precio (€/kW/día) × número de días
    if (!calculosPorPeriodo[periodoP.periodo]) calculosPorPeriodo[periodoP.periodo] = {};
    calculosPorPeriodo[periodoP.periodo].costoPotencia = potenciaRealPeriodo * periodoP.precio * diasFacturacion;
    calculosPorPeriodo[periodoP.periodo].potencia = potenciaRealPeriodo;
    calculosPorPeriodo[periodoP.periodo].precioPotencia = periodoP.precio;
  });
  
  // Asegurar que todos los períodos tengan valores por defecto
  Object.keys(calculosPorPeriodo).forEach(periodo => {
    if (!calculosPorPeriodo[periodo].costoEnergia) calculosPorPeriodo[periodo].costoEnergia = 0;
    if (!calculosPorPeriodo[periodo].costoPotencia) calculosPorPeriodo[periodo].costoPotencia = 0;
    if (!calculosPorPeriodo[periodo].consumo) calculosPorPeriodo[periodo].consumo = 0;
    if (!calculosPorPeriodo[periodo].potencia) calculosPorPeriodo[periodo].potencia = 0;
  });
  
  // Totales
  const totalTerminoPotencia = Object.values(calculosPorPeriodo).reduce((sum: number, p: any) => sum + (p.costoPotencia || 0), 0);
  const totalTerminoEnergia = Object.values(calculosPorPeriodo).reduce((sum: number, p: any) => sum + (p.costoEnergia || 0), 0);
  
  // Conceptos adicionales USANDO VALORES REALES
  const bonoSocial = diasFacturacion * (4.6510 / 365);
  const impuestoElectricidad = comparativa.impuestoElectricidad || ((totalTerminoPotencia + totalTerminoEnergia) * 0.0511);
  const alquilerEquipos = comparativa.alquilerEquipos || 0; // Valor real del alquiler de equipos
  const excesosPotencia = comparativa.excesoPotencia || 0; // Campo que faltaba
  const costeGestionTarifa = resultado.tarifas?.costeGestion || 0; // Coste de gestión de la tarifa
  const kwCompensacionExcedentes = comparativa.compensacionExcedentes || 0; // kW reales del OCR
  // CORRECCIÓN: Los excedentes siempre deben ser un descuento (positivo en el cálculo de ahorro)
  const costoCompensacionExcedentes = Math.abs(kwCompensacionExcedentes) * precioExcedentes; // Valor absoluto × €/kWh
  
  // DEBUG: Verificar cálculos
  console.log('🧮 CÁLCULO COMPENSACIÓN EXCEDENTES:', {
    kwCompensacionExcedentes,
    precioExcedentes,
    costoCompensacionExcedentes,
    'Math.abs(kwCompensacionExcedentes)': Math.abs(kwCompensacionExcedentes)
  });
  
  const totalBase = totalTerminoPotencia + totalTerminoEnergia + bonoSocial + impuestoElectricidad + alquilerEquipos + excesosPotencia + costeGestionTarifa - costoCompensacionExcedentes;
  
  // DEBUG: Verificar total
  console.log('💰 CÁLCULO TOTAL BASE:', {
    totalTerminoPotencia,
    totalTerminoEnergia, 
    bonoSocial,
    impuestoElectricidad,
    alquilerEquipos,
    excesosPotencia,
    costeGestionTarifa,
    costoCompensacionExcedentes: `-${costoCompensacionExcedentes}`,
    totalBase
  });
  const iva = totalBase * 0.21;
  const totalFactura = totalBase + iva;
  
  // Formatear fechas
  const formatearFecha = (fecha: Date) => {
    return fecha.toLocaleDateString('es-ES', { 
      day: '2-digit', 
      month: '2-digit', 
      year: 'numeric' 
    });
  };

  const renderPaginaOficial = () => (
    <div className="bg-white text-black font-sans text-sm leading-relaxed">
      {/* ENCABEZADO CORPORATIVO */}
      <div className="bg-gradient-to-r from-primary to-primary/90 text-white p-4 rounded-lg mb-6">
        <div className="flex justify-between items-center">
          <div className="flex items-center space-x-4">
            <img 
              src="/conectados-logo.png" 
              alt="CONECTADOS" 
              className="h-12 w-auto bg-white p-1 rounded"
            />
            <div>
              <div className="font-bold text-lg">
                Conectados Consulting - Consultoría Energética
              </div>
              <div className="text-sm opacity-90">
                Su agente más cercano en www.conectadosconsulting.es
              </div>
            </div>
          </div>
          <div className="text-right">
            <div className="bg-white text-primary px-3 py-1 rounded font-bold">
              Comparativa<br/>
              Oferta Suministro
            </div>
          </div>
        </div>
      </div>
      
      {/* INFORMACIÓN DE LA OFERTA */}
      <div className="bg-gray-50 p-4 rounded-lg mb-4 border-l-4 border-primary">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <span className="font-bold text-primary">Comercializadora:</span> {resultado.tarifas?.comercializadoras?.nombre || 'N/A'}
          </div>
          <div>
            <span className="font-bold text-primary">Oferta:</span> {resultado.tarifas?.nombreOferta || 'N/A'}
          </div>
        </div>
        
        <div className="flex justify-between items-center mt-4">
          <div>
            <span className="font-bold text-gray-700">AGENTE:</span> Consultor Energético
          </div>
          <div className="text-right">
            <span className="font-bold text-gray-700">Fecha:</span> {formatearFecha(fechaInicio)}
          </div>
        </div>
      </div>

      {/* DATOS DEL CLIENTE Y SUMINISTRO */}
      <div className="grid grid-cols-2 gap-6 mb-6">
        <div className="bg-blue-50 p-4 rounded-lg border-l-4 border-blue-500">
          <div className="font-bold text-blue-800 text-lg mb-3 flex items-center">
            <Building className="h-5 w-5 mr-2" />
            DATOS DEL CLIENTE
          </div>
          <div className="space-y-2">
            <div><span className="font-bold text-blue-700">Razón Social:</span> {comparativa.clientes?.razonSocial || 'N/A'}</div>
            <div><span className="font-bold text-blue-700">NIF / CIF:</span> {comparativa.clientes?.cif || 'N/A'}</div>
            <div><span className="font-bold text-blue-700">Dirección:</span> {comparativa.clientes?.direccion || 'N/A'}</div>
            <div><span className="font-bold text-blue-700">Localidad:</span> {comparativa.clientes?.localidad || 'N/A'}</div>
            <div><span className="font-bold text-blue-700">Provincia:</span> {comparativa.clientes?.provincia || 'N/A'}</div>
          </div>
        </div>
        
        <div className="bg-green-50 p-4 rounded-lg border-l-4 border-green-500">
          <div className="font-bold text-green-800 text-lg mb-3 flex items-center">
            <Zap className="h-5 w-5 mr-2" />
            DATOS DEL SUMINISTRO
          </div>
          <div className="space-y-2">
            <div><span className="font-bold text-green-700">CUPS Electricidad:</span><br/><span className="text-xs font-mono">{comparativa.cupsElectricidad || 'N/A'}</span></div>
            <div><span className="font-bold text-green-700">Tarifa Acceso Electricidad:</span> <span className="bg-green-200 px-2 py-1 rounded font-bold">{comparativa.tarifaAccesoElectricidad}</span></div>
            <div><span className="font-bold text-green-700">Potencia Contratada:</span> <span className="bg-green-200 px-2 py-1 rounded font-bold">{potenciaContratada} kW</span></div>
            <div><span className="font-bold text-green-700">Consumo Anual:</span> <span className="bg-green-200 px-2 py-1 rounded font-bold">{consumoAnual?.toLocaleString()} kWh</span></div>
          </div>
        </div>
      </div>

      {/* COMPARATIVA SUMINISTRO ELÉCTRICO */}
      <div className="bg-gradient-to-r from-accent to-accent/90 text-white p-4 rounded-lg mb-6 text-center">
        <div className="font-bold text-xl flex items-center justify-center">
          <Calculator className="h-6 w-6 mr-2" />
          COMPARATIVA SUMINISTRO ELÉCTRICO
        </div>
      </div>
      
      <div className="bg-yellow-50 p-4 rounded-lg mb-4 border border-yellow-200">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <span className="font-bold text-yellow-800">Tarifa Electricidad ofertada por:</span> <span className="text-yellow-900">{resultado.tarifas?.comercializadoras?.nombre || 'N/A'}</span>
          </div>
          <div className="text-right">
            <span className="bg-yellow-200 px-3 py-1 rounded font-bold text-yellow-800">{resultado.tarifas?.tarifa || 'N/A'}</span>
          </div>
        </div>
        
        <div className="grid grid-cols-2 gap-4 mt-2">
          <div>
            <span className="font-bold text-yellow-800">Período de facturación:</span> <span className="text-yellow-900">{formatearFecha(fechaInicio)} a {formatearFecha(fechaFin)}</span>
          </div>
          <div className="text-right">
            <span className="bg-yellow-300 px-3 py-1 rounded font-bold text-yellow-800">{diasFacturacion} días</span>
          </div>
        </div>
        
        {/* Info de debug de períodos y consumo histórico */}
        <div className="mt-3 text-xs text-yellow-700 bg-yellow-100 p-2 rounded">
          <div><strong>Períodos de Energía detectados:</strong> {periodosEnergia.map(p => `${p.periodo}(${p.precio.toFixed(4)}€/kWh)`).join(', ') || 'Ninguno'}</div>
          <div><strong>Períodos de Potencia detectados:</strong> {periodosPotencia.map(p => `${p.periodo}(${p.precio.toFixed(4)}€/kW·día)`).join(', ') || 'Ninguno'}</div>
          {comparativa.historicoTieneGrafico && (
            <div className="mt-2 border-t border-yellow-200 pt-2">
              <div><strong>Histórico del gráfico:</strong> {comparativa.historicoMesesDetectados} meses detectados</div>
              {comparativa.historicoConsumosMensuales && (
                <div><strong>Consumos mensuales:</strong> {JSON.parse(comparativa.historicoConsumosMensuales).slice(0, 5).map((c: number) => `${c}kWh`).join(', ')}
                {JSON.parse(comparativa.historicoConsumosMensuales).length > 5 && '...'}</div>
              )}
              <div><strong>Consumo anual calculado:</strong> {comparativa.historicoConsumoCalculado?.toFixed(0)} kWh</div>
            </div>
          )}
        </div>
      </div>

      {/* TÉRMINO DE POTENCIA */}
      <div className="mb-6 bg-purple-50 p-4 rounded-lg border border-purple-200">
        <div className="flex justify-between items-center mb-3 bg-purple-500 text-white p-2 rounded">
          <span className="font-bold flex items-center">
            <Zap className="h-4 w-4 mr-2" />
            Término de Potencia
          </span>
          <span className="font-bold text-lg">{totalTerminoPotencia.toFixed(2)} €</span>
        </div>
        
        <div className="space-y-1">
          {periodosPotencia.map((periodoP) => {
            const calculo = calculosPorPeriodo[periodoP.periodo];
            if (!calculo || calculo.costoPotencia === 0) return null;
            return (
              <div key={periodoP.periodo} className="flex justify-between text-xs bg-white p-2 rounded border-l-2 border-purple-300">
                <span className="text-purple-700">
                  <span className="font-bold text-purple-800">{periodoP.periodo}:</span> {periodoP.precio.toFixed(6)} €/kW·día × {calculo.potencia.toFixed(2)} kW × {diasFacturacion} días
                </span>
                <span className="font-bold text-purple-800">{calculo.costoPotencia.toFixed(2)} €</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* TÉRMINO DE ENERGÍA */}
      <div className="mb-6 bg-orange-50 p-4 rounded-lg border border-orange-200">
        <div className="flex justify-between items-center mb-3 bg-orange-500 text-white p-2 rounded">
          <span className="font-bold flex items-center">
            <TrendingUp className="h-4 w-4 mr-2" />
            Término de Energía
          </span>
          <span className="font-bold text-lg">{totalTerminoEnergia.toFixed(2)} €</span>
        </div>
        
        <div className="space-y-1">
          {periodosEnergia.map((periodoE) => {
            const calculo = calculosPorPeriodo[periodoE.periodo];
            if (!calculo || calculo.costoEnergia === 0) return null;
            return (
              <div key={periodoE.periodo} className="flex justify-between text-xs bg-white p-2 rounded border-l-2 border-orange-300">
                <span className="text-orange-700">
                  <span className="font-bold text-orange-800">{periodoE.periodo}:</span> {periodoE.precio.toFixed(6)} €/kWh × {calculo.consumo.toFixed(2)} kWh
                </span>
                <span className="font-bold text-orange-800">{calculo.costoEnergia.toFixed(2)} €</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* CONCEPTOS ADICIONALES */}
      <div className="mb-6 bg-gray-50 p-4 rounded-lg border border-gray-200">
        <div className="font-bold text-gray-800 mb-3 flex items-center">
          <FileText className="h-4 w-4 mr-2" />
          Conceptos Adicionales
        </div>
        <div className="space-y-1">
          <div className="flex justify-between text-xs bg-white p-2 rounded">
            <span className="text-gray-600">Financiación del Bono Social: {diasFacturacion} días × {(4.6510 / 365).toFixed(4)} €/día</span>
            <span className="font-bold text-gray-700">{bonoSocial.toFixed(2)} €</span>
          </div>
          <div className="flex justify-between text-xs bg-white p-2 rounded">
            <span className="text-gray-600">Exceso de potencia:</span>
            <span className="font-bold text-gray-700">{excesosPotencia.toFixed(2)} €</span>
          </div>
          {costeGestionTarifa > 0 && (
            <div className="flex justify-between text-xs bg-white p-2 rounded">
              <span className="text-gray-600">Coste de gestión:</span>
              <span className="font-bold text-gray-700">{costeGestionTarifa.toFixed(2)} €</span>
            </div>
          )}
          <div className="flex justify-between text-xs bg-white p-2 rounded">
            <span className="text-gray-600">Total Reactiva:</span>
            <span className="font-bold text-gray-700">0.00 €</span>
          </div>
          <div className="flex justify-between text-xs bg-white p-2 rounded items-center">
            <span className="text-gray-600">Compensación Excedentes 
              (<Input
                type="number"
                step="0.01"
                min="0"
                value={precioExcedentes}
                onChange={(e) => setPrecioExcedentes(Number(e.target.value))}
                className="inline-block w-16 h-5 text-xs mx-1 p-1 border-gray-300"
              />€/kWh) × {Math.abs(kwCompensacionExcedentes).toFixed(2)} kW:</span>
            <span className="font-bold text-green-700">-{costoCompensacionExcedentes.toFixed(2)} €</span>
          </div>
          <div className="flex justify-between text-xs bg-white p-2 rounded">
            <span className="text-gray-600">Coste de Gestión:</span>
            <span className="font-bold text-gray-700">- €</span>
          </div>
          <div className="flex justify-between text-xs bg-white p-2 rounded border-l-2 border-red-300">
            <span className="text-gray-600">Impuesto sobre electricidad: 5,11% s/ {(totalTerminoPotencia + totalTerminoEnergia).toFixed(2)} €</span>
            <span className="font-bold text-red-600">{impuestoElectricidad.toFixed(2)} €</span>
          </div>
          <div className="flex justify-between text-xs bg-white p-2 rounded">
            <span className="text-gray-600">Alquiler de equipos de medida y control:</span>
            <span className="font-bold text-gray-700">{alquilerEquipos.toFixed(2)} €</span>
          </div>
        </div>
      </div>

      {/* NOTA SOBRE DESCUENTOS */}
      <div className="bg-blue-100 p-3 rounded-lg text-sm italic mb-6 text-center border border-blue-200">
        <span className="text-blue-800">"El precio incluye descuentos especiales según condiciones de la oferta."</span>
      </div>

      {/* RESUMEN FINAL */}
      <div className="bg-white border-2 border-gray-200 p-6 rounded-lg shadow-lg">
        <div className="text-center mb-6">
          <h3 className="font-bold text-2xl flex items-center justify-center text-gray-800">
            <Euro className="h-6 w-6 mr-2 text-primary" />
            RESUMEN FINANCIERO
          </h3>
        </div>
        
        <div className="space-y-3">
          <div className="flex justify-between font-semibold p-3 rounded border border-gray-200 bg-gray-50">
            <span className="text-gray-700">TOTAL BASE FACTURA:</span>
            <span className="text-gray-900">{totalBase.toFixed(2)} €</span>
          </div>
          <div className="flex justify-between p-3 rounded border border-gray-200 bg-gray-50">
            <span className="text-gray-700">I.V.A (21% × {totalBase.toFixed(2)}):</span>
            <span className="text-gray-900">{iva.toFixed(2)} €</span>
          </div>
          <div className="flex justify-between font-bold text-lg p-3 rounded border-2 border-primary bg-primary/5">
            <span className="text-primary">TOTAL FACTURA OFERTA:</span>
            <span className="text-primary">{totalFactura.toFixed(2)} €</span>
          </div>
          <div className="flex justify-between p-3 rounded border border-gray-200 bg-gray-50">
            <span className="text-gray-700">PAGA ACTUALMENTE:</span>
            <span className="text-gray-900">{facturaActual.toFixed(2)} €</span>
          </div>
          
          {/* LAS DOS LÍNEAS MÁS DESTACADAS */}
          <div className={`flex justify-between font-bold text-xl p-4 rounded-lg shadow-md border-2 ${ahorroAnual > 0 ? 'bg-gradient-to-r from-green-500 to-green-600 text-white border-green-400' : 'bg-gradient-to-r from-red-500 to-red-600 text-white border-red-400'}`}>
            <span>AHORRO EN FACTURA: {porcentajeAhorro.toFixed(2)}%</span>
            <span className="font-extrabold">
              {ahorroAnual.toFixed(2)} €
            </span>
          </div>
          <div className={`flex justify-between font-bold text-2xl p-5 rounded-lg shadow-lg border-3 ${ahorroAnual > 0 ? 'bg-gradient-to-r from-green-600 to-green-700 text-green-50 border-green-500' : 'bg-gradient-to-r from-red-600 to-red-700 text-red-50 border-red-500'} transform hover:scale-[1.02] transition-transform`}>
            <span>AHORRO ANUAL ESTIMADO:</span>
            <span className="font-black text-3xl">
              {(ahorroAnual * 12).toFixed(2)} €
            </span>
          </div>
        </div>
      </div>
    </div>
  );

  const renderPaginaAnalisis = () => (
    <div className="p-6 space-y-6">
      {/* Análisis de rentabilidad */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Análisis de Rentabilidad
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-semibold text-gray-900 mb-3">Proyección de Ahorros</h4>
              <div className="space-y-3">
                {[1, 2, 3, 5].map(años => (
                  <div key={años} className="flex justify-between items-center">
                    <span className="text-sm">Ahorro a {años} {años === 1 ? 'año' : 'años'}</span>
                    <span className="font-bold text-secondary">
                      {(ahorroAnual * años * 12).toFixed(0)}€
                    </span>
                  </div>
                ))}
              </div>
            </div>
            
            <div>
              <h4 className="font-semibold text-gray-900 mb-3">Beneficios del Cambio</h4>
              <div className="space-y-2 text-sm">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span>Reducción en costos energéticos</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                  <span>Precios competitivos garantizados</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                  <span>Gestión comercial profesional</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                  <span>Soporte técnico especializado</span>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Recomendaciones del Consultor */}
      <Card>
        <CardHeader className="bg-accent/10">
          <CardTitle className="text-accent">Recomendación del Consultor</CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <div className="prose max-w-none">
            {ahorroAnual > 0 ? (
              <div>
                <p className="text-green-800 font-medium mb-2">
                  ✅ <strong>Recomendación: CAMBIO FAVORABLE</strong>
                </p>
                <p className="text-gray-700">
                  Esta oferta de <strong>{resultado.tarifas?.comercializadoras?.nombre || 'N/A'}</strong> representa 
                  un ahorro anual de <strong>{(ahorroAnual * 12).toFixed(0)}€</strong> ({porcentajeAhorro.toFixed(1)}%) 
                  comparado con su facturación actual.
                </p>
                <p className="text-gray-700 mt-2">
                  {comparativa.historicoTieneGrafico ? (
                    comparativa.historicoMesesDetectados === 12 
                      ? `El cálculo del consumo anual se ha obtenido sumando los 12 meses completos del gráfico de consumo de su última factura.`
                      : comparativa.historicoMesesDetectados > 12
                        ? `El cálculo del consumo anual se ha obtenido usando los últimos 12 meses del gráfico de consumo (de ${comparativa.historicoMesesDetectados} meses disponibles).`
                        : `El cálculo del consumo anual se ha estimado extrapolando los ${comparativa.historicoMesesDetectados} meses disponibles en el gráfico de consumo de su factura.`
                  ) : (
                    'El cálculo del consumo anual se ha estimado en base a los datos aportados en su última factura.'
                  )} Los cálculos incluyen todos los conceptos y están basados en las condiciones específicas de su suministro.
                </p>
              </div>
            ) : (
              <div>
                <p className="text-red-800 font-medium mb-2">
                  ⚠️ <strong>Recomendación: EVALUAR ALTERNATIVAS</strong>
                </p>
                <p className="text-gray-700">
                  Esta oferta supondría un incremento anual de <strong>{Math.abs(ahorroAnual * 12).toFixed(0)}€</strong> 
                  comparado con la facturación actual. Se recomienda evaluar otras opciones disponibles.
                </p>
                <p className="text-gray-700 mt-2">
                  {comparativa.historicoTieneGrafico ? (
                    comparativa.historicoMesesDetectados === 12 
                      ? `El cálculo del consumo anual se ha obtenido sumando los 12 meses completos del gráfico de consumo de su última factura.`
                      : comparativa.historicoMesesDetectados > 12
                        ? `El cálculo del consumo anual se ha obtenido usando los últimos 12 meses del gráfico de consumo (de ${comparativa.historicoMesesDetectados} meses disponibles).`
                        : `El cálculo del consumo anual se ha estimado extrapolando los ${comparativa.historicoMesesDetectados} meses disponibles en el gráfico de consumo de su factura.`
                  ) : (
                    'El cálculo del consumo anual se ha estimado en base a los datos aportados en su última factura.'
                  )}
                </p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Consideraciones Técnicas */}
      <Card>
        <CardHeader>
          <CardTitle>Consideraciones Técnicas</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3 text-sm">
            <div>
              <span className="font-semibold">Tarifa de Acceso:</span> {resultado.tarifas?.tarifa || 'N/A'}
            </div>
            <div>
              <span className="font-semibold">Tipo de Oferta:</span> {resultado.tarifas?.tipoOferta || 'N/A'}
            </div>
            <div>
              <span className="font-semibold">Zona Tarifaria:</span> {resultado.tarifas?.zona || 'N/A'}
            </div>
            <div>
              <span className="font-semibold">Período Analizado:</span> {diasFacturacion} días
            </div>
            <div className="mt-4 p-3 bg-gray-50 rounded">
              <span className="text-xs text-gray-600">
                * Los cálculos están basados en el patrón de consumo proporcionado y pueden variar según las condiciones reales de uso.
                Los precios incluyen todos los conceptos regulados vigentes a la fecha del análisis.
              </span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  return (
    <>
      <style jsx global>{`
        @media print {
          * {
            box-shadow: none !important;
          }
          
          .print-hidden { 
            display: none !important; 
          }
          
          .print-full { 
            position: static !important;
            width: 100% !important;
            height: auto !important;
            max-width: 100% !important;
            max-height: none !important;
            overflow: visible !important;
            background: white !important;
            border-radius: 0 !important;
            box-shadow: none !important;
            margin: 0 !important;
            padding: 20px !important;
          }
          
          .informe-contenido {
            width: 100% !important;
            background: white !important;
            font-size: 12px !important;
            line-height: 1.4 !important;
            color: black !important;
            page-break-inside: avoid;
          }
          
          @page {
            margin: 15mm;
            size: A4;
          }
          
          .no-break {
            page-break-inside: avoid;
          }
          
          body {
            background: white !important;
          }
          
          .fixed, .sticky {
            position: static !important;
          }
        }
      `}</style>
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50 print-hidden">
        <div className="bg-white rounded-lg shadow-xl max-w-5xl w-full max-h-[90vh] overflow-y-auto print-full">
        
        {/* Header del informe */}
        <div className="sticky top-0 bg-white border-b p-4 flex items-center justify-between print-hidden">
          <div className="flex items-center space-x-4">
            <h2 className="text-xl font-bold text-gray-900">
              Comparativa - {resultado.tarifas?.nombreOferta || 'Sin nombre'}
            </h2>
            <div className="flex items-center space-x-2">
              <Button
                variant={paginaActual === 1 ? 'default' : 'outline'}
                size="sm"
                onClick={() => setPaginaActual(1)}
              >
                Página 1
              </Button>
              <Button
                variant={paginaActual === 2 ? 'default' : 'outline'}
                size="sm"
                onClick={() => setPaginaActual(2)}
              >
                Análisis
              </Button>
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            <Button variant="outline" size="sm" onClick={handleDescargarPDF}>
              <Download className="h-4 w-4 mr-2" />
              PDF
            </Button>
            <Button variant="outline" size="sm" onClick={handleCompartir}>
              <Share2 className="h-4 w-4 mr-2" />
              Compartir
            </Button>
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Contenido según página */}
        <div className="min-h-[80vh] informe-contenido">
          {paginaActual === 1 ? (
            <div className="p-6">
              {renderPaginaOficial()}
            </div>
          ) : (
            renderPaginaAnalisis()
          )}
        </div>

        {/* Footer de navegación */}
        <div className="border-t p-4 flex justify-between items-center print-hidden">
          <div className="text-sm text-gray-500">
            Página {paginaActual} de 2
          </div>
          <div className="flex space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPaginaActual(1)}
              disabled={paginaActual === 1}
            >
              <ChevronLeft className="h-4 w-4 mr-1" />
              Anterior
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPaginaActual(2)}
              disabled={paginaActual === 2}
            >
              Siguiente
              <ChevronRight className="h-4 w-4 ml-1" />
            </Button>
          </div>
        </div>
      </div>
    </div>
    </>
  );
}
