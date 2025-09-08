
'use client';

import { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { 
  Filter, 
  ArrowUpDown, 
  Eye, 
  EyeOff,
  TrendingUp,
  TrendingDown,
  Award,
  DollarSign,
  Zap
} from 'lucide-react';

interface ComparativaResultado {
  id: string;
  tarifa: {
    id: string;
    nombre: string;
    comercializadora: {
      id: string;
      nombre: string;
      activa: boolean;
    };
  };
  precioEnergia: number;
  precioPotencia: number;
  costoMensual: number;
  ahorroMensual: number;
  comisionEnergia: number;
  comisionPotencia: number;
  comisionTotal: number;
  puntuacionTotal?: number;
}

interface MatrizInteractivaProps {
  resultados: ComparativaResultado[];
  onSeleccionarOferta?: (resultado: ComparativaResultado) => void;
}

type CriterioOrden = 'precio' | 'ahorro' | 'comision' | 'puntuacion';
type DireccionOrden = 'asc' | 'desc';

export default function MatrizInteractivaResultados({ 
  resultados, 
  onSeleccionarOferta 
}: MatrizInteractivaProps) {
  const [comercializadorasOcultas, setComercializadorasOcultas] = useState<Set<string>>(new Set());
  const [criterioOrden, setCriterioOrden] = useState<CriterioOrden>('ahorro');
  const [direccionOrden, setDireccionOrden] = useState<DireccionOrden>('desc');
  const [mostrarSoloPositivos, setMostrarSoloPositivos] = useState(false);
  const [verComisiones, setVerComisiones] = useState(true);

  // Calcular puntuaciones y normalizar valores
  const resultadosConPuntuacion = useMemo(() => {
    if (!resultados.length) return [];

    // Encontrar valores mínimos y máximos para normalización
    const minCosto = Math.min(...resultados.map(r => r.costoMensual));
    const maxCosto = Math.max(...resultados.map(r => r.costoMensual));
    const minComision = Math.min(...resultados.map(r => r.comisionTotal));
    const maxComision = Math.max(...resultados.map(r => r.comisionTotal));

    return resultados.map(resultado => {
      // Calcular puntuaciones (0-100)
      const puntuacionPrecio = maxCosto > minCosto 
        ? ((maxCosto - resultado.costoMensual) / (maxCosto - minCosto)) * 100 
        : 100;
      
      const puntuacionComision = maxComision > minComision
        ? ((resultado.comisionTotal - minComision) / (maxComision - minComision)) * 100
        : 100;

      const puntuacionAhorro = resultado.ahorroMensual > 0 
        ? Math.min((resultado.ahorroMensual / 50) * 100, 100) // Normalizar hasta 50€ de ahorro
        : 0;

      // Puntuación total ponderada
      const puntuacionTotal = (puntuacionPrecio * 0.4) + (puntuacionComision * 0.3) + (puntuacionAhorro * 0.3);

      return {
        ...resultado,
        puntuacionPrecio: Math.round(puntuacionPrecio),
        puntuacionComision: Math.round(puntuacionComision),
        puntuacionAhorro: Math.round(puntuacionAhorro),
        puntuacionTotal: Math.round(puntuacionTotal)
      };
    });
  }, [resultados]);

  // Filtrar y ordenar resultados
  const resultadosFiltrados = useMemo(() => {
    let filtrados = resultadosConPuntuacion.filter(resultado => {
      const comercializadoraOculta = comercializadorasOcultas.has(resultado.tarifa.comercializadora.id);
      const soloPositivos = mostrarSoloPositivos ? resultado.ahorroMensual > 0 : true;
      return !comercializadoraOculta && soloPositivos;
    });

    // Ordenar según criterio seleccionado
    filtrados.sort((a, b) => {
      let valorA, valorB;
      
      switch (criterioOrden) {
        case 'precio':
          valorA = a.costoMensual;
          valorB = b.costoMensual;
          break;
        case 'ahorro':
          valorA = a.ahorroMensual;
          valorB = b.ahorroMensual;
          break;
        case 'comision':
          valorA = a.comisionTotal;
          valorB = b.comisionTotal;
          break;
        case 'puntuacion':
          valorA = a.puntuacionTotal;
          valorB = b.puntuacionTotal;
          break;
        default:
          valorA = a.puntuacionTotal;
          valorB = b.puntuacionTotal;
      }

      return direccionOrden === 'asc' ? valorA - valorB : valorB - valorA;
    });

    return filtrados;
  }, [resultadosConPuntuacion, comercializadorasOcultas, criterioOrden, direccionOrden, mostrarSoloPositivos]);

  // Obtener comercializadoras únicas
  const comercializadoras = useMemo(() => {
    const uniqueComercializadoras = new Map();
    resultados.forEach(resultado => {
      const com = resultado.tarifa.comercializadora;
      if (!uniqueComercializadoras.has(com.id)) {
        uniqueComercializadoras.set(com.id, com);
      }
    });
    return Array.from(uniqueComercializadoras.values());
  }, [resultados]);

  const toggleComercializadora = (comercializadoraId: string) => {
    setComercializadorasOcultas(prev => {
      const newSet = new Set(prev);
      if (newSet.has(comercializadoraId)) {
        newSet.delete(comercializadoraId);
      } else {
        newSet.add(comercializadoraId);
      }
      return newSet;
    });
  };

  const cambiarOrden = (nuevoCriterio: CriterioOrden) => {
    if (criterioOrden === nuevoCriterio) {
      setDireccionOrden(direccionOrden === 'asc' ? 'desc' : 'asc');
    } else {
      setCriterioOrden(nuevoCriterio);
      setDireccionOrden('desc');
    }
  };

  const renderPuntos = (valor: number, maxValor: number = 100) => {
    const numPuntos = Math.ceil((valor / maxValor) * 10);
    const puntos = [];
    
    for (let i = 0; i < 10; i++) {
      puntos.push(
        <div
          key={i}
          className={`w-2 h-2 rounded-full ${
            i < numPuntos 
              ? valor >= 80 ? 'bg-green-500' : valor >= 60 ? 'bg-yellow-500' : 'bg-red-500'
              : 'bg-gray-200'
          }`}
        />
      );
    }
    
    return <div className="flex gap-1">{puntos}</div>;
  };

  const getColorAhorro = (ahorro: number) => {
    if (ahorro > 20) return 'text-green-600 bg-green-100';
    if (ahorro > 0) return 'text-green-500 bg-green-50';
    if (ahorro > -10) return 'text-orange-500 bg-orange-50';
    return 'text-red-600 bg-red-100';
  };

  return (
    <div className="space-y-6">
      
      {/* Panel de Filtros y Controles */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Matriz Interactiva de Resultados
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          
          {/* Controles de Ordenación */}
          <div className="flex flex-wrap items-center gap-3">
            <Label>Ordenar por:</Label>
            
            <Button
              variant={criterioOrden === 'precio' ? 'default' : 'outline'}
              size="sm"
              onClick={() => cambiarOrden('precio')}
              className="flex items-center gap-1"
            >
              <DollarSign className="h-3 w-3" />
              Precio
              {criterioOrden === 'precio' && (
                direccionOrden === 'asc' ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />
              )}
            </Button>

            <Button
              variant={criterioOrden === 'ahorro' ? 'default' : 'outline'}
              size="sm"
              onClick={() => cambiarOrden('ahorro')}
              className="flex items-center gap-1"
            >
              <TrendingUp className="h-3 w-3" />
              Ahorro
              {criterioOrden === 'ahorro' && (
                direccionOrden === 'asc' ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />
              )}
            </Button>

            {verComisiones && (
              <Button
                variant={criterioOrden === 'comision' ? 'default' : 'outline'}
                size="sm"
                onClick={() => cambiarOrden('comision')}
                className="flex items-center gap-1"
              >
                <Award className="h-3 w-3" />
                Comisión
                {criterioOrden === 'comision' && (
                  direccionOrden === 'asc' ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />
                )}
              </Button>
            )}

            <Button
              variant={criterioOrden === 'puntuacion' ? 'default' : 'outline'}
              size="sm"
              onClick={() => cambiarOrden('puntuacion')}
              className="flex items-center gap-1"
            >
              <Zap className="h-3 w-3" />
              Puntuación
              {criterioOrden === 'puntuacion' && (
                direccionOrden === 'asc' ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />
              )}
            </Button>
          </div>

          {/* Switches de Control */}
          <div className="flex flex-wrap items-center gap-6">
            <div className="flex items-center space-x-2">
              <Switch
                id="solo-positivos"
                checked={mostrarSoloPositivos}
                onCheckedChange={setMostrarSoloPositivos}
              />
              <Label htmlFor="solo-positivos">Solo ofertas con ahorro</Label>
            </div>

            <div className="flex items-center space-x-2">
              <Switch
                id="ver-comisiones"
                checked={verComisiones}
                onCheckedChange={setVerComisiones}
              />
              <Label htmlFor="ver-comisiones">Mostrar comisiones</Label>
            </div>
          </div>

          {/* Filtros de Comercializadoras */}
          <div>
            <Label className="text-sm font-medium">Comercializadoras (haz clic para ocultar/mostrar):</Label>
            <div className="flex flex-wrap gap-2 mt-2">
              {comercializadoras.map(comercializadora => (
                <Button
                  key={comercializadora.id}
                  variant={comercializadorasOcultas.has(comercializadora.id) ? 'outline' : 'secondary'}
                  size="sm"
                  onClick={() => toggleComercializadora(comercializadora.id)}
                  className={`flex items-center gap-1 ${
                    comercializadorasOcultas.has(comercializadora.id) 
                      ? 'opacity-50 text-gray-400' 
                      : ''
                  }`}
                >
                  {comercializadorasOcultas.has(comercializadora.id) ? (
                    <EyeOff className="h-3 w-3" />
                  ) : (
                    <Eye className="h-3 w-3" />
                  )}
                  {comercializadora.nombre}
                </Button>
              ))}
            </div>
          </div>

        </CardContent>
      </Card>

      {/* Matriz de Resultados */}
      <Card>
        <CardHeader>
          <CardTitle>
            Resultados ({resultadosFiltrados.length} ofertas)
          </CardTitle>
        </CardHeader>
        <CardContent>
          {resultadosFiltrados.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              No hay resultados que mostrar con los filtros aplicados
            </div>
          ) : (
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {resultadosFiltrados.map((resultado, index) => (
                <div
                  key={resultado.id}
                  className={`p-4 rounded-lg border transition-all duration-200 hover:shadow-md cursor-pointer ${
                    resultado.ahorroMensual > 0 
                      ? 'border-green-200 bg-green-50/50' 
                      : 'border-gray-200 bg-gray-50/50'
                  }`}
                  onClick={() => onSeleccionarOferta?.(resultado)}
                >
                  <div className="flex items-center justify-between">
                    
                    {/* Información Principal */}
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <Badge className="bg-primary text-white">
                          #{index + 1}
                        </Badge>
                        <div>
                          <div className="font-semibold text-gray-900">
                            {resultado.tarifa.comercializadora.nombre}
                          </div>
                          <div className="text-sm text-gray-600">
                            {resultado.tarifa.nombre}
                          </div>
                        </div>
                      </div>

                      {/* Métricas en Grid */}
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                        
                        {/* Precio */}
                        <div>
                          <div className="text-gray-500">Costo Mensual</div>
                          <div className="font-semibold">{resultado.costoMensual.toFixed(2)}€</div>
                          <div className="mt-1">
                            {renderPuntos(resultado.puntuacionPrecio)}
                          </div>
                        </div>

                        {/* Ahorro */}
                        <div>
                          <div className="text-gray-500">Ahorro Mensual</div>
                          <div className={`font-semibold px-2 py-1 rounded text-center ${getColorAhorro(resultado.ahorroMensual)}`}>
                            {resultado.ahorroMensual > 0 ? '+' : ''}{resultado.ahorroMensual.toFixed(2)}€
                          </div>
                          <div className="mt-1">
                            {renderPuntos(resultado.puntuacionAhorro)}
                          </div>
                        </div>

                        {/* Comisión */}
                        {verComisiones && (
                          <div>
                            <div className="text-gray-500">Comisión Total</div>
                            <div className="font-semibold text-green-600">
                              {resultado.comisionTotal.toFixed(2)}€
                            </div>
                            <div className="mt-1">
                              {renderPuntos(resultado.puntuacionComision)}
                            </div>
                          </div>
                        )}

                        {/* Puntuación Total */}
                        <div>
                          <div className="text-gray-500">Puntuación</div>
                          <div className="flex items-center gap-2">
                            <Badge 
                              variant={
                                resultado.puntuacionTotal >= 80 ? 'default' :
                                resultado.puntuacionTotal >= 60 ? 'secondary' : 'outline'
                              }
                            >
                              {resultado.puntuacionTotal}/100
                            </Badge>
                          </div>
                          <div className="mt-1">
                            {renderPuntos(resultado.puntuacionTotal)}
                          </div>
                        </div>

                      </div>
                    </div>

                    {/* Indicador Visual de Ranking */}
                    <div className="ml-4 flex flex-col items-center">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-white ${
                        index === 0 ? 'bg-yellow-500' :
                        index === 1 ? 'bg-gray-400' :
                        index === 2 ? 'bg-orange-600' : 'bg-gray-300'
                      }`}>
                        {index + 1}
                      </div>
                      {index < 3 && (
                        <div className="text-xs mt-1 text-center">
                          {index === 0 ? '🥇' : index === 1 ? '🥈' : '🥉'}
                        </div>
                      )}
                    </div>

                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Leyenda */}
      <Card>
        <CardContent className="py-4">
          <div className="text-sm text-gray-600">
            <div className="font-semibold mb-2">Leyenda de Puntuación:</div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="flex items-center gap-2">
                <div className="flex gap-1">
                  {[0,1,2].map(i => (
                    <div key={i} className="w-2 h-2 rounded-full bg-green-500" />
                  ))}
                </div>
                <span>80-100 puntos (Excelente)</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="flex gap-1">
                  {[0,1,2].map(i => (
                    <div key={i} className="w-2 h-2 rounded-full bg-yellow-500" />
                  ))}
                </div>
                <span>60-79 puntos (Bueno)</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="flex gap-1">
                  {[0,1,2].map(i => (
                    <div key={i} className="w-2 h-2 rounded-full bg-red-500" />
                  ))}
                </div>
                <span>0-59 puntos (Mejorable)</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

    </div>
  );
}
