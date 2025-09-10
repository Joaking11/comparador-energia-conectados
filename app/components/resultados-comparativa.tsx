

'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { 
  TrendingUp, 
  TrendingDown, 
  Users, 
  Zap, 
  Calculator,
  Download,
  Share2,
  Filter,
  Search,
  Building,
  Target,
  Euro,
  Loader2,
  CheckCircle,
  AlertCircle,
  Eye,
  FileText,
  Grid3X3,
  X
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import InformeDetalladoComparativa from './informe-detallado-comparativa';
import MatrizInteractivaResultados from './matriz-interactiva-resultados';

interface ComparativaData {
  id: string;
  titulo?: string | null;
  consumoAnualElectricidad: number;
  potenciaP1: number;
  tarifaAccesoElectricidad: string;
  totalFacturaElectricidad: number;
  comercializadoraActual: string;
  diasPeriodoFactura: number;
  clientes: {
    razonSocial: string;
    cif?: string | null;
    direccion?: string | null;
    localidad?: string | null;
    provincia?: string | null;
  };
  comparativa_ofertas: Array<{
    id: string;
    importeCalculado: number;
    ahorroAnual: number;
    comisionGanada: number;
    tarifas: {
      id: string;
      nombreOferta: string;
      tipoOferta: string;
      tarifa: string;
      energiaP1: number;
      potenciaP1: number | null;
      zona: string;
      comercializadoras: {
        id: string;
        nombre: string;
        color?: string;
        logoUrl?: string;
        activa: boolean;
      };
    };
  }>;
}

interface ResultadosComparativaProps {
  comparativaId: string;
}

