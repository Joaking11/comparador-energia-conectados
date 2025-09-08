
'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  X, 
  Calculator, 
  TrendingUp, 
  Building, 
  Zap, 
  Euro,
  FileText,
  Download,
  Share2
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
  
  // Cálculos detallados
  const consumoAnual = comparativa.consumoAnualElectricidad;
  const potenciaContratada = comparativa.potenciaP1;
  const facturaActual = comparativa.totalFacturaElectricidad;
  const nuevaFactura = resultado.importeCalculado;
  const ahorroAnual = facturaActual - nuevaFactura;
  const porcentajeAhorro = (ahorroAnual / facturaActual) * 100;
  
  // Desglose de costos
  const costoEnergia = consumoAnual * resultado.tarifa.energiaP1;
  const costoPotencia = (resultado.tarifa.potenciaP1 || 0) * potenciaContratada * 12;
  const otrosCostos = nuevaFactura - costoEnergia - costoPotencia;
  
  // Comparación con tarifa actual
  const tarifahActualFicticia = facturaActual / consumoAnual; // Precio promedio actual
  const diferenciaPrecioEnergia = resultado.tarifa.energiaP1 - tarifahActualFicticia;
  
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        
        {/* Header del informe */}
        <div className="sticky top-0 bg-white border-b p-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">
                Informe Detallado - {resultado.tarifa.nombreOferta}
              </h2>
              <p className="text-gray-600">
                {resultado.tarifa.comercializadora.nombre} | 
                Cliente: {comparativa.cliente.razonSocial}
              </p>
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
        </div>

        <div className="p-6 space-y-6">
          
          {/* Resumen ejecutivo */}
          <Card>
            <CardHeader className="bg-gradient-to-r from-primary to-primary/80 text-white">
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                Resumen Ejecutivo
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="text-center">
                  <div className="text-3xl font-bold text-primary mb-2">
                    {ahorroAnual > 0 ? '+' : ''}{ahorroAnual.toFixed(0)}€
                  </div>
                  <div className="text-sm text-gray-600">Ahorro Anual</div>
                  <div className="text-lg font-medium text-secondary">
                    {porcentajeAhorro.toFixed(1)}%
                  </div>
                </div>
                
                <div className="text-center">
                  <div className="text-3xl font-bold text-gray-900 mb-2">
                    {nuevaFactura.toFixed(0)}€
                  </div>
                  <div className="text-sm text-gray-600">Nueva Factura Anual</div>
                  <div className="text-sm text-gray-500">
                    vs {facturaActual.toFixed(0)}€ actual
                  </div>
                </div>
                
                <div className="text-center">
                  <div className="text-3xl font-bold text-accent mb-2">
                    {resultado.comisionGanada.toFixed(0)}€
                  </div>
                  <div className="text-sm text-gray-600">Comisión Anual</div>
                  <Badge variant="outline" className="mt-1">
                    {resultado.tarifa.rango === 'E' ? 'Por Energía' : 'Por Potencia'}
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Información de la oferta */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Building className="h-5 w-5" />
                  Información de la Oferta
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-gray-600">Comercializadora</label>
                  <p className="text-lg font-semibold">{resultado.tarifa.comercializadora.nombre}</p>
                </div>
                
                <div>
                  <label className="text-sm font-medium text-gray-600">Nombre de la Oferta</label>
                  <p className="text-lg font-semibold">{resultado.tarifa.nombreOferta}</p>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-gray-600">Tipo</label>
                    <div>
                      <Badge variant={resultado.tarifa.tipoOferta === 'Fijo' ? 'default' : 'secondary'}>
                        {resultado.tarifa.tipoOferta}
                      </Badge>
                    </div>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-600">Tarifa</label>
                    <p className="font-medium">{resultado.tarifa.tarifa}</p>
                  </div>
                </div>
                
                <div>
                  <label className="text-sm font-medium text-gray-600">Zona</label>
                  <p className="font-medium">{resultado.tarifa.zona}</p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  Datos del Cliente
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-gray-600">Razón Social</label>
                  <p className="text-lg font-semibold">{comparativa.cliente.razonSocial}</p>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-gray-600">Consumo Anual</label>
                    <p className="font-medium">{consumoAnual?.toLocaleString()} kWh</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-600">Potencia Contratada</label>
                    <p className="font-medium">{potenciaContratada} kW</p>
                  </div>
                </div>
                
                <div>
                  <label className="text-sm font-medium text-gray-600">Facturación Actual</label>
                  <p className="text-lg font-semibold text-primary">{facturaActual.toFixed(2)}€/año</p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Desglose de costos */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calculator className="h-5 w-5" />
                Desglose de Costos Anuales
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  
                  {/* Tarifa actual vs nueva */}
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-3">Comparación de Tarifas</h4>
                    <div className="space-y-3">
                      <div className="flex justify-between items-center p-3 bg-gray-50 rounded">
                        <span className="text-sm font-medium">Tarifa Actual (estimada)</span>
                        <span className="font-bold">{facturaActual.toFixed(2)}€</span>
                      </div>
                      <div className="flex justify-between items-center p-3 bg-primary/10 rounded">
                        <span className="text-sm font-medium">Nueva Tarifa</span>
                        <span className="font-bold text-primary">{nuevaFactura.toFixed(2)}€</span>
                      </div>
                      <div className="flex justify-between items-center p-3 bg-secondary/10 rounded border-2 border-secondary">
                        <span className="text-sm font-medium">
                          {ahorroAnual > 0 ? 'Ahorro Total' : 'Incremento Total'}
                        </span>
                        <span className={`font-bold text-lg ${ahorroAnual > 0 ? 'text-secondary' : 'text-red-600'}`}>
                          {ahorroAnual > 0 ? '+' : ''}{ahorroAnual.toFixed(2)}€
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Desglose de la nueva tarifa */}
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-3">Desglose Nueva Tarifa</h4>
                    <div className="space-y-3">
                      <div className="flex justify-between items-center">
                        <div>
                          <span className="text-sm font-medium">Costo Energía</span>
                          <div className="text-xs text-gray-500">
                            {consumoAnual?.toLocaleString()} kWh × {resultado.tarifa.energiaP1.toFixed(4)}€/kWh
                          </div>
                        </div>
                        <span className="font-bold">{costoEnergia.toFixed(2)}€</span>
                      </div>
                      
                      <div className="flex justify-between items-center">
                        <div>
                          <span className="text-sm font-medium">Término Potencia</span>
                          <div className="text-xs text-gray-500">
                            {potenciaContratada} kW × {(resultado.tarifa.potenciaP1 || 0).toFixed(2)}€/kW × 12 meses
                          </div>
                        </div>
                        <span className="font-bold">{costoPotencia.toFixed(2)}€</span>
                      </div>
                      
                      {otrosCostos > 0 && (
                        <div className="flex justify-between items-center">
                          <span className="text-sm font-medium">Otros conceptos</span>
                          <span className="font-bold">{otrosCostos.toFixed(2)}€</span>
                        </div>
                      )}
                      
                      <hr className="border-gray-300" />
                      
                      <div className="flex justify-between items-center font-bold text-lg">
                        <span>Total Anual</span>
                        <span>{nuevaFactura.toFixed(2)}€</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Análisis de rentabilidad */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Euro className="h-5 w-5" />
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
                          {(ahorroAnual * años).toFixed(0)}€
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
                
                <div>
                  <h4 className="font-semibold text-gray-900 mb-3">Comisiones del Consultor</h4>
                  <div className="space-y-3">
                    {[1, 2, 3, 5].map(años => (
                      <div key={años} className="flex justify-between items-center">
                        <span className="text-sm">Comisión a {años} {años === 1 ? 'año' : 'años'}</span>
                        <span className="font-bold text-accent">
                          {(resultado.comisionGanada * años).toFixed(0)}€
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
              
              {/* Indicador visual del ahorro */}
              <div className="mt-6">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-medium">Porcentaje de Ahorro</span>
                  <span className="font-bold">{porcentajeAhorro.toFixed(1)}%</span>
                </div>
                <Progress 
                  value={Math.min(Math.abs(porcentajeAhorro), 100)} 
                  className="h-3"
                />
                <p className="text-xs text-gray-500 mt-1">
                  {ahorroAnual > 0 
                    ? 'Ahorro significativo respecto a la factura actual'
                    : 'Incremento en la facturación'
                  }
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Recomendaciones */}
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
                      un ahorro anual de <strong>{ahorroAnual.toFixed(0)}€</strong> ({porcentajeAhorro.toFixed(1)}%) 
                      comparado con su facturación actual.
                    </p>
                    {resultado.comisionGanada > 0 && (
                      <p className="text-gray-700 mt-2">
                        Además, generará una comisión anual de <strong>{resultado.comisionGanada.toFixed(0)}€</strong> 
                        para el consultor energético.
                      </p>
                    )}
                  </div>
                ) : (
                  <div>
                    <p className="text-red-800 font-medium mb-2">
                      ⚠️ <strong>Recomendación: NO RECOMENDABLE</strong>
                    </p>
                    <p className="text-gray-700">
                      Esta oferta supondría un incremento anual de <strong>{Math.abs(ahorroAnual).toFixed(0)}€</strong> 
                      comparado con la facturación actual. Se recomienda evaluar otras opciones.
                    </p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

        </div>
      </div>
    </div>
  );
}
