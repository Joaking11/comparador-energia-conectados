
'use client';

import { useState, useMemo, useEffect } from 'react';
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
import { Scatter } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  LinearScale,
  PointElement,
  LineElement,
  Tooltip,
  Legend,
  CategoryScale,
  ChartOptions,
} from 'chart.js';

// Registrar los componentes de Chart.js
ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Tooltip, Legend);

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

// Paleta de colores para comercializadoras
const COLORES_COMERCIALIZADORAS = [
  '#FF6384', // Rosa
  '#36A2EB', // Azul
  '#FFCE56', // Amarillo
  '#4BC0C0', // Turquesa
  '#9966FF', // Púrpura
  '#FF9F40', // Naranja
  '#FF6B9D', // Rosa claro
  '#C9CBCF', // Gris
  '#4ECDC4', // Verde agua
  '#FF5E5B', // Coral
  '#45B7D1', // Azul cielo
  '#FFA07A', // Dorado
  '#98D8C8', // Verde menta
  '#F7DC6F', // Amarillo claro
  '#BB8FCE', // Lavanda
];

export default function MatrizInteractivaResultados({ 
  resultados, 
  onSeleccionarOferta 
}: MatrizInteractivaProps) {
  const [comercializadorasOcultas, setComercializadorasOcultas] = useState<Set<string>>(new Set());
  const [criterioOrden, setCriterioOrden] = useState<CriterioOrden>('ahorro');
  const [direccionOrden, setDireccionOrden] = useState<DireccionOrden>('desc');
  const [mostrarSoloPositivos, setMostrarSoloPositivos] = useState(false);

  // Obtener comercializadoras únicas y asignarles colores
  const comercializadorasConColor = useMemo(() => {
    const uniqueComercializadoras = new Map();
    resultados.forEach(resultado => {
      const com = resultado.tarifa.comercializadora;
      if (!uniqueComercializadoras.has(com.id)) {
        uniqueComercializadoras.set(com.id, com);
      }
    });
    
    return Array.from(uniqueComercializadoras.values()).map((comercializadora, index) => ({
      ...comercializadora,
      color: COLORES_COMERCIALIZADORAS[index % COLORES_COMERCIALIZADORAS.length]
    }));
  }, [resultados]);

  // Preparar datos para el scatter plot
  const datosScatter = useMemo(() => {
    const datasets = comercializadorasConColor.map(comercializadora => {
      // Filtrar ofertas de esta comercializadora
      const ofertasComercializadora = resultados.filter(resultado => 
        resultado.tarifa.comercializadora.id === comercializadora.id &&
        !comercializadorasOcultas.has(comercializadora.id) &&
        (!mostrarSoloPositivos || resultado.ahorroMensual > 0)
      );

      return {
        label: comercializadora.nombre,
        data: ofertasComercializadora.map(resultado => ({
          x: resultado.costoMensual,
          y: resultado.comisionTotal,
          resultado: resultado // Guardar referencia para clicks
        })),
        backgroundColor: comercializadora.color + '80', // Semi-transparente
        borderColor: comercializadora.color,
        borderWidth: 2,
        pointRadius: 8,
        pointHoverRadius: 12,
        hidden: comercializadorasOcultas.has(comercializadora.id)
      };
    });

    return { datasets };
  }, [resultados, comercializadorasConColor, comercializadorasOcultas, mostrarSoloPositivos]);

  // Opciones del gráfico scatter
  const opcionesScatter: ChartOptions<'scatter'> = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      title: {
        display: true,
        text: 'Matriz de Comparación: Coste vs Comisión',
        font: {
          size: 16,
          weight: 'bold'
        }
      },
      legend: {
        position: 'top' as const,
        onClick: (e, legendItem, legend) => {
          // Manejar click en leyenda para mostrar/ocultar comercializadora
          const comercializadora = comercializadorasConColor.find(c => c.nombre === legendItem.text);
          if (comercializadora) {
            toggleComercializadora(comercializadora.id);
          }
        }
      },
      tooltip: {
        callbacks: {
          title: (context) => {
            const punto = context[0].raw as any;
            return punto.resultado.tarifa.nombre;
          },
          label: (context) => {
            const punto = context.raw as any;
            const resultado = punto.resultado;
            return [
              `Comercializadora: ${resultado.tarifa.comercializadora.nombre}`,
              `Coste mensual: ${resultado.costoMensual.toFixed(2)}€`,
              `Comisión: ${resultado.comisionTotal.toFixed(2)}€`,
              `Ahorro: ${resultado.ahorroMensual.toFixed(2)}€`
            ];
          }
        }
      }
    },
    scales: {
      x: {
        type: 'linear',
        display: true,
        title: {
          display: true,
          text: 'Coste para el cliente (€/mes)',
          font: {
            size: 14,
            weight: 'bold'
          }
        }
      },
      y: {
        type: 'linear',
        display: true,
        title: {
          display: true,
          text: 'Comisión (€/mes)',
          font: {
            size: 14,
            weight: 'bold'
          }
        }
      }
    },
    onClick: (event, elements) => {
      if (elements.length > 0) {
        const element = elements[0];
        const datasetIndex = element.datasetIndex;
        const dataIndex = element.index;
        const punto = datosScatter.datasets[datasetIndex].data[dataIndex] as any;
        
        if (punto.resultado && onSeleccionarOferta) {
          onSeleccionarOferta(punto.resultado);
        }
      }
    }
  };

  // Filtrar y ordenar resultados para la tabla
  const resultadosFiltrados = useMemo(() => {
    let filtrados = resultados.filter(resultado => {
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
        default:
          valorA = a.ahorroMensual;
          valorB = b.ahorroMensual;
      }

      return direccionOrden === 'asc' ? valorA - valorB : valorB - valorA;
    });

    return filtrados;
  }, [resultados, comercializadorasOcultas, criterioOrden, direccionOrden, mostrarSoloPositivos]);

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
            Matriz de Dispersión: Coste vs Comisión
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          
          {/* Controles principales */}
          <div className="flex flex-wrap items-center gap-6">
            <div className="flex items-center space-x-2">
              <Switch
                id="solo-positivos"
                checked={mostrarSoloPositivos}
                onCheckedChange={setMostrarSoloPositivos}
              />
              <Label htmlFor="solo-positivos">Solo ofertas con ahorro</Label>
            </div>
          </div>

          {/* Leyenda de Comercializadoras */}
          <div>
            <Label className="text-sm font-medium mb-3 block">Comercializadoras (haz clic para ocultar/mostrar):</Label>
            <div className="flex flex-wrap gap-2">
              {comercializadorasConColor.map(comercializadora => (
                <Button
                  key={comercializadora.id}
                  variant={comercializadorasOcultas.has(comercializadora.id) ? 'outline' : 'secondary'}
                  size="sm"
                  onClick={() => toggleComercializadora(comercializadora.id)}
                  className={`flex items-center gap-2 ${
                    comercializadorasOcultas.has(comercializadora.id) 
                      ? 'opacity-50 text-gray-400' 
                      : ''
                  }`}
                  style={{
                    borderColor: comercializadora.color,
                    backgroundColor: comercializadorasOcultas.has(comercializadora.id) 
                      ? 'transparent' 
                      : comercializadora.color + '20'
                  }}
                >
                  <div 
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: comercializadora.color }}
                  />
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

      {/* Gráfico de Dispersión */}
      <Card>
        <CardContent className="p-6">
          <div style={{ height: '500px' }}>
            <Scatter data={datosScatter} options={opcionesScatter} />
          </div>
        </CardContent>
      </Card>

      {/* Tabla de Resultados */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Award className="h-5 w-5" />
              Ranking de Ofertas
            </CardTitle>
            
            {/* Controles de Ordenación */}
            <div className="flex items-center gap-2">
              <Label className="text-sm">Ordenar por:</Label>
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
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {resultadosFiltrados.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              No hay resultados que mostrar con los filtros aplicados
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-3 px-4 font-medium text-gray-700">#</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-700">Comercializadora</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-700">Oferta</th>
                    <th className="text-right py-3 px-4 font-medium text-gray-700">Coste Factura</th>
                    <th className="text-right py-3 px-4 font-medium text-gray-700">Ahorro</th>
                    <th className="text-right py-3 px-4 font-medium text-gray-700">Comisión</th>
                    <th className="text-center py-3 px-4 font-medium text-gray-700">Acción</th>
                  </tr>
                </thead>
                <tbody>
                  {resultadosFiltrados.map((resultado, index) => {
                    const comercializadora = comercializadorasConColor.find(c => 
                      c.id === resultado.tarifa.comercializadora.id
                    );
                    
                    return (
                      <tr key={resultado.id} className="border-b hover:bg-gray-50">
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-2">
                            <Badge variant={index < 3 ? 'default' : 'secondary'}>
                              #{index + 1}
                            </Badge>
                            {index < 3 && (
                              <span className="text-lg">
                                {index === 0 ? '🥇' : index === 1 ? '🥈' : '🥉'}
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-2">
                            <div 
                              className="w-3 h-3 rounded-full"
                              style={{ backgroundColor: comercializadora?.color || '#666' }}
                            />
                            <span className="font-medium">
                              {resultado.tarifa.comercializadora.nombre}
                            </span>
                          </div>
                        </td>
                        <td className="py-3 px-4 text-sm text-gray-600">
                          {resultado.tarifa.nombre}
                        </td>
                        <td className="py-3 px-4 text-right font-semibold">
                          {resultado.costoMensual.toFixed(2)}€
                        </td>
                        <td className="py-3 px-4 text-right">
                          <span className={`px-2 py-1 rounded text-sm font-semibold ${getColorAhorro(resultado.ahorroMensual)}`}>
                            {resultado.ahorroMensual > 0 ? '+' : ''}{resultado.ahorroMensual.toFixed(2)}€
                          </span>
                        </td>
                        <td className="py-3 px-4 text-right font-semibold text-green-600">
                          {resultado.comisionTotal.toFixed(2)}€
                        </td>
                        <td className="py-3 px-4 text-center">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => onSeleccionarOferta?.(resultado)}
                          >
                            <Eye className="h-3 w-3 mr-1" />
                            Ver
                          </Button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

    </div>
  );
}
