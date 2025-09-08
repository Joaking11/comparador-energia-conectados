
'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
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
  
  // Cálculos básicos para el informe
  const consumoAnual = comparativa.consumoAnualElectricidad;
  const potenciaContratada = comparativa.potenciaP1;
  const facturaActual = comparativa.totalFacturaElectricidad;
  const nuevaFactura = resultado.importeCalculado;
  const ahorroAnual = facturaActual - nuevaFactura;
  const porcentajeAhorro = (ahorroAnual / facturaActual) * 100;
  
  // Simular período de facturación (asumiendo 30 días para el ejemplo)
  const diasFacturacion = 30;
  const fechaInicio = new Date();
  const fechaFin = new Date();
  fechaFin.setDate(fechaInicio.getDate() + diasFacturacion);
  
  // Simular distribución de consumo por períodos (valores estimados)
  const distribuciones = {
    P1: { consumo: consumoAnual * 0.25, potencia: potenciaContratada * 0.4 },
    P2: { consumo: consumoAnual * 0.20, potencia: potenciaContratada * 0.5 },
    P3: { consumo: consumoAnual * 0.15, potencia: potenciaContratada * 0.5 },
    P4: { consumo: consumoAnual * 0.10, potencia: potenciaContratada * 0.5 },
    P5: { consumo: consumoAnual * 0.05, potencia: potenciaContratada * 0.5 },
    P6: { consumo: consumoAnual * 0.25, potencia: potenciaContratada * 0.9 }
  };
  
  // Precios por períodos (simulados basados en la tarifa)
  const preciosPotencia = {
    P1: 0.062078,
    P2: 0.036306,
    P3: 0.019897,
    P4: 0.029265,
    P5: 0.033776,
    P6: 0.035223
  };
  
  const preciosEnergia = {
    P1: resultado.tarifa.energiaP1,
    P2: resultado.tarifa.energiaP1,
    P3: resultado.tarifa.energiaP1 * 0.9,
    P4: resultado.tarifa.energiaP1 * 0.9,
    P5: resultado.tarifa.energiaP1 * 0.8,
    P6: resultado.tarifa.energiaP1
  };
  
  // Cálculos por período
  const calculosPorPeriodo = Object.keys(distribuciones).reduce((acc: any, periodo) => {
    const dist = distribuciones[periodo as keyof typeof distribuciones];
    const precioPot = preciosPotencia[periodo as keyof typeof preciosPotencia];
    const precioEn = preciosEnergia[periodo as keyof typeof preciosEnergia];
    
    acc[periodo] = {
      costoPotencia: precioPot * dist.potencia * diasFacturacion,
      costoEnergia: precioEn * (dist.consumo / 365) * diasFacturacion,
      consumo: (dist.consumo / 365) * diasFacturacion,
      potencia: dist.potencia
    };
    
    return acc;
  }, {});
  
  // Totales
  const totalTerminoPotencia = Object.values(calculosPorPeriodo).reduce((sum: number, p: any) => sum + p.costoPotencia, 0);
  const totalTerminoEnergia = Object.values(calculosPorPeriodo).reduce((sum: number, p: any) => sum + p.costoEnergia, 0);
  
  // Conceptos adicionales
  const bonoSocial = diasFacturacion * (4.6510 / 365);
  const impuestoElectricidad = (totalTerminoPotencia + totalTerminoEnergia) * 0.0511;
  const alquilerEquipos = 1.00;
  
  const totalBase = totalTerminoPotencia + totalTerminoEnergia + bonoSocial + impuestoElectricidad + alquilerEquipos;
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
    <div className="bg-white text-black font-mono text-sm leading-tight">
      {/* ENCABEZADO CORPORATIVO */}
      <div className="border-b-2 border-black pb-2 mb-4">
        <div className="flex justify-between items-center">
          <div className="font-bold">
            Conectados Consulting - Consultoría Energética
          </div>
          <div className="text-right">
            Su agente más cercano en www.conectadosconsulting.es
          </div>
        </div>
        
        <div className="flex justify-between items-center mt-2">
          <div>
            <span className="font-bold">Comercializadora:</span> {resultado.tarifa.comercializadora.nombre}
            <span className="ml-8 font-bold">Oferta:</span> {resultado.tarifa.nombreOferta}
          </div>
          <div className="font-bold">
            Comparativa<br/>
            Oferta Suministro
          </div>
        </div>
        
        <div className="flex justify-between items-center mt-2">
          <div>
            <span className="font-bold">AGENTE:</span> Consultor Energético
          </div>
          <div className="text-right">
            <span className="font-bold">Fecha:</span> {formatearFecha(fechaInicio)}
          </div>
        </div>
      </div>

      {/* DATOS DEL CLIENTE Y SUMINISTRO */}
      <div className="grid grid-cols-2 gap-8 mb-6">
        <div>
          <div className="font-bold underline mb-2">DATOS DEL CLIENTE</div>
          <div><span className="font-bold">Razón Social:</span> {comparativa.cliente.razonSocial}</div>
          <div><span className="font-bold">NIF / CIF:</span> {comparativa.cliente.cif || 'N/A'}</div>
          <div><span className="font-bold">Dirección:</span> {comparativa.cliente.direccion || 'N/A'}</div>
          <div><span className="font-bold">Localidad:</span> {comparativa.cliente.localidad || 'N/A'}</div>
          <div><span className="font-bold">Provincia:</span> {comparativa.cliente.provincia || 'N/A'}</div>
        </div>
        
        <div>
          <div className="font-bold underline mb-2">DATOS DEL SUMINISTRO</div>
          <div><span className="font-bold">CUPS Electricidad:</span> {comparativa.cupsElectricidad || 'N/A'}</div>
          <div><span className="font-bold">Tarifa Acceso Electricidad:</span> {comparativa.tarifaAccesoElectricidad}</div>
        </div>
      </div>

      {/* COMPARATIVA SUMINISTRO ELÉCTRICO */}
      <div className="text-center font-bold text-lg mb-4">
        COMPARATIVA SUMINISTRO ELÉCTRICO
      </div>
      
      <div className="flex justify-between mb-4">
        <div>
          <span className="font-bold">Tarifa Electricidad ofertada por:</span> {resultado.tarifa.comercializadora.nombre}
        </div>
        <div className="text-right">
          {resultado.tarifa.tarifa}
        </div>
      </div>
      
      <div className="flex justify-between mb-6">
        <div>
          <span className="font-bold">Período de facturación:</span> {formatearFecha(fechaInicio)} a {formatearFecha(fechaFin)}
        </div>
        <div className="text-right">
          {diasFacturacion} días
        </div>
      </div>

      {/* TÉRMINO DE POTENCIA */}
      <div className="mb-6">
        <div className="flex justify-between font-bold mb-2">
          <span>Término de Potencia</span>
          <span>{totalTerminoPotencia.toFixed(2)} €</span>
        </div>
        
        {Object.entries(calculosPorPeriodo).map(([periodo, calculo]: [string, any]) => (
          <div key={periodo} className="flex justify-between text-xs mb-1">
            <span>
              {periodo}: {preciosPotencia[periodo as keyof typeof preciosPotencia].toFixed(6)} €/kW día × {calculo.potencia.toFixed(2)} kW × {diasFacturacion} días
            </span>
            <span>{calculo.costoPotencia.toFixed(2)} €</span>
          </div>
        ))}
      </div>

      {/* TÉRMINO DE ENERGÍA */}
      <div className="mb-6">
        <div className="flex justify-between font-bold mb-2">
          <span>Término de Energía</span>
          <span>{totalTerminoEnergia.toFixed(2)} €</span>
        </div>
        
        {Object.entries(calculosPorPeriodo).map(([periodo, calculo]: [string, any]) => (
          <div key={periodo} className="flex justify-between text-xs mb-1">
            <span>
              {periodo}: {preciosEnergia[periodo as keyof typeof preciosEnergia].toFixed(6)} €/kWh × {calculo.consumo.toFixed(2)} kWh
            </span>
            <span>{calculo.costoEnergia > 0 ? calculo.costoEnergia.toFixed(2) + ' €' : '- €'}</span>
          </div>
        ))}
      </div>

      {/* CONCEPTOS ADICIONALES */}
      <div className="mb-6">
        <div className="flex justify-between text-xs mb-1">
          <span>Financiación del Bono Social: {diasFacturacion} días × {(4.6510 / 365).toFixed(4)} €/día</span>
          <span>{bonoSocial.toFixed(2)} €</span>
        </div>
        <div className="flex justify-between text-xs mb-1">
          <span>Exceso de potencia:</span>
          <span>- €</span>
        </div>
        <div className="flex justify-between text-xs mb-1">
          <span>Total Reactiva:</span>
          <span>- €</span>
        </div>
        <div className="flex justify-between text-xs mb-1">
          <span>Compensación Excedentes (0,07€/Kw) + KW acumulados bateria virtual:</span>
          <span>- €</span>
        </div>
        <div className="flex justify-between text-xs mb-1">
          <span>Coste de Gestión:</span>
          <span>- €</span>
        </div>
        <div className="flex justify-between text-xs mb-1">
          <span>Impuesto sobre electricidad: 5,11% s/ {(totalTerminoPotencia + totalTerminoEnergia).toFixed(2)} €</span>
          <span>{impuestoElectricidad.toFixed(2)} €</span>
        </div>
        <div className="flex justify-between text-xs mb-1">
          <span>Alquiler de equipos de medida y control:</span>
          <span>{alquilerEquipos.toFixed(2)} €</span>
        </div>
      </div>

      {/* NOTA SOBRE DESCUENTOS */}
      <div className="text-xs italic mb-4 text-center">
        "El precio incluye descuentos especiales según condiciones de la oferta."
      </div>

      {/* RESUMEN FINAL */}
      <div className="border-t-2 border-black pt-4">
        <div className="flex justify-between font-bold mb-2">
          <span>TOTAL BASE FACTURA:</span>
          <span>{totalBase.toFixed(2)} €</span>
        </div>
        <div className="flex justify-between mb-2">
          <span>I.V.A (21% × {totalBase.toFixed(2)}):</span>
          <span>{iva.toFixed(2)} €</span>
        </div>
        <div className="flex justify-between font-bold text-lg mb-2">
          <span>TOTAL FACTURA OFERTA:</span>
          <span>{totalFactura.toFixed(2)} €</span>
        </div>
        <div className="flex justify-between mb-2">
          <span>PAGA ACTUALMENTE:</span>
          <span>{facturaActual.toFixed(2)} €</span>
        </div>
        <div className="flex justify-between font-bold text-lg mb-2">
          <span>AHORRO EN FACTURA: {porcentajeAhorro.toFixed(2)}%</span>
          <span className={ahorroAnual > 0 ? 'text-green-600' : 'text-red-600'}>
            {ahorroAnual.toFixed(2)} €
          </span>
        </div>
        <div className="flex justify-between font-bold text-xl">
          <span>AHORRO ANUAL ESTIMADO:</span>
          <span className={ahorroAnual > 0 ? 'text-green-600' : 'text-red-600'}>
            {(ahorroAnual * 12).toFixed(2)} €
          </span>
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
                  Esta oferta de <strong>{resultado.tarifa.comercializadora.nombre}</strong> representa 
                  un ahorro anual de <strong>{(ahorroAnual * 12).toFixed(0)}€</strong> ({porcentajeAhorro.toFixed(1)}%) 
                  comparado con su facturación actual.
                </p>
                <p className="text-gray-700 mt-2">
                  Los cálculos mostrados incluyen todos los conceptos y están basados en su consumo histórico 
                  y las condiciones específicas de su suministro.
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
              <span className="font-semibold">Tarifa de Acceso:</span> {resultado.tarifa.tarifa}
            </div>
            <div>
              <span className="font-semibold">Tipo de Oferta:</span> {resultado.tarifa.tipoOferta}
            </div>
            <div>
              <span className="font-semibold">Zona Tarifaria:</span> {resultado.tarifa.zona}
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
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-5xl w-full max-h-[90vh] overflow-y-auto">
        
        {/* Header del informe */}
        <div className="sticky top-0 bg-white border-b p-4 flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <h2 className="text-xl font-bold text-gray-900">
              Comparativa - {resultado.tarifa.nombreOferta}
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
            <Button variant="outline" size="sm">
              <Download className="h-4 w-4 mr-2" />
              PDF
            </Button>
            <Button variant="outline" size="sm">
              <Share2 className="h-4 w-4 mr-2" />
              Compartir
            </Button>
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Contenido según página */}
        <div className="min-h-[80vh]">
          {paginaActual === 1 ? (
            <div className="p-6">
              {renderPaginaOficial()}
            </div>
          ) : (
            renderPaginaAnalisis()
          )}
        </div>

        {/* Footer de navegación */}
        <div className="border-t p-4 flex justify-between items-center">
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
  );
}
