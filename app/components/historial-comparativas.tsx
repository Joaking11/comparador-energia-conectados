
'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { 
  Search,
  Calendar,
  User,
  TrendingUp,
  Euro,
  Eye,
  Trash2,
  Loader2,
  FileText,
  Building
} from 'lucide-react';
import Link from 'next/link';
import { useToast } from '@/hooks/use-toast';

interface ComparativaHistorial {
  id: string;
  titulo?: string;
  consumoAnualElectricidad: number;
  potenciaP1: number;
  totalFacturaElectricidad: number;
  createdAt: string;
  clientes: {
    razonSocial: string;
    cif?: string;
  };
  comparativa_ofertas: Array<{
    ahorroAnual: number;
    comisionGanada: number;
  }>;
}

export function HistorialComparativas() {
  const [comparativas, setComparativas] = useState<ComparativaHistorial[]>([]);
  const [loading, setLoading] = useState(true);
  const [busqueda, setBusqueda] = useState('');
  const { toast } = useToast();

  useEffect(() => {
    const fetchComparativas = async () => {
      try {
        console.log('📡 Iniciando fetch de comparativas...');
        
        // Agregar timeout para evitar colgadas
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 segundos
        
        const response = await fetch('/api/comparativas', {
          signal: controller.signal,
          headers: {
            'Content-Type': 'application/json',
          }
        });
        
        clearTimeout(timeoutId);
        console.log('📡 Response status:', response.status, response.statusText);
        
        if (response.ok) {
          const data = await response.json();
          console.log('📡 Datos recibidos:', data?.length || 0, 'comparativas');
          
          // Validar que data sea un array
          if (Array.isArray(data)) {
            setComparativas(data);
          } else {
            console.warn('⚠️ Los datos recibidos no son un array:', data);
            setComparativas([]);
          }
        } else {
          const errorText = await response.text();
          console.error('❌ Error en respuesta:', response.status, errorText);
          throw new Error(`Error ${response.status}: ${errorText || 'Error del servidor'}`);
        }
      } catch (error) {
        console.error('❌ Error completo:', error);
        
        // Manejo específico de diferentes tipos de error
        let errorMessage = 'Error desconocido';
        if (error instanceof Error) {
          if (error.name === 'AbortError') {
            errorMessage = 'La petición tardó demasiado tiempo';
          } else {
            errorMessage = error.message;
          }
        }
        
        toast({
          title: 'Error al cargar historial',
          description: errorMessage,
          variant: 'destructive'
        });
        
        // En caso de error, mostrar array vacío en lugar de fallo total
        setComparativas([]);
      } finally {
        setLoading(false);
      }
    };

    // Retraso pequeño para evitar race conditions en hydration
    const timeoutId = setTimeout(fetchComparativas, 100);
    
    return () => clearTimeout(timeoutId);
  }, [toast]);

  const handleDelete = async (id: string, titulo: string) => {
    if (!confirm(`¿Estás seguro de eliminar la comparativa "${titulo}"?`)) {
      return;
    }

    try {
      const response = await fetch(`/api/comparativas/${id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        setComparativas(prev => prev.filter(c => c.id !== id));
        toast({
          title: 'Comparativa eliminada',
          description: 'La comparativa ha sido eliminada exitosamente',
        });
      } else {
        throw new Error('Error al eliminar');
      }
    } catch (error) {
      console.error('Error:', error);
      toast({
        title: 'Error',
        description: 'No se pudo eliminar la comparativa',
        variant: 'destructive'
      });
    }
  };

  // Filtrar comparativas por búsqueda
  const comparativasFiltradas = comparativas.filter(comp => {
    const searchTerm = busqueda.toLowerCase();
    return (
      comp.clientes.razonSocial?.toLowerCase().includes(searchTerm) ||
      comp.titulo?.toLowerCase().includes(searchTerm) ||
      comp.clientes.cif?.toLowerCase().includes(searchTerm)
    );
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-blue-600" />
          <p className="text-gray-600">Cargando historial...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Barra de búsqueda */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Search className="h-5 w-5 mr-2" />
            Buscar Comparativas
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Buscar por nombre del cliente, título o CIF..."
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
              className="pl-10"
            />
          </div>
          <p className="text-sm text-gray-500 mt-2">
            Mostrando {comparativasFiltradas.length} de {comparativas.length} comparativas
          </p>
        </CardContent>
      </Card>

      {/* Lista de comparativas */}
      {comparativasFiltradas.length === 0 ? (
        <Card>
          <CardContent className="text-center py-12">
            <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              {comparativas.length === 0 ? 'No hay comparativas' : 'No se encontraron resultados'}
            </h3>
            <p className="text-gray-600 mb-4">
              {comparativas.length === 0 
                ? 'Aún no has creado ninguna comparativa energética' 
                : 'No hay comparativas que coincidan con tu búsqueda'}
            </p>
            {comparativas.length === 0 && (
              <Link href="/nueva-comparativa">
                <Button className="bg-blue-600 hover:bg-blue-700">
                  Crear Primera Comparativa
                </Button>
              </Link>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {comparativasFiltradas.map((comparativa) => {
            const mejorAhorro = Math.max(...comparativa.comparativa_ofertas.map(o => o.ahorroAnual), 0);
            const mejorComision = Math.max(...comparativa.comparativa_ofertas.map(o => o.comisionGanada), 0);
            const fecha = new Date(comparativa.createdAt).toLocaleDateString('es-ES', {
              year: 'numeric',
              month: 'short',
              day: 'numeric'
            });

            return (
              <Card key={comparativa.id} className="hover:shadow-lg transition-shadow">
                <CardContent className="p-6">
                  <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                    {/* Información principal */}
                    <div className="flex-1 space-y-2">
                      <div className="flex items-start justify-between">
                        <div>
                          <h3 className="text-lg font-semibold text-gray-900">
                            {comparativa.titulo || `Comparativa ${comparativa.clientes.razonSocial}`}
                          </h3>
                          <div className="flex items-center text-gray-600 text-sm mt-1">
                            <User className="h-4 w-4 mr-1" />
                            {comparativa.clientes.razonSocial}
                            {comparativa.clientes.cif && (
                              <>
                                <span className="mx-2">•</span>
                                <Building className="h-4 w-4 mr-1" />
                                {comparativa.clientes.cif}
                              </>
                            )}
                          </div>
                        </div>
                        <Badge variant="outline" className="flex items-center">
                          <Calendar className="h-3 w-3 mr-1" />
                          {fecha}
                        </Badge>
                      </div>

                      {/* Datos técnicos */}
                      <div className="flex flex-wrap gap-4 text-sm text-gray-600">
                        <span>
                          <strong>Consumo:</strong> {comparativa.consumoAnualElectricidad.toLocaleString()} kWh
                        </span>
                        <span>
                          <strong>Potencia:</strong> {comparativa.potenciaP1} kW
                        </span>
                        <span>
                          <strong>Factura actual:</strong> {comparativa.totalFacturaElectricidad.toFixed(0)}€
                        </span>
                        <span>
                          <strong>Ofertas analizadas:</strong> {comparativa.comparativa_ofertas.length}
                        </span>
                      </div>
                    </div>

                    {/* Resultados clave */}
                    <div className="grid grid-cols-2 gap-4 lg:flex lg:items-center lg:gap-6">
                      <div className="text-center">
                        <div className="text-sm text-gray-500 mb-1">Mejor Ahorro</div>
                        <div className={`text-lg font-semibold ${
                          mejorAhorro > 0 ? 'text-green-600' : 'text-gray-400'
                        }`}>
                          <TrendingUp className="h-4 w-4 inline mr-1" />
                          {mejorAhorro.toFixed(0)}€
                        </div>
                      </div>
                      
                      <div className="text-center">
                        <div className="text-sm text-gray-500 mb-1">Mejor Comisión</div>
                        <div className={`text-lg font-semibold ${
                          mejorComision > 0 ? 'text-blue-600' : 'text-gray-400'
                        }`}>
                          <Euro className="h-4 w-4 inline mr-1" />
                          {mejorComision.toFixed(0)}€
                        </div>
                      </div>
                    </div>

                    {/* Acciones */}
                    <div className="flex gap-2">
                      <Link href={`/comparativa/${comparativa.id}`}>
                        <Button size="sm" className="bg-blue-600 hover:bg-blue-700">
                          <Eye className="h-4 w-4 mr-2" />
                          Ver Detalles
                        </Button>
                      </Link>
                      
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleDelete(
                          comparativa.id, 
                          comparativa.titulo || comparativa.clientes.razonSocial
                        )}
                        className="text-red-600 hover:text-red-700 hover:bg-red-50"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* Acciones rápidas */}
      <div className="flex justify-center pt-6">
        <Link href="/nueva-comparativa">
          <Button size="lg" className="bg-blue-600 hover:bg-blue-700">
            <FileText className="h-4 w-4 mr-2" />
            Nueva Comparativa
          </Button>
        </Link>
      </div>
    </div>
  );
}