export function ResultadosComparativa({ comparativaId }: ResultadosComparativaProps) {
  const [data, setData] = useState<ComparativaData | null>(null);
  const [loading, setLoading] = useState(true);
  const [filtroComercializadora, setFiltroComercializadora] = useState('todas');
  const [filtroTipo, setFiltroTipo] = useState('todos');
  const [busqueda, setBusqueda] = useState('');
  const [recalculando, setRecalculando] = useState(false);
  const [mostrarInformeDetallado, setMostrarInformeDetallado] = useState(false);
  const [resultadoSeleccionado, setResultadoSeleccionado] = useState<any>(null);
  const [vistaActiva, setVistaActiva] = useState<'lista' | 'matriz'>('lista');
  const [mostrandoEdicion, setMostrandoEdicion] = useState(false);
  const [parametrosEdicion, setParametrosEdicion] = useState<{
    feeEnergia: number;
    feeEnergiaMinimo: number | null;
    feeEnergiaMaximo: number | null;
    feePotencia: number;
    feePotenciaMinimo: number | null;
    feePotenciaMaximo: number | null;
  }>({
    feeEnergia: 0.0,
    feeEnergiaMinimo: null,
    feeEnergiaMaximo: null,
    feePotencia: 0.0,
    feePotenciaMinimo: null,
    feePotenciaMaximo: null
  });
  const { toast } = useToast();

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        console.log('🔍 Cargando comparativa:', comparativaId);
        const response = await fetch(`/api/comparativas/${comparativaId}`);
        
        if (!response.ok) {
          throw new Error(`Error ${response.status}: ${response.statusText}`);
        }
        
        const comparativa = await response.json();
        console.log('✅ Datos recibidos:', comparativa);
        console.log('🔢 diasPeriodoFactura:', comparativa.diasPeriodoFactura);
        setData(comparativa);
        
        // Cargar parámetros actuales para edición
        setParametrosEdicion({
          feeEnergia: comparativa.feeEnergia || 0.0,
          feeEnergiaMinimo: comparativa.feeEnergiaMinimo || null,
          feeEnergiaMaximo: comparativa.feeEnergiaMaximo || null,
          feePotencia: comparativa.feePotencia || 0.0,
          feePotenciaMinimo: comparativa.feePotenciaMinimo || null,
          feePotenciaMaximo: comparativa.feePotenciaMaximo || null
        });
        
      } catch (error) {
        console.error('Error cargando comparativa:', error);
        toast({
          title: 'Error',
          description: 'No se pudo cargar la comparativa',
          variant: 'destructive'
        });
      } finally {
        setLoading(false);
      }
    };

    if (comparativaId) {
      fetchData();
    }
  }, [comparativaId, toast]);

  const handleRecalcular = () => {
    // Abrir panel de edición de parámetros
    setMostrandoEdicion(true);
  };

  const handleEjecutarRecalculo = async () => {
    try {
      setRecalculando(true);
      
      const response = await fetch(`/api/comparativas/${comparativaId}/calculate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          parametros: parametrosEdicion
        })
      });
      
      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`);
      }
      
      const result = await response.json();
      
      toast({
        title: 'Recálculo completado',
        description: `Se procesaron ${result.resultados} tarifas exitosamente`,
      });
      
      // Recargar los datos
      const response2 = await fetch(`/api/comparativas/${comparativaId}`);
      if (response2.ok) {
        const comparativa = await response2.json();
        setData(comparativa);
      }
      
      setMostrandoEdicion(false);
      
    } catch (error) {
      console.error('Error recalculando:', error);
      toast({
        title: 'Error',
        description: 'No se pudo recalcular la comparativa',
        variant: 'destructive'
      });
    } finally {
      setRecalculando(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-primary" />
          <p className="text-gray-600">Cargando resultados...</p>
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="text-center py-12">
        <AlertCircle className="h-12 w-12 mx-auto mb-4 text-red-500" />
        <h3 className="text-lg font-semibold text-gray-900 mb-2">No se pudo cargar la comparativa</h3>
        <p className="text-gray-600 mb-4">Ha ocurrido un error al cargar los datos</p>
        <Button onClick={() => window.location.reload()}>
          Reintentar
        </Button>
      </div>
    );
  }

  // Calcular estadísticas con los nombres de campos correctos
  const todasLasOfertas = data.comparativa_ofertas || [];
  
  // Filtrar solo ofertas de comercializadoras ACTIVAS para estadísticas
  const ofertas = todasLasOfertas.filter(oferta => oferta.tarifas.comercializadoras.activa === true);
  console.log(`🔍 Ofertas totales: ${todasLasOfertas.length}, Ofertas activas: ${ofertas.length}`);
  
  const mejorOferta = ofertas.reduce((mejor, actual) => 
    actual.ahorroAnual > mejor.ahorroAnual ? actual : mejor, 
    ofertas[0]
  );
  
  const ahorroTotal = mejorOferta?.ahorroAnual || 0;
  const comisionTotal = ofertas.reduce((sum, o) => sum + o.comisionGanada, 0);
  const comercializadoras = [...new Set(ofertas.map(o => o.tarifas.comercializadoras.nombre))];
  
  // Aplicar filtros
  const ofertasFiltradas = ofertas.filter(oferta => {
    // FILTRO CRÍTICO: Solo comercializadoras ACTIVAS
    const esComercializadoraActiva = oferta.tarifas.comercializadoras.activa === true;
    
    const matchComercializadora = filtroComercializadora === 'todas' || 
      oferta.tarifas.comercializadoras.nombre === filtroComercializadora;
    const matchTipo = filtroTipo === 'todos' || 
      oferta.tarifas.tipoOferta.toLowerCase() === filtroTipo.toLowerCase();
    const matchBusqueda = busqueda === '' ||
      oferta.tarifas.nombreOferta.toLowerCase().includes(busqueda.toLowerCase()) ||
      oferta.tarifas.comercializadoras.nombre.toLowerCase().includes(busqueda.toLowerCase());
    
    return esComercializadoraActiva && matchComercializadora && matchTipo && matchBusqueda;
  });

  const handleShare = async () => {
    try {
      if (navigator.share) {
        await navigator.share({
          title: `Comparativa: ${data.titulo || data.clientes.razonSocial}`,
          text: `Resultados de comparativa energética - Ahorro potencial: ${ahorroTotal.toFixed(0)}€`,
          url: window.location.href,
        });
      } else {
        await navigator.clipboard.writeText(window.location.href);
        toast({
          title: 'Enlace copiado',
          description: 'El enlace de la comparativa se ha copiado al portapapeles',
        });
      }
    } catch (error) {
      console.error('Error sharing:', error);
    }
  };

  const handleVerDetalle = (resultado: any) => {
    setResultadoSeleccionado(resultado);
    setMostrarInformeDetallado(true);
  };

  const handleCerrarInforme = () => {
    setMostrarInformeDetallado(false);
    setResultadoSeleccionado(null);
  };

  const handleDescargarPDF = () => {
    window.print();
  };

  return (
    <div className="space-y-6">
      {/* Header con información de la comparativa */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            {data.titulo || `Comparativa - ${data.clientes.razonSocial}`}
          </h1>
          <p className="text-gray-600">
            Cliente: {data.clientes.razonSocial} | 
            Consumo: {data.consumoAnualElectricidad?.toLocaleString()} kWh | 
            Potencia: {data.potenciaP1} kW
          </p>
        </div>
        <div className="flex space-x-2">
          <Button 
            variant="outline" 
            onClick={handleRecalcular} 
            disabled={recalculando}
          >
            {recalculando ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <Calculator className="h-4 w-4 mr-2" />
            )}
            {recalculando ? 'Recalculando...' : 'Recalcular'}
          </Button>
          <Button variant="outline" onClick={handleShare}>
            <Share2 className="h-4 w-4 mr-2" />
            Compartir
          </Button>
          <Button variant="outline" onClick={handleDescargarPDF}>
            <Download className="h-4 w-4 mr-2" />
            Descargar PDF
          </Button>
        </div>
      </div>

      {/* Resumen de estadísticas */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              Factura Actual
            </CardTitle>
            <Target className="h-4 w-4 text-gray-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900">
              {data.totalFacturaElectricidad?.toFixed(2)}€
            </div>
            <p className="text-xs text-gray-500">
              {data.comercializadoraActual} - {data.tarifaAccesoElectricidad}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              Mejor Ahorro
            </CardTitle>
            <TrendingDown className="h-4 w-4 text-secondary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-secondary">
              {ahorroTotal > 0 ? `${ahorroTotal.toFixed(0)}€` : 'Sin ahorro'}
            </div>
            <p className="text-xs text-gray-500">
              {mejorOferta ? mejorOferta.tarifas.comercializadoras.nombre : 'N/A'}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              Total Comisiones
            </CardTitle>
            <Euro className="h-4 w-4 text-accent" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-accent">
              {comisionTotal.toFixed(0)}€
            </div>
            <p className="text-xs text-gray-500">
              De {ofertas.length} ofertas
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              Comercializadoras
            </CardTitle>
            <Building className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary">
              {comercializadoras.length}
            </div>
            <p className="text-xs text-gray-500">
              Diferentes proveedores
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Filtros y búsqueda */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Filter className="h-5 w-5" />
                Filtros y Búsqueda
              </CardTitle>
              <CardDescription>
                Filtra las ofertas por comercializadora, tipo o busca por nombre
              </CardDescription>
            </div>
            
            {/* Selector de Vista */}
            <div className="flex items-center gap-2">
              <Button
                variant={vistaActiva === 'lista' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setVistaActiva('lista')}
                className="flex items-center gap-1"
              >
                <FileText className="h-4 w-4" />
                Lista
              </Button>
              <Button
                variant={vistaActiva === 'matriz' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setVistaActiva('matriz')}
                className="flex items-center gap-1"
              >
                <Grid3X3 className="h-4 w-4" />
                Matriz
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Comercializadora</label>
              <Select value={filtroComercializadora} onValueChange={setFiltroComercializadora}>
                <SelectTrigger>
                  <SelectValue placeholder="Todas las comercializadoras" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todas">Todas las comercializadoras</SelectItem>
                  {comercializadoras.map(comercializadora => (
                    <SelectItem key={comercializadora} value={comercializadora}>
                      {comercializadora}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Tipo de Tarifa</label>
              <Select value={filtroTipo} onValueChange={setFiltroTipo}>
                <SelectTrigger>
                  <SelectValue placeholder="Todos los tipos" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todos">Todos los tipos</SelectItem>
                  <SelectItem value="fija">Fija</SelectItem>
                  <SelectItem value="indexada">Indexada</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Búsqueda</label>
              <div className="relative">
                <Search className="h-4 w-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <Input
                  placeholder="Buscar por nombre de tarifa..."
                  value={busqueda}
                  onChange={(e) => setBusqueda(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Resultados - Vista condicional */}
      {vistaActiva === 'matriz' ? (
        <MatrizInteractivaResultados
          resultados={ofertasFiltradas.map(resultado => {
            const diasPeriodo = data?.diasPeriodoFactura || 30;
            console.log('🔢 Calculando para matriz - dias:', diasPeriodo);
            return {
              id: resultado.id,
              tarifa: {
                id: resultado.tarifas.id,
                nombre: resultado.tarifas.nombreOferta,
                comercializadora: {
                  id: resultado.tarifas.comercializadoras.id,
                  nombre: resultado.tarifas.comercializadoras.nombre,
                  color: resultado.tarifas.comercializadoras.color,
                  logoUrl: resultado.tarifas.comercializadoras.logoUrl,
                  activa: true // Default value, adjust if needed
                }
              },
              precioEnergia: resultado.tarifas.energiaP1,
              precioPotencia: resultado.tarifas.potenciaP1 || 0,
              costoMensual: (resultado.importeCalculado * 30) / diasPeriodo, // Convertir del período a mensual
              ahorroMensual: ((data.totalFacturaElectricidad - resultado.importeCalculado) * 30) / diasPeriodo, // Ahorro mensual
              comisionEnergia: 0, // Will be calculated by matriz component
              comisionPotencia: 0, // Will be calculated by matriz component
              comisionTotal: resultado.comisionGanada
            };
          })}
          onSeleccionarOferta={(resultado) => {
            const ofertaOriginal = ofertasFiltradas.find(o => o.id === resultado.id);
            if (ofertaOriginal) {
              setResultadoSeleccionado(ofertaOriginal);
              setMostrarInformeDetallado(true);
            }
          }}
        />
      ) : (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calculator className="h-5 w-5" />
              Resultados de Comparativa
            </CardTitle>
            <CardDescription>
              {ofertasFiltradas.length} ofertas encontradas
              {busqueda && ` para "${busqueda}"`}
              {filtroComercializadora !== 'todas' && ` de ${filtroComercializadora}`}
              {filtroTipo !== 'todos' && ` del tipo ${filtroTipo}`}
            </CardDescription>
          </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {ofertasFiltradas.length === 0 ? (
              <div className="text-center py-8">
                <AlertCircle className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  No se encontraron ofertas
                </h3>
                <p className="text-gray-600">
                  Prueba a ajustar los filtros o la búsqueda
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-3 px-4 font-medium text-gray-700">Comercializadora</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-700">Oferta</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-700">Tipo</th>
                      <th className="text-right py-3 px-4 font-medium text-gray-700">Coste Factura</th>
                      <th className="text-right py-3 px-4 font-medium text-gray-700">Ahorro</th>
                      <th className="text-right py-3 px-4 font-medium text-gray-700">Ahorro Anual</th>
                      <th className="text-right py-3 px-4 font-medium text-gray-700">Comisión</th>
                      <th className="text-center py-3 px-4 font-medium text-gray-700">Acciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    {ofertasFiltradas.map((resultado, index) => {
                      const ahorroReal = data.totalFacturaElectricidad - resultado.importeCalculado;
                      const esLaMejor = index === 0;
                      
                      return (
                        <tr key={resultado.id} className="border-b hover:bg-gray-50">
                          <td className="py-3 px-4">
                            <div className="flex items-center gap-2">
                              <div 
                                className="w-3 h-3 rounded-full flex-shrink-0"
                                style={{ backgroundColor: resultado.tarifas.comercializadoras.color || '#6366F1' }}
                              />
                              <div className="font-medium text-gray-900">
                                {resultado.tarifas.comercializadoras.nombre}
                              </div>
                            </div>
                          </td>
                          <td className="py-3 px-4">
                            <div className="font-medium text-gray-900">
                              {resultado.tarifas.nombreOferta}
                            </div>
                            <div className="text-sm text-gray-500">
                              {resultado.tarifas.tipoOferta} - {resultado.tarifas.tarifa}
                            </div>
                          </td>
                          <td className="py-3 px-4">
                            <Badge 
                              variant={resultado.tarifas.tipoOferta === 'Fijo' ? 'default' : 'secondary'}
                              className={resultado.tarifas.tipoOferta === 'Fijo' ? 'bg-primary' : 'bg-secondary'}
                            >
                              {resultado.tarifas.tipoOferta}
                            </Badge>
                          </td>
                          <td className="py-3 px-4 text-right">
                            <div className="font-medium text-gray-900">
                              {resultado.importeCalculado.toFixed(2)}€
                            </div>
                            <div className="text-sm text-gray-500">
                              {resultado.tarifas.energiaP1.toFixed(4)}€/kWh + {resultado.tarifas.potenciaP1 ? resultado.tarifas.potenciaP1.toFixed(2) : '0'}€/kW
                            </div>
                          </td>
                          <td className="py-3 px-4 text-right">
                            <div className={`font-medium ${ahorroReal > 0 ? 'text-secondary' : 'text-red-600'}`}>
                              {ahorroReal > 0 ? `+${ahorroReal.toFixed(0)}€` : `${ahorroReal.toFixed(0)}€`}
                            </div>
                            <div className="text-sm text-gray-500">
                              {ahorroReal > 0 ? 'Ahorro factura' : 'Incremento'}
                            </div>
                          </td>
                          <td className="py-3 px-4 text-right">
                            <div className={`font-medium ${ahorroReal > 0 ? 'text-blue-600' : 'text-red-600'}`}>
                              {ahorroReal > 0 ? `+${((ahorroReal * 365) / (data?.diasPeriodoFactura || 30)).toFixed(0)}€` : `${((ahorroReal * 365) / (data?.diasPeriodoFactura || 30)).toFixed(0)}€`}
                            </div>
                            <div className="text-sm text-gray-500">
                              {ahorroReal > 0 ? 'Ahorro anual' : 'Incremento anual'}
                            </div>
                          </td>
                          <td className="py-3 px-4 text-right">
                            <div className="font-medium text-accent">
                              {resultado.comisionGanada.toFixed(0)}€
                            </div>
                            <div className="text-sm text-gray-500">
                              Comisión
                            </div>
                          </td>
                          <td className="py-3 px-4 text-center">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleVerDetalle(resultado)}
                              className="text-xs"
                            >
                              <Eye className="h-4 w-4 mr-1" />
                              Ver Detalle
                            </Button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
      )}

      {/* Información del cliente */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Información del Cliente
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h3 className="font-medium text-gray-900">Razón Social</h3>
              <p className="text-gray-600">{data.clientes.razonSocial}</p>
            </div>
            {data.clientes.cif && (
              <div>
                <h3 className="font-medium text-gray-900">CIF</h3>
                <p className="text-gray-600">{data.clientes.cif}</p>
              </div>
            )}
            <div>
              <h3 className="font-medium text-gray-900">Consumo Actual</h3>
              <p className="text-gray-600">{data.consumoAnualElectricidad?.toLocaleString()} kWh/año</p>
            </div>
            <div>
              <h3 className="font-medium text-gray-900">Potencia Contratada</h3>
              <p className="text-gray-600">{data.potenciaP1} kW</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Resumen de la mejor oferta */}
      {mejorOferta && (
        <Card className="border-secondary/20 bg-secondary/5">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-secondary">
              <CheckCircle className="h-5 w-5" />
              Recomendación Principal
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <h3 className="font-medium text-gray-900">
                  {mejorOferta.tarifas.comercializadoras.nombre}
                </h3>
                <p className="text-lg font-semibold text-secondary">
                  {mejorOferta.tarifas.nombreOferta}
                </p>
                <p className="text-sm text-gray-600">
                  {mejorOferta.tarifas.tipoOferta} - {mejorOferta.tarifas.tarifa}
                </p>
              </div>
              <div className="text-center">
                <p className="text-sm text-gray-600">Ahorro Anual</p>
                <p className="text-2xl font-bold text-secondary">
                  {(data.totalFacturaElectricidad - mejorOferta.importeCalculado).toFixed(0)}€
                </p>
              </div>
              <div className="text-center">
                <p className="text-sm text-gray-600">Tu Comisión</p>
                <p className="text-2xl font-bold text-accent">
                  {mejorOferta.comisionGanada.toFixed(0)}€
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
      
      {/* Modal del informe detallado */}
      {mostrarInformeDetallado && resultadoSeleccionado && data && (
        <InformeDetalladoComparativa
          resultado={resultadoSeleccionado}
          comparativa={data}
          onClose={handleCerrarInforme}
        />
      )}

      {/* Modal de edición de parámetros para recálculo */}
      {mostrandoEdicion && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                  <Calculator className="h-6 w-6" />
                  Ajustar Parámetros de Cálculo
                </h2>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setMostrandoEdicion(false)}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>

              <div className="space-y-6">
                <div className="bg-blue-50 p-4 rounded-lg">
                  <h3 className="font-semibold text-blue-900 mb-4 flex items-center gap-2">
                    <Zap className="h-5 w-5" />
                    Fee de Energía
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <Label htmlFor="feeEnergia" className="text-sm font-medium">
                        Fee Base (€/kWh)
                      </Label>
                      <Input
                        id="feeEnergia"
                        type="number"
                        step="0.0001"
                        value={parametrosEdicion.feeEnergia}
                        onChange={(e) => setParametrosEdicion(prev => ({
                          ...prev,
                          feeEnergia: parseFloat(e.target.value) || 0
                        }))}
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <Label htmlFor="feeEnergiaMinimo" className="text-sm font-medium">
                        Fee Mínimo (€/mes)
                      </Label>
                      <Input
                        id="feeEnergiaMinimo"
                        type="number"
                        step="0.01"
                        value={parametrosEdicion.feeEnergiaMinimo || ''}
                        onChange={(e) => setParametrosEdicion(prev => ({
                          ...prev,
                          feeEnergiaMinimo: e.target.value ? parseFloat(e.target.value) : null
                        }))}
                        className="mt-1"
                        placeholder="Opcional"
                      />
                    </div>
                    <div>
                      <Label htmlFor="feeEnergiaMaximo" className="text-sm font-medium">
                        Fee Máximo (€/mes)
                      </Label>
                      <Input
                        id="feeEnergiaMaximo"
                        type="number"
                        step="0.01"
                        value={parametrosEdicion.feeEnergiaMaximo || ''}
                        onChange={(e) => setParametrosEdicion(prev => ({
                          ...prev,
                          feeEnergiaMaximo: e.target.value ? parseFloat(e.target.value) : null
                        }))}
                        className="mt-1"
                        placeholder="Opcional"
                      />
                    </div>
                  </div>
                </div>

                <div className="bg-green-50 p-4 rounded-lg">
                  <h3 className="font-semibold text-green-900 mb-4 flex items-center gap-2">
                    <Target className="h-5 w-5" />
                    Fee de Potencia
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <Label htmlFor="feePotencia" className="text-sm font-medium">
                        Fee Base (€/kW·día)
                      </Label>
                      <Input
                        id="feePotencia"
                        type="number"
                        step="0.0001"
                        value={parametrosEdicion.feePotencia}
                        onChange={(e) => setParametrosEdicion(prev => ({
                          ...prev,
                          feePotencia: parseFloat(e.target.value) || 0
                        }))}
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <Label htmlFor="feePotenciaMinimo" className="text-sm font-medium">
                        Fee Mínimo (€/mes)
                      </Label>
                      <Input
                        id="feePotenciaMinimo"
                        type="number"
                        step="0.01"
                        value={parametrosEdicion.feePotenciaMinimo || ''}
                        onChange={(e) => setParametrosEdicion(prev => ({
                          ...prev,
                          feePotenciaMinimo: e.target.value ? parseFloat(e.target.value) : null
                        }))}
                        className="mt-1"
                        placeholder="Opcional"
                      />
                    </div>
                    <div>
                      <Label htmlFor="feePotenciaMaximo" className="text-sm font-medium">
                        Fee Máximo (€/mes)
                      </Label>
                      <Input
                        id="feePotenciaMaximo"
                        type="number"
                        step="0.01"
                        value={parametrosEdicion.feePotenciaMaximo || ''}
                        onChange={(e) => setParametrosEdicion(prev => ({
                          ...prev,
                          feePotenciaMaximo: e.target.value ? parseFloat(e.target.value) : null
                        }))}
                        className="mt-1"
                        placeholder="Opcional"
                      />
                    </div>
                  </div>
                </div>

                <div className="bg-gray-50 p-4 rounded-lg">
                  <div className="text-sm text-gray-600">
                    <strong>Nota:</strong> Los fees se aplicarán a las tarifas que los admitan. 
                    Los límites mínimo y máximo son opcionales y se aplicarán cuando estén definidos.
                  </div>
                </div>

                <div className="flex justify-end space-x-3 pt-4 border-t">
                  <Button
                    variant="outline"
                    onClick={() => setMostrandoEdicion(false)}
                    disabled={recalculando}
                  >
                    Cancelar
                  </Button>
                  <Button
                    onClick={handleEjecutarRecalculo}
                    disabled={recalculando}
                    className="flex items-center gap-2"
                  >
                    {recalculando ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Calculator className="h-4 w-4" />
                    )}
                    {recalculando ? 'Recalculando...' : 'Recalcular'}
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
