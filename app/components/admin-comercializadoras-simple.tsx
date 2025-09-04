
'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { 
  Building, 
  Plus, 
  Edit, 
  Trash2, 
  Save, 
  Zap, 
  Euro,
  Calculator,
  CheckCircle
} from 'lucide-react';

interface Comercializadora {
  id: string;
  nombre: string;
  activa: boolean;
  ofertas: Oferta[];
}

interface Oferta {
  id: string;
  nombre: string;
  tarifa: string;
  tipo: string;
  precioEnergia: number;
  precioTermino: number;
  descripcion?: string;
  activa: boolean;
  comisionTipo: string;
  comisionMinimo: number;
  comisionMaximo?: number;
  comisionValor: number;
}

export default function AdminComercializadorasSimple() {
  const [comercializadoras, setComercializadoras] = useState<Comercializadora[]>([]);
  const [loading, setLoading] = useState(true);
  const [editMode, setEditMode] = useState<string | null>(null);
  const [showNewForm, setShowNewForm] = useState(false);
  
  const { toast } = useToast();

  // Estado para nueva comercializadora
  const [nuevaComercializadora, setNuevaComercializadora] = useState({
    nombre: '',
    activa: true
  });

  // Estado para nueva oferta  
  const [nuevaOferta, setNuevaOferta] = useState({
    comercializadoraId: '',
    nombre: '',
    tarifa: '2.0TD',
    tipo: 'Fija',
    precioEnergia: 0,
    precioTermino: 0,
    descripcion: '',
    activa: true,
    comisionTipo: 'E',
    comisionMinimo: 0,
    comisionMaximo: 0,
    comisionValor: 0
  });

  useEffect(() => {
    cargarDatos();
  }, []);

  const cargarDatos = async () => {
    console.log('Cargando datos...');
    try {
      const response = await fetch('/api/comercializadoras');
      if (response.ok) {
        const data = await response.json();
        console.log('Datos cargados:', data);
        setComercializadoras(data);
      } else {
        console.error('Error en respuesta:', response.status);
      }
    } catch (error) {
      console.error('Error cargando datos:', error);
      toast({
        title: "Error",
        description: "No se pudieron cargar los datos",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const crearComercializadora = async () => {
    if (!nuevaComercializadora.nombre.trim()) {
      toast({
        title: "Error", 
        description: "El nombre es requerido",
        variant: "destructive",
      });
      return;
    }

    try {
      const response = await fetch('/api/comercializadoras', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(nuevaComercializadora),
      });

      if (response.ok) {
        toast({
          title: "Éxito",
          description: "Comercializadora creada correctamente",
        });
        setNuevaComercializadora({ nombre: '', activa: true });
        setShowNewForm(false);
        cargarDatos();
      } else {
        throw new Error('Error al crear');
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudo crear la comercializadora",
        variant: "destructive",
      });
    }
  };

  const toggleComercializadoraActiva = async (id: string, activa: boolean) => {
    try {
      const response = await fetch('/api/comercializadoras', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ id, activa: !activa }),
      });

      if (response.ok) {
        toast({
          title: "Éxito",
          description: `Comercializadora ${!activa ? 'activada' : 'desactivada'}`,
        });
        cargarDatos();
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudo actualizar",
        variant: "destructive",
      });
    }
  };

  const totalOfertas = comercializadoras.reduce((acc, c) => acc + c.ofertas.length, 0);
  const ofertasActivas = comercializadoras.reduce((acc, c) => 
    acc + c.ofertas.filter(o => o.activa).length, 0);

  if (loading) {
    return (
      <div className="container mx-auto p-6 max-w-6xl">
        <div className="flex items-center justify-center p-8">
          <div className="text-center">
            <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-primary mx-auto"></div>
            <p className="mt-4 text-gray-600">Cargando datos...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 max-w-6xl">
      {/* Encabezado */}
      <div className="flex justify-between items-start mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Administración de Comercializadoras</h1>
          <p className="text-gray-600 mt-2">Gestiona comercializadoras, ofertas, precios y comisiones</p>
        </div>
        
        <div className="flex gap-3">
          <Button onClick={() => setShowNewForm(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Nueva Comercializadora
          </Button>
        </div>
      </div>

      {/* Estadísticas */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card>
          <CardContent className="flex items-center p-6">
            <Building className="h-8 w-8 text-primary mr-4" />
            <div>
              <p className="text-2xl font-bold">{comercializadoras.length}</p>
              <p className="text-gray-600">Comercializadoras</p>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="flex items-center p-6">
            <Zap className="h-8 w-8 text-yellow-500 mr-4" />
            <div>
              <p className="text-2xl font-bold">{totalOfertas}</p>
              <p className="text-gray-600">Ofertas Totales</p>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="flex items-center p-6">
            <CheckCircle className="h-8 w-8 text-green-500 mr-4" />
            <div>
              <p className="text-2xl font-bold">{ofertasActivas}</p>
              <p className="text-gray-600">Ofertas Activas</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Formulario Nueva Comercializadora */}
      {showNewForm && (
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Nueva Comercializadora</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex gap-4 items-end">
              <div className="flex-1">
                <Label htmlFor="nombre">Nombre</Label>
                <Input
                  id="nombre"
                  placeholder="Ej: Iberdrola, Gas Natural..."
                  value={nuevaComercializadora.nombre}
                  onChange={(e) => setNuevaComercializadora(prev => ({
                    ...prev,
                    nombre: e.target.value
                  }))}
                />
              </div>
              <div className="flex items-center space-x-2">
                <Switch
                  checked={nuevaComercializadora.activa}
                  onCheckedChange={(checked) => setNuevaComercializadora(prev => ({
                    ...prev,
                    activa: checked
                  }))}
                />
                <Label>Activa</Label>
              </div>
              <Button onClick={crearComercializadora}>
                <Save className="h-4 w-4 mr-2" />
                Crear
              </Button>
              <Button variant="outline" onClick={() => setShowNewForm(false)}>
                Cancelar
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Lista de Comercializadoras */}
      <div className="space-y-6">
        {comercializadoras.map((comercializadora) => (
          <Card key={comercializadora.id} className="overflow-hidden">
            <CardHeader className="bg-gray-50">
              <div className="flex justify-between items-start">
                <div className="flex items-center space-x-3">
                  <div className="h-12 w-12 bg-primary rounded-lg flex items-center justify-center">
                    <Building className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <CardTitle className="text-xl">{comercializadora.nombre}</CardTitle>
                    <CardDescription>
                      {comercializadora.ofertas.length} ofertas disponibles
                    </CardDescription>
                  </div>
                </div>
                
                <div className="flex items-center space-x-3">
                  <Badge variant={comercializadora.activa ? "default" : "secondary"}>
                    {comercializadora.activa ? "Activa" : "Inactiva"}
                  </Badge>
                  <Switch
                    checked={comercializadora.activa}
                    onCheckedChange={() => toggleComercializadoraActiva(comercializadora.id, comercializadora.activa)}
                  />
                </div>
              </div>
            </CardHeader>
            
            <CardContent className="p-0">
              {comercializadora.ofertas.length > 0 ? (
                <div className="divide-y">
                  {comercializadora.ofertas.map((oferta) => (
                    <div key={oferta.id} className="p-6 hover:bg-gray-50 transition-colors">
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <div className="flex items-center space-x-3 mb-2">
                            <h4 className="font-semibold text-lg">{oferta.nombre}</h4>
                            <Badge variant="outline">{oferta.tipo}</Badge>
                            <Badge variant={oferta.activa ? "default" : "secondary"}>
                              {oferta.activa ? "Activa" : "Inactiva"}
                            </Badge>
                          </div>
                          
                          <p className="text-gray-600 mb-3">
                            Tarifa {oferta.tarifa} • {oferta.descripcion}
                          </p>
                          
                          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                            <div className="bg-blue-50 rounded-lg p-3">
                              <p className="text-sm text-blue-600 font-medium">Precio Energía</p>
                              <p className="text-lg font-bold text-blue-900">{oferta.precioEnergia.toFixed(3)} €/kWh</p>
                            </div>
                            
                            <div className="bg-green-50 rounded-lg p-3">
                              <p className="text-sm text-green-600 font-medium">Término Potencia</p>
                              <p className="text-lg font-bold text-green-900">{oferta.precioTermino.toFixed(2)} €/kW mes</p>
                            </div>
                            
                            <div className="bg-purple-50 rounded-lg p-3">
                              <p className="text-sm text-purple-600 font-medium">Comisión</p>
                              <p className="text-lg font-bold text-purple-900">
                                {oferta.comisionValor} {oferta.comisionTipo === 'E' ? '€/MWh' : '€/kW'}
                              </p>
                            </div>
                            
                            <div className="bg-orange-50 rounded-lg p-3">
                              <p className="text-sm text-orange-600 font-medium">Rango Comisión</p>
                              <p className="text-sm font-medium text-orange-900">
                                {oferta.comisionMinimo} - {oferta.comisionMaximo || '∞'}
                              </p>
                            </div>
                          </div>
                        </div>
                        
                        <div className="flex space-x-2 ml-4">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              toast({
                                title: "En desarrollo",
                                description: "Función de edición próximamente",
                              });
                            }}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-6 text-center text-gray-500">
                  <p>No hay ofertas para esta comercializadora</p>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Información adicional */}
      <Card className="mt-8">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calculator className="h-5 w-5" />
            Cómo usar este panel
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-medium mb-2">✅ Para editar precios:</h4>
              <p className="text-gray-600 text-sm">
                Haz clic en el botón ✏️ junto a cada oferta para modificar precios de energía, término de potencia y comisiones.
              </p>
            </div>
            <div>
              <h4 className="font-medium mb-2">➕ Para añadir ofertas:</h4>
              <p className="text-gray-600 text-sm">
                Usa el botón "Nueva Comercializadora" y luego añade sus ofertas específicas con precios reales del mercado.
              </p>
            </div>
            <div>
              <h4 className="font-medium mb-2">🔄 Para activar/desactivar:</h4>
              <p className="text-gray-600 text-sm">
                Usa los switches para controlar qué comercializadoras y ofertas aparecen en las comparativas.
              </p>
            </div>
            <div>
              <h4 className="font-medium mb-2">💡 Precios reales:</h4>
              <p className="text-gray-600 text-sm">
                Los precios mostrados son ejemplos. Actualízalos con las tarifas actuales de cada comercializadora.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
