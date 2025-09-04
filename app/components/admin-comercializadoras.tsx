
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { 
  Building, 
  Plus, 
  Edit, 
  Trash2, 
  Save, 
  X, 
  Zap, 
  Euro,
  Calculator,
  AlertCircle,
  CheckCircle
} from 'lucide-react';

interface Comercializadora {
  id: string;
  nombre: string;
  activa: boolean;
  createdAt: string;
  updatedAt: string;
  ofertas: Oferta[];
}

interface Oferta {
  id: string;
  comercializadoraId: string;
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
  createdAt: string;
  updatedAt: string;
  comercializadora: {
    nombre: string;
  };
}

export default function AdminComercializadoras() {
  const [comercializadoras, setComercializadoras] = useState<Comercializadora[]>([]);
  const [ofertas, setOfertas] = useState<Oferta[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [ofertaDialogOpen, setOfertaDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingOfertaId, setEditingOfertaId] = useState<string | null>(null);
  
  const { toast } = useToast();

  // Estado inicial para debugging
  console.log('AdminComercializadoras renderizando, loading:', loading);
  
  // Estado para nueva comercializadora
  const [nuevaComercializadora, setNuevaComercializadora] = useState({
    nombre: '',
    activa: true
  });
  
  // Estado para nueva/editar oferta
  const [formOferta, setFormOferta] = useState({
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
    try {
      const [comercializadorasRes, ofertasRes] = await Promise.all([
        fetch('/api/comercializadoras'),
        fetch('/api/ofertas')
      ]);
      
      const comercializadorasData = await comercializadorasRes.json();
      const ofertasData = await ofertasRes.json();
      
      setComercializadoras(comercializadorasData);
      setOfertas(ofertasData);
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
        description: "El nombre de la comercializadora es requerido",
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
        setDialogOpen(false);
        setNuevaComercializadora({ nombre: '', activa: true });
        cargarDatos();
      } else {
        throw new Error('Error al crear comercializadora');
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
      const response = await fetch(`/api/comercializadoras`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ id, activa: !activa }),
      });

      if (response.ok) {
        toast({
          title: "Éxito",
          description: `Comercializadora ${!activa ? 'activada' : 'desactivada'} correctamente`,
        });
        cargarDatos();
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudo actualizar la comercializadora",
        variant: "destructive",
      });
    }
  };

  const crearOferta = async () => {
    if (!formOferta.nombre.trim() || !formOferta.comercializadoraId) {
      toast({
        title: "Error",
        description: "Todos los campos obligatorios deben estar completados",
        variant: "destructive",
      });
      return;
    }

    try {
      const method = editingOfertaId ? 'PUT' : 'POST';
      const body = editingOfertaId 
        ? { ...formOferta, id: editingOfertaId }
        : formOferta;

      const response = await fetch('/api/ofertas', {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
      });

      if (response.ok) {
        toast({
          title: "Éxito",
          description: `Oferta ${editingOfertaId ? 'actualizada' : 'creada'} correctamente`,
        });
        setOfertaDialogOpen(false);
        resetFormOferta();
        cargarDatos();
      } else {
        throw new Error('Error al guardar oferta');
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudo guardar la oferta",
        variant: "destructive",
      });
    }
  };

  const editarOferta = (oferta: Oferta) => {
    setFormOferta({
      comercializadoraId: oferta.comercializadoraId,
      nombre: oferta.nombre,
      tarifa: oferta.tarifa,
      tipo: oferta.tipo,
      precioEnergia: oferta.precioEnergia,
      precioTermino: oferta.precioTermino,
      descripcion: oferta.descripcion || '',
      activa: oferta.activa,
      comisionTipo: oferta.comisionTipo,
      comisionMinimo: oferta.comisionMinimo,
      comisionMaximo: oferta.comisionMaximo || 0,
      comisionValor: oferta.comisionValor
    });
    setEditingOfertaId(oferta.id);
    setOfertaDialogOpen(true);
  };

  const resetFormOferta = () => {
    setFormOferta({
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
    setEditingOfertaId(null);
  };

  const eliminarOferta = async (id: string) => {
    if (!confirm('¿Estás seguro de eliminar esta oferta?')) return;

    try {
      const response = await fetch('/api/ofertas', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ id }),
      });

      if (response.ok) {
        toast({
          title: "Éxito",
          description: "Oferta eliminada correctamente",
        });
        cargarDatos();
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudo eliminar la oferta",
        variant: "destructive",
      });
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
          <p className="mt-4 text-gray-600">Cargando datos...</p>
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
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={() => setDialogOpen(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Nueva Comercializadora
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Crear Nueva Comercializadora</DialogTitle>
                <DialogDescription>
                  Añade una nueva comercializadora energética
                </DialogDescription>
              </DialogHeader>
              
              <div className="space-y-4">
                <div>
                  <Label htmlFor="nombre">Nombre de la Comercializadora *</Label>
                  <Input
                    id="nombre"
                    placeholder="Ej: Iberdrola, Endesa, EDP..."
                    value={nuevaComercializadora.nombre}
                    onChange={(e) => setNuevaComercializadora(prev => ({
                      ...prev,
                      nombre: e.target.value
                    }))}
                  />
                </div>
                
                <div className="flex items-center space-x-2">
                  <Switch
                    id="activa"
                    checked={nuevaComercializadora.activa}
                    onCheckedChange={(checked) => setNuevaComercializadora(prev => ({
                      ...prev,
                      activa: checked
                    }))}
                  />
                  <Label htmlFor="activa">Comercializadora activa</Label>
                </div>
              </div>
              
              <DialogFooter>
                <Button variant="outline" onClick={() => setDialogOpen(false)}>
                  Cancelar
                </Button>
                <Button onClick={crearComercializadora}>
                  <Save className="h-4 w-4 mr-2" />
                  Crear Comercializadora
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          <Dialog open={ofertaDialogOpen} onOpenChange={setOfertaDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" onClick={() => {
                resetFormOferta();
                setOfertaDialogOpen(true);
              }}>
                <Plus className="h-4 w-4 mr-2" />
                Nueva Oferta
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>
                  {editingOfertaId ? 'Editar Oferta' : 'Crear Nueva Oferta'}
                </DialogTitle>
                <DialogDescription>
                  {editingOfertaId ? 'Modifica los datos de la oferta' : 'Añade una nueva oferta energética'}
                </DialogDescription>
              </DialogHeader>
              
              <Tabs defaultValue="basico" className="w-full">
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="basico">Datos Básicos</TabsTrigger>
                  <TabsTrigger value="precios">Precios</TabsTrigger>
                  <TabsTrigger value="comisiones">Comisiones</TabsTrigger>
                </TabsList>
                
                <TabsContent value="basico" className="space-y-4">
                  <div>
                    <Label htmlFor="comercializadora">Comercializadora *</Label>
                    <Select 
                      value={formOferta.comercializadoraId} 
                      onValueChange={(value) => setFormOferta(prev => ({...prev, comercializadoraId: value}))}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Selecciona una comercializadora" />
                      </SelectTrigger>
                      <SelectContent>
                        {comercializadoras.filter(c => c.activa).map((comercializadora) => (
                          <SelectItem key={comercializadora.id} value={comercializadora.id}>
                            {comercializadora.nombre}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div>
                    <Label htmlFor="nombre-oferta">Nombre de la Oferta *</Label>
                    <Input
                      id="nombre-oferta"
                      placeholder="Ej: Tarifa Solar, Tempo Happy..."
                      value={formOferta.nombre}
                      onChange={(e) => setFormOferta(prev => ({...prev, nombre: e.target.value}))}
                    />
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="tarifa">Tarifa de Acceso</Label>
                      <Select 
                        value={formOferta.tarifa} 
                        onValueChange={(value) => setFormOferta(prev => ({...prev, tarifa: value}))}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="2.0TD">2.0TD - Baja tensión</SelectItem>
                          <SelectItem value="3.0TD">3.0TD - Baja tensión</SelectItem>
                          <SelectItem value="6.1TD">6.1TD - Alta tensión</SelectItem>
                          <SelectItem value="6.2TD">6.2TD - Alta tensión</SelectItem>
                          <SelectItem value="6.3TD">6.3TD - Alta tensión</SelectItem>
                          <SelectItem value="6.4TD">6.4TD - Alta tensión</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div>
                      <Label htmlFor="tipo">Tipo de Tarifa</Label>
                      <Select 
                        value={formOferta.tipo} 
                        onValueChange={(value) => setFormOferta(prev => ({...prev, tipo: value}))}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Fija">Fija</SelectItem>
                          <SelectItem value="Indexada">Indexada</SelectItem>
                          <SelectItem value="Híbrida">Híbrida</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  
                  <div>
                    <Label htmlFor="descripcion">Descripción</Label>
                    <Textarea
                      id="descripcion"
                      placeholder="Descripción adicional de la oferta..."
                      value={formOferta.descripcion}
                      onChange={(e) => setFormOferta(prev => ({...prev, descripcion: e.target.value}))}
                    />
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="activa-oferta"
                      checked={formOferta.activa}
                      onCheckedChange={(checked) => setFormOferta(prev => ({...prev, activa: checked}))}
                    />
                    <Label htmlFor="activa-oferta">Oferta activa</Label>
                  </div>
                </TabsContent>
                
                <TabsContent value="precios" className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="precio-energia">Precio Energía (€/kWh) *</Label>
                      <Input
                        id="precio-energia"
                        type="number"
                        step="0.001"
                        placeholder="0.120"
                        value={formOferta.precioEnergia}
                        onChange={(e) => setFormOferta(prev => ({...prev, precioEnergia: parseFloat(e.target.value) || 0}))}
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor="precio-termino">Término Potencia (€/kW mes) *</Label>
                      <Input
                        id="precio-termino"
                        type="number"
                        step="0.01"
                        placeholder="3.45"
                        value={formOferta.precioTermino}
                        onChange={(e) => setFormOferta(prev => ({...prev, precioTermino: parseFloat(e.target.value) || 0}))}
                      />
                    </div>
                  </div>
                  
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <h4 className="font-medium text-blue-900 mb-2 flex items-center">
                      <Calculator className="h-4 w-4 mr-2" />
                      Ejemplo de Cálculo
                    </h4>
                    <div className="text-sm text-blue-700 space-y-1">
                      <p><strong>Consumo:</strong> 1000 kWh × {formOferta.precioEnergia.toFixed(3)} €/kWh = {(1000 * formOferta.precioEnergia).toFixed(2)} €</p>
                      <p><strong>Potencia:</strong> 5 kW × {formOferta.precioTermino.toFixed(2)} €/kW = {(5 * formOferta.precioTermino).toFixed(2)} € / mes</p>
                    </div>
                  </div>
                </TabsContent>
                
                <TabsContent value="comisiones" className="space-y-4">
                  <div>
                    <Label htmlFor="comision-tipo">Tipo de Comisión</Label>
                    <Select 
                      value={formOferta.comisionTipo} 
                      onValueChange={(value) => setFormOferta(prev => ({...prev, comisionTipo: value}))}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="E">Por Energía (E) - €/MWh</SelectItem>
                        <SelectItem value="P">Por Potencia (P) - €/kW</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <Label htmlFor="comision-minimo">Mínimo para Comisión</Label>
                      <Input
                        id="comision-minimo"
                        type="number"
                        step="0.01"
                        value={formOferta.comisionMinimo}
                        onChange={(e) => setFormOferta(prev => ({...prev, comisionMinimo: parseFloat(e.target.value) || 0}))}
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor="comision-maximo">Máximo (Opcional)</Label>
                      <Input
                        id="comision-maximo"
                        type="number"
                        step="0.01"
                        value={formOferta.comisionMaximo}
                        onChange={(e) => setFormOferta(prev => ({...prev, comisionMaximo: parseFloat(e.target.value) || 0}))}
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor="comision-valor">Valor Comisión *</Label>
                      <Input
                        id="comision-valor"
                        type="number"
                        step="0.01"
                        value={formOferta.comisionValor}
                        onChange={(e) => setFormOferta(prev => ({...prev, comisionValor: parseFloat(e.target.value) || 0}))}
                      />
                    </div>
                  </div>
                  
                  <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                    <h4 className="font-medium text-green-900 mb-2 flex items-center">
                      <Euro className="h-4 w-4 mr-2" />
                      Configuración Actual
                    </h4>
                    <div className="text-sm text-green-700">
                      <p>
                        <strong>Tipo:</strong> {formOferta.comisionTipo === 'E' ? 'Energía' : 'Potencia'} - 
                        <strong> Valor:</strong> {formOferta.comisionValor} {formOferta.comisionTipo === 'E' ? '€/MWh' : '€/kW'}
                      </p>
                      <p><strong>Rango:</strong> {formOferta.comisionMinimo} - {formOferta.comisionMaximo || '∞'}</p>
                    </div>
                  </div>
                </TabsContent>
              </Tabs>
              
              <DialogFooter>
                <Button variant="outline" onClick={() => setOfertaDialogOpen(false)}>
                  Cancelar
                </Button>
                <Button onClick={crearOferta}>
                  <Save className="h-4 w-4 mr-2" />
                  {editingOfertaId ? 'Actualizar' : 'Crear'} Oferta
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
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
              <p className="text-2xl font-bold">{ofertas.length}</p>
              <p className="text-gray-600">Ofertas Totales</p>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="flex items-center p-6">
            <CheckCircle className="h-8 w-8 text-green-500 mr-4" />
            <div>
              <p className="text-2xl font-bold">{ofertas.filter(o => o.activa).length}</p>
              <p className="text-gray-600">Ofertas Activas</p>
            </div>
          </CardContent>
        </Card>
      </div>

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
                            onClick={() => editarOferta(oferta)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => eliminarOferta(oferta.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-6 text-center text-gray-500">
                  <AlertCircle className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                  <p>No hay ofertas para esta comercializadora</p>
                  <Button
                    variant="outline"
                    className="mt-4"
                    onClick={() => {
                      setFormOferta(prev => ({...prev, comercializadoraId: comercializadora.id}));
                      setOfertaDialogOpen(true);
                    }}
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Añadir Primera Oferta
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
