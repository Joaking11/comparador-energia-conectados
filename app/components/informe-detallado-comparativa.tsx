
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
  
  const handleDescargarPDF = () => {
    // Generar PDF usando window.print
    window.print();
  };

  const handleCompartir = async () => {
    try {
      if (navigator.share) {
        await navigator.share({
          title: `Comparativa - ${resultado.tarifa.nombreOferta}`,
          text: `Informe de comparativa energética para ${comparativa.cliente.razonSocial}`,
          url: window.location.href
        });
      } else {
        // Fallback: copiar al portapapeles
        await navigator.clipboard.writeText(window.location.href);
        alert('Enlace copiado al portapapeles');
      }
    } catch (error) {
      console.error('Error al compartir:', error);
    }
  };
  
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
            <span className="font-bold text-primary">Comercializadora:</span> {resultado.tarifa.comercializadora.nombre}
          </div>
          <div>
            <span className="font-bold text-primary">Oferta:</span> {resultado.tarifa.nombreOferta}
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
            <div><span className="font-bold text-blue-700">Razón Social:</span> {comparativa.cliente.razonSocial}</div>
            <div><span className="font-bold text-blue-700">NIF / CIF:</span> {comparativa.cliente.cif || 'N/A'}</div>
            <div><span className="font-bold text-blue-700">Dirección:</span> {comparativa.cliente.direccion || 'N/A'}</div>
            <div><span className="font-bold text-blue-700">Localidad:</span> {comparativa.cliente.localidad || 'N/A'}</div>
            <div><span className="font-bold text-blue-700">Provincia:</span> {comparativa.cliente.provincia || 'N/A'}</div>
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
            <span className="font-bold text-yellow-800">Tarifa Electricidad ofertada por:</span> <span className="text-yellow-900">{resultado.tarifa.comercializadora.nombre}</span>
          </div>
          <div className="text-right">
            <span className="bg-yellow-200 px-3 py-1 rounded font-bold text-yellow-800">{resultado.tarifa.tarifa}</span>
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
          {Object.entries(calculosPorPeriodo).map(([periodo, calculo]: [string, any]) => (
            <div key={periodo} className="flex justify-between text-xs bg-white p-2 rounded border-l-2 border-purple-300">
              <span className="text-purple-700">
                <span className="font-bold text-purple-800">{periodo}:</span> {preciosPotencia[periodo as keyof typeof preciosPotencia].toFixed(6)} €/kW día × {calculo.potencia.toFixed(2)} kW × {diasFacturacion} días
              </span>
              <span className="font-bold text-purple-800">{calculo.costoPotencia.toFixed(2)} €</span>
            </div>
          ))}
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
          {Object.entries(calculosPorPeriodo).map(([periodo, calculo]: [string, any]) => (
            <div key={periodo} className="flex justify-between text-xs bg-white p-2 rounded border-l-2 border-orange-300">
              <span className="text-orange-700">
                <span className="font-bold text-orange-800">{periodo}:</span> {preciosEnergia[periodo as keyof typeof preciosEnergia].toFixed(6)} €/kWh × {calculo.consumo.toFixed(2)} kWh
              </span>
              <span className="font-bold text-orange-800">{calculo.costoEnergia > 0 ? calculo.costoEnergia.toFixed(2) + ' €' : '- €'}</span>
            </div>
          ))}
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
            <span className="font-bold text-gray-700">- €</span>
          </div>
          <div className="flex justify-between text-xs bg-white p-2 rounded">
            <span className="text-gray-600">Total Reactiva:</span>
            <span className="font-bold text-gray-700">- €</span>
          </div>
          <div className="flex justify-between text-xs bg-white p-2 rounded">
            <span className="text-gray-600">Compensación Excedentes (0,07€/Kw) + KW acumulados bateria virtual:</span>
            <span className="font-bold text-gray-700">- €</span>
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
      <div className="bg-gradient-to-r from-secondary to-secondary/90 text-white p-6 rounded-lg shadow-lg">
        <div className="text-center mb-4">
          <h3 className="font-bold text-xl flex items-center justify-center">
            <Euro className="h-5 w-5 mr-2" />
            RESUMEN FINANCIERO
          </h3>
        </div>
        
        <div className="space-y-3">
          <div className="flex justify-between font-bold bg-white/10 p-2 rounded">
            <span>TOTAL BASE FACTURA:</span>
            <span>{totalBase.toFixed(2)} €</span>
          </div>
          <div className="flex justify-between bg-white/10 p-2 rounded">
            <span>I.V.A (21% × {totalBase.toFixed(2)}):</span>
            <span>{iva.toFixed(2)} €</span>
          </div>
          <div className="flex justify-between font-bold text-lg bg-white/20 p-3 rounded border-2 border-white/30">
            <span>TOTAL FACTURA OFERTA:</span>
            <span>{totalFactura.toFixed(2)} €</span>
          </div>
          <div className="flex justify-between bg-white/10 p-2 rounded">
            <span>PAGA ACTUALMENTE:</span>
            <span>{facturaActual.toFixed(2)} €</span>
          </div>
          <div className={`flex justify-between font-bold text-lg p-3 rounded border-2 ${ahorroAnual > 0 ? 'bg-green-500 border-green-300' : 'bg-red-500 border-red-300'}`}>
            <span>AHORRO EN FACTURA: {porcentajeAhorro.toFixed(2)}%</span>
            <span>
              {ahorroAnual.toFixed(2)} €
            </span>
          </div>
          <div className={`flex justify-between font-bold text-2xl p-4 rounded-lg shadow-inner ${ahorroAnual > 0 ? 'bg-green-600 text-green-100' : 'bg-red-600 text-red-100'}`}>
            <span>AHORRO ANUAL ESTIMADO:</span>
            <span>
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
    <>
      <style jsx global>{`
        @media print {
          .print-hidden { display: none !important; }
          .print-full { 
            position: fixed !important;
            top: 0 !important;
            left: 0 !important;
            right: 0 !important;
            bottom: 0 !important;
            z-index: 9999 !important;
            background: white !important;
            width: 100% !important;
            height: 100% !important;
            overflow: visible !important;
          }
          body * { visibility: hidden; }
          .print-full, .print-full * { visibility: visible; }
        }
      `}</style>
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50 print-hidden">
        <div className="bg-white rounded-lg shadow-xl max-w-5xl w-full max-h-[90vh] overflow-y-auto print-full">
        
        {/* Header del informe */}
        <div className="sticky top-0 bg-white border-b p-4 flex items-center justify-between print-hidden">
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
