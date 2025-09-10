
'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  Building,
  Zap,
  Search,
  Filter,
  TrendingUp,
  Loader2
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface Comercializadora {
  id: string;
  nombre: string;
  activa: boolean;
  color?: string;
  logoUrl?: string;
  ofertas: Oferta[];
}

interface Oferta {
  id: string;
  nombreOferta: string;
  tipoOferta: string;
  energiaP1: number;
  potenciaP1?: number;
  comercializadoraId: string;
  activa: boolean;
  comercializadoras: {
    nombre: string;
    activa: boolean;
  };
}

export function ListadoComercializadoras() {
  const [comercializadoras, setComercializadoras] = useState<Comercializadora[]>([]);
  const [loading, setLoading] = useState(true);
  const [busqueda, setBusqueda] = useState('');
  const [filtroTipo, setFiltroTipo] = useState('todos');
  const [actualizandoOferta, setActualizandoOferta] = useState<string | null>(null);
  const { toast } = useToast();

  const toggleOfertaActiva = async (ofertaId: string, nuevoEstado: boolean) => {
    try {
      setActualizandoOferta(ofertaId);
      console.log(`🔄 ${nuevoEstado ? 'Activando' : 'Desactivando'} oferta ${ofertaId}`);
      
      const response = await fetch('/api/ofertas', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          id: ofertaId,
          activa: nuevoEstado
        })
      });

      if (!response.ok) {
        throw new Error('Error al actualizar oferta');
      }

      // Actualizar el estado local
      setComercializadoras(prev => 
        prev.map(comercializadora => ({
          ...comercializadora,
          ofertas: comercializadora.ofertas.map(oferta =>
            oferta.id === ofertaId 
              ? { ...oferta, activa: nuevoEstado }
              : oferta
          )
        }))
      );

      toast({
        title: 'Éxito',
        description: `Oferta ${nuevoEstado ? 'activada' : 'desactivada'} correctamente`,
      });

      console.log(`✅ Oferta ${ofertaId} ${nuevoEstado ? 'activada' : 'desactivada'}`);
    } catch (error) {
      console.error('❌ Error actualizando oferta:', error);
      toast({
        title: 'Error',
        description: 'No se pudo actualizar el estado de la oferta',
        variant: 'destructive'
      });
    } finally {
      setActualizandoOferta(null);
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        console.log('🔍 Cargando comercializadoras y ofertas...');
        
        // Cargar comercializadoras (solo activas)
        const comercializadorasResponse = await fetch('/api/comercializadoras');
        if (!comercializadorasResponse.ok) {
          throw new Error('Error al cargar comercializadoras');
        }
        const comercializadorasData = await comercializadorasResponse.json();
        
        // Filtrar solo comercializadoras activas
        const comercializadorasActivas = comercializadorasData.filter((c: any) => c.activa);
        console.log(`✅ Comercializadoras activas: ${comercializadorasActivas.length}`);
        
        // Cargar TODAS las ofertas (activas e inactivas) para gestión admin
        const ofertasResponse = await fetch('/api/ofertas?admin=true');
        if (!ofertasResponse.ok) {
          throw new Error('Error al cargar ofertas');
        }
        const ofertasData = await ofertasResponse.json();
        console.log(`✅ Ofertas disponibles: ${ofertasData.length}`);
        
        // Combinar datos: agregar TODAS las ofertas de comercializadoras activas
        const comercializadorasConOfertas = comercializadorasActivas.map((comercializadora: any) => ({
          ...comercializadora,
          ofertas: ofertasData.filter((oferta: Oferta) => 
            oferta.comercializadoraId === comercializadora.id
          )
        }));
        
        console.log('✅ Datos combinados exitosamente');
        setComercializadoras(comercializadorasConOfertas);
      } catch (error) {
        console.error('❌ Error cargando datos:', error);
        toast({
          title: 'Error',
          description: 'No se pudo cargar la información de comercializadoras',
          variant: 'destructive'
        });
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [toast]);

  // Aplicar filtros
  const comercializadorasFiltradas = comercializadoras.filter(comercializadora => {
    const matchNombre = comercializadora.nombre.toLowerCase().includes(busqueda.toLowerCase());
    const tieneOfertas = comercializadora.ofertas?.length > 0;
    
    if (!matchNombre || !tieneOfertas) return false;

    if (filtroTipo === 'todos') return true;
    
    const tipoFiltroMap: { [key: string]: string } = {
      'fija': 'FIJO',
      'indexada': 'INDEXADO'
    };
    
    const tipoFiltroReal = tipoFiltroMap[filtroTipo] || filtroTipo.toUpperCase();
    
    return comercializadora.ofertas.some(oferta => 
      oferta.tipoOferta.toUpperCase() === tipoFiltroReal
    );
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-blue-600" />
          <p className="text-gray-600">Cargando comercializadoras...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Filtros */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Filter className="h-5 w-5 mr-2" />
            Filtros y Búsqueda
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Buscar comercializadora</label>
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Ej: Iberdrola, Endesa..."
                  value={busqueda}
                  onChange={(e) => setBusqueda(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Tipo de oferta</label>
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
          </div>
          
          <p className="text-sm text-gray-500 mt-4">
            Mostrando {comercializadorasFiltradas.length} de {comercializadoras.length} comercializadoras
          </p>
        </CardContent>
      </Card>

      {/* Lista de comercializadoras */}
      <div className="grid gap-6">
        {comercializadorasFiltradas.length === 0 ? (
          <Card>
            <CardContent className="text-center py-12">
              <Building className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                No se encontraron comercializadoras
              </h3>
              <p className="text-gray-600">
                No hay comercializadoras que coincidan con los filtros seleccionados
              </p>
            </CardContent>
          </Card>
        ) : (
          comercializadorasFiltradas.map((comercializadora) => {
            const tipoFiltroMap: { [key: string]: string } = {
              'fija': 'FIJO',
              'indexada': 'INDEXADO'
            };
            const tipoFiltroReal = tipoFiltroMap[filtroTipo] || filtroTipo.toUpperCase();
            
            const ofertasFiltradas = filtroTipo === 'todos' 
              ? comercializadora.ofertas 
              : comercializadora.ofertas?.filter(o => o.tipoOferta.toUpperCase() === tipoFiltroReal) || [];

            return (
              <Card key={comercializadora.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="w-12 h-12 bg-blue-600 rounded-lg flex items-center justify-center">
                        <Building className="h-6 w-6 text-white" />
                      </div>
                      <div>
                        <CardTitle className="text-xl">{comercializadora.nombre}</CardTitle>
                        <CardDescription>
                          {comercializadora.ofertas?.length || 0} ofertas disponibles
                        </CardDescription>
                      </div>
                    </div>
                    <Badge variant="outline" className="flex items-center">
                      <Zap className="h-3 w-3 mr-1" />
                      Activa
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-4">
                    {ofertasFiltradas.map((oferta) => (
                      <div 
                        key={oferta.id}
                        className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                      >
                        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <h4 className="font-medium text-gray-900">{oferta.nombreOferta}</h4>
                              <Badge variant={oferta.tipoOferta === 'FIJO' ? 'default' : 'secondary'}>
                                {oferta.tipoOferta}
                              </Badge>
                              {!oferta.activa && (
                                <Badge variant="destructive" className="text-xs">
                                  Inactiva
                                </Badge>
                              )}
                            </div>
                          </div>
                          
                          <div className="grid grid-cols-2 gap-4 lg:flex lg:items-center lg:gap-6">
                            <div className="text-center lg:text-right">
                              <div className="text-sm text-gray-500">Precio Energía</div>
                              <div className="font-semibold text-blue-600">
                                {oferta.energiaP1.toFixed(4)}€/kWh
                              </div>
                            </div>
                            
                            <div className="text-center lg:text-right">
                              <div className="text-sm text-gray-500">Término Potencia</div>
                              <div className="font-semibold text-green-600">
                                {oferta.potenciaP1 ? oferta.potenciaP1.toFixed(2) : '0.00'}€/kW·día
                              </div>
                            </div>
                            
                            <div className="text-center lg:text-right">
                              <button 
                                onClick={() => toggleOfertaActiva(oferta.id, !oferta.activa)}
                                disabled={actualizandoOferta === oferta.id}
                                className={`px-3 py-1 rounded-full text-xs font-medium transition-colors flex items-center gap-1 ${
                                  actualizandoOferta === oferta.id
                                    ? 'bg-gray-100 text-gray-500 cursor-not-allowed'
                                    : oferta.activa 
                                    ? 'bg-green-100 text-green-800 hover:bg-green-200' 
                                    : 'bg-red-100 text-red-800 hover:bg-red-200'
                                }`}
                              >
                                {actualizandoOferta === oferta.id && (
                                  <Loader2 className="h-3 w-3 animate-spin" />
                                )}
                                {actualizandoOferta === oferta.id 
                                  ? 'Actualizando...' 
                                  : oferta.activa ? 'Activa' : 'Inactiva'
                                }
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                    
                    {ofertasFiltradas.length === 0 && (
                      <div className="text-center py-6 text-gray-500">
                        <p>No hay ofertas del tipo seleccionado</p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            );
          })
        )}
      </div>
    </div>
  );
}
