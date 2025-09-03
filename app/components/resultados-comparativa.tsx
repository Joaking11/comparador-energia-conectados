
'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
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
  Loader2
} from 'lucide-react';
import { TablaResultados } from '@/components/tabla-resultados';
import { GraficaMatriz } from '@/components/grafica-matriz';
import { useToast } from '@/hooks/use-toast';

interface ComparativaData {
  id: string;
  titulo?: string;
  consumoAnual: number;
  potenciaContratada: number;
  tarifaActual: string;
  importeActual: number;
  cliente: {
    nombre: string;
    cif?: string;
    direccion?: string;
  };
  ofertas: Array<{
    id: string;
    importeCalculado: number;
    ahorroAnual: number;
    comisionGanada: number;
    oferta: {
      id: string;
      nombre: string;
      tipo: string;
      precioEnergia: number;
      precioTermino: number;
      comercializadora: {
        nombre: string;
      };
    };
  }>;
  createdAt: string;
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
  const { toast } = useToast();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch(`/api/comparativas/${comparativaId}`);
        if (response.ok) {
          const comparativa = await response.json();
          setData(comparativa);
        } else {
          throw new Error('Error al cargar la comparativa');
        }
      } catch (error) {
        console.error('Error:', error);
        toast({
          title: 'Error',
          description: 'No se pudo cargar la comparativa',
          variant: 'destructive'
        });
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [comparativaId, toast]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-blue-600" />
          <p className="text-gray-600">Cargando resultados...</p>
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="text-center py-12">
        <p className="text-red-600">No se pudo cargar la comparativa</p>
      </div>
    );
  }

  // Calcular estadísticas
  const ofertas = data.ofertas || [];
  const mejorOferta = ofertas.length > 0 ? ofertas[0] : null;
  const ahorroTotal = ofertas.reduce((sum, o) => sum + o.ahorroAnual, 0);
  const comisionTotal = ofertas.reduce((sum, o) => sum + o.comisionGanada, 0);
  const comercializadoras = [...new Set(ofertas.map(o => o.oferta.comercializadora.nombre))];
  
  // Aplicar filtros
  const ofertasFiltradas = ofertas.filter(oferta => {
    const matchComercializadora = filtroComercializadora === 'todas' || 
      oferta.oferta.comercializadora.nombre === filtroComercializadora;
    const matchTipo = filtroTipo === 'todos' || 
      oferta.oferta.tipo.toLowerCase() === filtroTipo.toLowerCase();
    const matchBusqueda = busqueda === '' ||
      oferta.oferta.nombre.toLowerCase().includes(busqueda.toLowerCase()) ||
      oferta.oferta.comercializadora.nombre.toLowerCase().includes(busqueda.toLowerCase());
    
    return matchComercializadora && matchTipo && matchBusqueda;
  });

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: `Comparativa: ${data.titulo || data.cliente.nombre}`,
          text: `Resultados de comparativa energética - Ahorro potencial: ${mejorOferta?.ahorroAnual.toFixed(0)}€`,
          url: window.location.href,
        });
      } catch (error) {
        console.error('Error sharing:', error);
      }
    } else {
      // Fallback para navegadores que no soportan Web Share API
      navigator.clipboard.writeText(window.location.href);
      toast({
        title: 'Enlace copiado',
        description: 'El enlace de la comparativa se ha copiado al portapapeles',
      });
    }
  };

  const handleExportPDF = () => {
    // Funcionalidad de exportar PDF usando window.print()
    window.print();
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            {data.titulo || `Comparativa ${data.cliente.nombre}`}
          </h1>
          <p className="text-gray-600 mt-2">
            {ofertas.length} ofertas analizadas • 
            Consumo: {data.consumoAnual.toLocaleString()} kWh • 
            Potencia: {data.potenciaContratada} kW
          </p>
        </div>
        
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleShare}>
            <Share2 className="h-4 w-4 mr-2" />
            Compartir
          </Button>
          <Button variant="outline" onClick={handleExportPDF}>
            <Download className="h-4 w-4 mr-2" />
            Exportar PDF
          </Button>
        </div>
      </div>

      {/* Resumen Ejecutivo */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              Mejor Ahorro
            </CardTitle>
            <TrendingUp className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {mejorOferta ? `${mejorOferta.ahorroAnual.toFixed(0)}€` : '0€'}
            </div>
            <p className="text-xs text-gray-500">
              {mejorOferta ? mejorOferta.oferta.comercializadora.nombre : 'N/A'}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              Mejor Comisión
            </CardTitle>
            <Euro className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              {ofertas.length > 0 ? `${Math.max(...ofertas.map(o => o.comisionGanada)).toFixed(0)}€` : '0€'}
            </div>
            <p className="text-xs text-gray-500">Comisión máxima</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              Ofertas Válidas
            </CardTitle>
            <Target className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">
              {ofertas.filter(o => o.ahorroAnual > 0 || o.comisionGanada > 0).length}
            </div>
            <p className="text-xs text-gray-500">de {ofertas.length} analizadas</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              Factura Actual
            </CardTitle>
            <Calculator className="h-4 w-4 text-gray-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900">
              {data.importeActual.toFixed(0)}€
            </div>
            <p className="text-xs text-gray-500">Anual actual</p>
          </CardContent>
        </Card>
      </div>

      {/* Controles de Filtrado */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Filter className="h-5 w-5 mr-2" />
            Filtros y Búsqueda
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Comercializadora</label>
              <Select value={filtroComercializadora} onValueChange={setFiltroComercializadora}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todas">Todas las comercializadoras</SelectItem>
                  {comercializadoras.map(com => (
                    <SelectItem key={com} value={com}>{com}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Tipo de Oferta</label>
              <Select value={filtroTipo} onValueChange={setFiltroTipo}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todos">Todos los tipos</SelectItem>
                  <SelectItem value="fija">Tarifa Fija</SelectItem>
                  <SelectItem value="indexada">Tarifa Indexada</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2 md:col-span-2">
              <label className="text-sm font-medium">Buscar</label>
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Buscar por nombre de oferta o comercializadora..."
                  value={busqueda}
                  onChange={(e) => setBusqueda(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
          </div>
          
          <div className="mt-4 flex justify-between items-center">
            <p className="text-sm text-gray-600">
              Mostrando {ofertasFiltradas.length} de {ofertas.length} ofertas
            </p>
            {(filtroComercializadora !== 'todas' || filtroTipo !== 'todos' || busqueda) && (
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => {
                  setFiltroComercializadora('todas');
                  setFiltroTipo('todos');
                  setBusqueda('');
                }}
              >
                Limpiar filtros
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Gráfica Matriz */}
      <Card>
        <CardHeader>
          <CardTitle>Matriz Ahorro vs Comisión</CardTitle>
          <CardDescription>
            Visualiza la relación entre el ahorro para el cliente y la comisión para el consultor
          </CardDescription>
        </CardHeader>
        <CardContent>
          <GraficaMatriz ofertas={ofertasFiltradas} />
        </CardContent>
      </Card>

      {/* Tabla de Resultados */}
      <Card>
        <CardHeader>
          <CardTitle>Detalle de Ofertas</CardTitle>
          <CardDescription>
            Comparación detallada de todas las ofertas analizadas
          </CardDescription>
        </CardHeader>
        <CardContent>
          <TablaResultados ofertas={ofertasFiltradas} importeActual={data.importeActual} />
        </CardContent>
      </Card>
    </div>
  );
}
