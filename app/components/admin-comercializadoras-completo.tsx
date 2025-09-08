
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
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
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
  CheckCircle,
  Upload,
  Download,
  FileSpreadsheet,
  X
} from 'lucide-react';

interface Comercializadora {
  id: string;
  nombre: string;
  activa: boolean;
  tarifas: Tarifa[];
}

interface Tarifa {
  id: string;
  comercializadoraId: string;
  nombreOferta: string;
  tarifa: string;
  tipoOferta: string;
  energiaP1: number;
  potenciaP1?: number | null;
  zona: string;
  rango: string;
  rangoDesde: number;
  rangoHasta?: number | null;
  activa: boolean;
}

export default function AdminComercializadorasCompleto() {
  const [comercializadoras, setComercializadoras] = useState<Comercializadora[]>([]);
  const [loading, setLoading] = useState(true);
  const [showNewForm, setShowNewForm] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [importDialogOpen, setImportDialogOpen] = useState(false);
  const [editingTarifa, setEditingTarifa] = useState<Tarifa | null>(null);
  
  const { toast } = useToast();

  // Estado para nueva comercializadora
  const [nuevaComercializadora, setNuevaComercializadora] = useState({
    nombre: '',
    activa: true
  });

  // Estado para editar tarifa
  const [formOferta, setFormOferta] = useState({
    id: '',
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
      const response = await fetch('/api/comercializadoras');
      if (response.ok) {
        const data = await response.json();
        setComercializadoras(data);
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

  const editarTarifa = (tarifa: Tarifa) => {
    setEditingTarifa(tarifa);
    setFormOferta({
      id: tarifa.id,
      comercializadoraId: tarifa.comercializadoraId,
      nombre: tarifa.nombreOferta,
      tarifa: tarifa.tarifa,
      tipo: tarifa.tipoOferta,
      precioEnergia: tarifa.energiaP1,
      precioTermino: tarifa.potenciaP1 || 0,
      descripcion: tarifa.zona,
      activa: tarifa.activa,
      comisionTipo: tarifa.rango,
      comisionMinimo: tarifa.rangoDesde,
      comisionMaximo: tarifa.rangoHasta || 0,
      comisionValor: 0
    });
    setEditDialogOpen(true);
  };

  const guardarOferta = async () => {
    if (!formOferta.nombre.trim()) {
      toast({
        title: "Error",
        description: "El nombre es requerido",
        variant: "destructive",
      });
      return;
    }

    try {
      const response = await fetch('/api/ofertas', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formOferta),
      });

      if (response.ok) {
        toast({
          title: "Éxito",
          description: "Oferta actualizada correctamente",
        });
        setEditDialogOpen(false);
        setEditingTarifa(null);
        cargarDatos();
      } else {
        throw new Error('Error al actualizar');
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudo actualizar la tarifa",
        variant: "destructive",
      });
    }
  };

  const eliminarTarifa = async (id: string) => {
    if (!confirm('¿Estás seguro de eliminar esta tarifa?')) return;

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
      } else {
        throw new Error('Error al eliminar');
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudo eliminar la oferta",
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

  const exportarExcel = async () => {
    try {
      // Preparar datos para exportar
      const datos: any[] = [];
      comercializadoras.forEach(comercializadora => {
        comercializadora.tarifas?.forEach(tarifa => {
          datos.push({
            'Comercializadora': comercializadora.nombre,
            'Oferta': tarifa.nombreOferta,
            'Tarifa': tarifa.tarifa,
            'Tipo': tarifa.tipoOferta,
            'Precio Energía P1 (€/kWh)': tarifa.energiaP1,
            'Precio Potencia P1 (€/kW mes)': tarifa.potenciaP1 || 0,
            'Zona': tarifa.zona,
            'Rango': tarifa.rango,
            'Rango Desde': tarifa.rangoDesde,
            'Rango Hasta': tarifa.rangoHasta || '',
            'Activa': tarifa.activa ? 'Sí' : 'No'
          });
        });
      });

      // Usar la biblioteca XLSX para crear un Excel real
      const XLSX = await import('xlsx');
      const wb = XLSX.utils.book_new();
      const ws = XLSX.utils.json_to_sheet(datos);
      
      // Configurar anchos de columna
      const wscols = [
        { wch: 20 }, // Comercializadora
        { wch: 25 }, // Oferta
        { wch: 10 }, // Tarifa
        { wch: 12 }, // Tipo
        { wch: 18 }, // Precio Energía
        { wch: 22 }, // Término Potencia
        { wch: 40 }, // Descripción
        { wch: 15 }, // Comisión Tipo
        { wch: 15 }, // Comisión Valor
        { wch: 17 }, // Comisión Mínimo
        { wch: 17 }  // Comisión Máximo
      ];
      ws['!cols'] = wscols;
      
      XLSX.utils.book_append_sheet(wb, ws, "Comercializadoras");
      
      // Exportar
      XLSX.writeFile(wb, `comercializadoras_${new Date().toISOString().split('T')[0]}.xlsx`);

      toast({
        title: "Éxito",
        description: "Datos exportados correctamente en formato Excel",
      });
    } catch (error) {
      console.error('Error exportando:', error);
      toast({
        title: "Error",
        description: "No se pudo exportar el archivo",
        variant: "destructive",
      });
    }
  };

  const descargarPlantilla = async () => {
    try {
      console.log('Descargando plantilla...');
      const response = await fetch('/api/plantilla-excel', {
        method: 'GET',
        headers: {
          'Accept': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
        }
      });
      
      console.log('Respuesta:', response.status, response.statusText);
      
      if (response.ok) {
        const blob = await response.blob();
        console.log('Blob size:', blob.size);
        
        // Crear enlace de descarga
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = 'plantilla_comercializadoras.xlsx';
        link.style.display = 'none';
        document.body.appendChild(link);
        link.click();
        
        // Limpiar
        setTimeout(() => {
          document.body.removeChild(link);
          window.URL.revokeObjectURL(url);
        }, 100);

        toast({
          title: "✅ Éxito",
          description: "Plantilla descargada correctamente",
        });
      } else {
        const errorText = await response.text();
        console.log('Error en respuesta:', errorText);
        throw new Error(`Error ${response.status}: ${errorText}`);
      }
    } catch (error) {
      console.error('Error descargando plantilla:', error);
      toast({
        title: "❌ Error",
        description: `No se pudo descargar la plantilla: ${error instanceof Error ? error.message : 'Error desconocido'}`,
        variant: "destructive",
      });
    }
  };

  const procesarImportacionExcel = async (archivo: File) => {
    try {
      const formData = new FormData();
      formData.append('file', archivo);

      const response = await fetch('/api/import-excel', {
        method: 'POST',
        body: formData,
      });

      if (response.ok) {
        const resultado = await response.json();
        toast({
          title: "Éxito",
          description: `Importadas ${resultado.processed} filas correctamente`,
        });
        setImportDialogOpen(false);
        cargarDatos();
      } else {
        throw new Error('Error en importación');
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudo procesar el archivo Excel",
        variant: "destructive",
      });
    }
  };

  const totalOfertas = comercializadoras.reduce((acc, c) => acc + (c.tarifas?.length || 0), 0);
  const ofertasActivas = comercializadoras.reduce((acc, c) => 
    acc + (c.tarifas?.filter(o => o.activa).length || 0), 0);

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
          <Button variant="outline" onClick={descargarPlantilla}>
            <FileSpreadsheet className="h-4 w-4 mr-2" />
            Descargar Plantilla
          </Button>
          <Button variant="outline" onClick={() => setImportDialogOpen(true)}>
            <Upload className="h-4 w-4 mr-2" />
            Importar Excel
          </Button>
          <Button variant="outline" onClick={exportarExcel}>
            <Download className="h-4 w-4 mr-2" />
            Exportar Excel
          </Button>
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
                      {comercializadora.tarifas?.length || 0} tarifas disponibles
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
              {(comercializadora.tarifas?.length || 0) > 0 ? (
                <div className="divide-y">
                  {comercializadora.tarifas?.map((tarifa) => (
                    <div key={tarifa.id} className="p-6 hover:bg-gray-50 transition-colors">
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <div className="flex items-center space-x-3 mb-2">
                            <h4 className="font-semibold text-lg">{tarifa.nombreOferta}</h4>
                            <Badge variant="outline">{tarifa.tipoOferta}</Badge>
                            <Badge variant={tarifa.activa ? "default" : "secondary"}>
                              {tarifa.activa ? "Activa" : "Inactiva"}
                            </Badge>
                          </div>
                          
                          <p className="text-gray-600 mb-3">
                            Tarifa {tarifa.tarifa} • {tarifa.zona}
                          </p>
                          
                          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                            <div className="bg-blue-50 rounded-lg p-3">
                              <p className="text-sm text-blue-600 font-medium">Precio Energía</p>
                              <p className="text-lg font-bold text-blue-900">{tarifa.energiaP1.toFixed(3)} €/kWh</p>
                            </div>
                            
                            <div className="bg-green-50 rounded-lg p-3">
                              <p className="text-sm text-green-600 font-medium">Término Potencia</p>
                              <p className="text-lg font-bold text-green-900">{(tarifa.potenciaP1 || 0).toFixed(2)} €/kW mes</p>
                            </div>
                            
                            <div className="bg-purple-50 rounded-lg p-3">
                              <p className="text-sm text-purple-600 font-medium">Comisión</p>
                              <p className="text-lg font-bold text-purple-900">
                                {tarifa.rango === 'E' ? 'Por Energía' : 'Por Potencia'}
                              </p>
                            </div>
                            
                            <div className="bg-orange-50 rounded-lg p-3">
                              <p className="text-sm text-orange-600 font-medium">Rango Comisión</p>
                              <p className="text-sm font-medium text-orange-900">
                                {tarifa.rangoDesde} - {tarifa.rangoHasta || '∞'}
                              </p>
                            </div>
                          </div>
                        </div>
                        
                        <div className="flex space-x-2 ml-4">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => editarTarifa(tarifa)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => eliminarTarifa(tarifa.id)}
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
                  <p>No hay ofertas para esta comercializadora</p>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Dialog de Edición de Oferta */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Editar Oferta</DialogTitle>
            <DialogDescription>
              Modifica los datos de la oferta seleccionada
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
            <Button variant="outline" onClick={() => setEditDialogOpen(false)}>
              <X className="h-4 w-4 mr-2" />
              Cancelar
            </Button>
            <Button onClick={guardarOferta}>
              <Save className="h-4 w-4 mr-2" />
              Guardar Cambios
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog de Importación */}
      <Dialog open={importDialogOpen} onOpenChange={setImportDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Importar desde Excel</DialogTitle>
            <DialogDescription>
              Sube un archivo Excel con las comercializadoras y ofertas
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
              <h4 className="font-medium text-blue-900 mb-2 flex items-center">
                <FileSpreadsheet className="h-4 w-4 mr-2" />
                🎯 Recomendación
              </h4>
              <div className="text-sm text-blue-700">
                <p><strong>¿Primera vez?</strong> Descarga la plantilla Excel para ver el formato exacto y tener ejemplos de datos.</p>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="mt-2"
                  onClick={descargarPlantilla}
                >
                  <FileSpreadsheet className="h-4 w-4 mr-2" />
                  Descargar Plantilla con Ejemplos
                </Button>
              </div>
            </div>
            
            <div>
              <Label htmlFor="excel-file">Archivo Excel (.xlsx, .xls, .csv)</Label>
              <Input
                id="excel-file"
                type="file"
                accept=".xlsx,.xls,.csv"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) {
                    procesarImportacionExcel(file);
                  }
                }}
              />
              <p className="text-xs text-gray-500 mt-1">
                Puede procesar archivos con miles de filas. Perfecto para tus 5000+ líneas de comisiones.
              </p>
            </div>
            
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <h4 className="font-medium text-green-900 mb-2 flex items-center">
                <CheckCircle className="h-4 w-4 mr-2" />
                Características de Importación
              </h4>
              <div className="text-sm text-green-700 space-y-1">
                <p>✅ Procesamiento masivo: +5000 filas</p>
                <p>✅ Creación automática de comercializadoras</p>
                <p>✅ Actualización de ofertas existentes</p>
                <p>✅ Validación de datos automática</p>
                <p>✅ Informe detallado de errores</p>
              </div>
            </div>
            
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
              <h4 className="font-medium text-amber-900 mb-2 flex items-center">
                <FileSpreadsheet className="h-4 w-4 mr-2" />
                Columnas Requeridas
              </h4>
              <div className="text-sm text-amber-700">
                <div className="grid grid-cols-2 gap-2">
                  <ul className="list-disc list-inside space-y-1">
                    <li>Comercializadora *</li>
                    <li>Oferta *</li>
                    <li>Tarifa</li>
                    <li>Tipo</li>
                    <li>Precio Energía (€/kWh) *</li>
                  </ul>
                  <ul className="list-disc list-inside space-y-1">
                    <li>Término Potencia (€/kW mes) *</li>
                    <li>Descripción</li>
                    <li>Comisión Tipo</li>
                    <li>Comisión Valor</li>
                    <li>Comisión Mínimo/Máximo</li>
                  </ul>
                </div>
                <p className="mt-2 text-xs">* = Campos obligatorios</p>
              </div>
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setImportDialogOpen(false)}>
              Cerrar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
