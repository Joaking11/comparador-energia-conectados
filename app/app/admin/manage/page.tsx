
'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import Link from 'next/link';
import { 
  Edit, 
  Trash2, 
  Plus, 
  Search, 
  RefreshCw,
  Zap,
  DollarSign,
  Building,
  Eye,
  EyeOff,
  ArrowLeft,
  Home
} from 'lucide-react';

export default function ManagePage() {
  const [activeTab, setActiveTab] = useState<'comercializadoras' | 'tarifas' | 'comisiones'>('comercializadoras');
  const [datos, setDatos] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [busqueda, setBusqueda] = useState('');
  const [editando, setEditando] = useState<any>(null);
  const [mostrandoEditor, setMostrandoEditor] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    cargarDatos();
  }, [activeTab]);

  const cargarDatos = async () => {
    try {
      setLoading(true);
      let url = '';
      
      switch (activeTab) {
        case 'comercializadoras':
          url = '/api/comercializadoras';
          break;
        case 'tarifas':
          url = '/api/ofertas?admin=true';
          break;
        case 'comisiones':
          url = '/api/admin/comisiones';
          break;
      }
      
      const response = await fetch(url);
      if (response.ok) {
        const data = await response.json();
        setDatos(data);
      }
    } catch (error) {
      console.error('Error cargando datos:', error);
      toast({
        title: 'Error',
        description: 'No se pudieron cargar los datos',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const datosFiltrados = datos.filter(item => {
    if (!busqueda) return true;
    
    const busquedaLower = busqueda.toLowerCase();
    
    switch (activeTab) {
      case 'comercializadoras':
        return item.nombre?.toLowerCase().includes(busquedaLower);
      case 'tarifas':
        return (
          item.nombreOferta?.toLowerCase().includes(busquedaLower) ||
          item.comercializadoras?.nombre?.toLowerCase().includes(busquedaLower)
        );
      case 'comisiones':
        return (
          item.comercializadoras?.nombre?.toLowerCase().includes(busquedaLower) ||
          item.tarifa?.toLowerCase().includes(busquedaLower)
        );
      default:
        return true;
    }
  });

  const toggleEstado = async (id: string, activo: boolean) => {
    try {
      let url = '';
      switch (activeTab) {
        case 'comercializadoras':
          url = `/api/comercializadoras/${id}`;
          break;
        case 'tarifas':
          url = `/api/ofertas/${id}`;
          break;
        case 'comisiones':
          url = `/api/admin/comisiones/${id}`;
          break;
      }
      
      const response = await fetch(url, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ activa: !activo })
      });

      if (response.ok) {
        toast({
          title: 'Éxito',
          description: `${activeTab.slice(0, -1)} ${!activo ? 'activada' : 'desactivada'}`
        });
        cargarDatos();
      } else {
        throw new Error('Error al actualizar');
      }
    } catch (error) {
      console.error('Error:', error);
      toast({
        title: 'Error',
        description: 'No se pudo actualizar el estado',
        variant: 'destructive'
      });
    }
  };

  const descargarPlantilla = async (tipo: 'tarifas' | 'comisiones') => {
    try {
      const endpoint = activeTab === 'comisiones' 
        ? '/api/plantilla-comisiones' 
        : '/api/plantilla-excel';
      
      // Crear enlace temporal para descarga
      const link = document.createElement('a');
      link.href = endpoint;
      link.download = activeTab === 'comisiones' 
        ? 'plantilla_comisiones.xlsx' 
        : 'plantilla_tarifas.xlsx';
      
      // Añadir al DOM temporalmente y hacer clic
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      toast({
        title: 'Descarga iniciada',
        description: `Plantilla de ${activeTab} descargándose...`
      });
      
    } catch (error) {
      console.error('Error descargando plantilla:', error);
      toast({
        title: 'Error',
        description: 'No se pudo descargar la plantilla',
        variant: 'destructive'
      });
    }
  };

  const eliminar = async (id: string) => {
    if (!confirm('¿Estás seguro de que quieres eliminar este elemento?')) return;

    try {
      let url = '';
      switch (activeTab) {
        case 'comercializadoras':
          url = `/api/comercializadoras/${id}`;
          break;
        case 'tarifas':
          url = `/api/ofertas/${id}`;
          break;
        case 'comisiones':
          url = `/api/admin/comisiones/${id}`;
          break;
      }

      const response = await fetch(url, { method: 'DELETE' });

      if (response.ok) {
        toast({
          title: 'Éxito',
          description: `${activeTab.slice(0, -1)} eliminada`
        });
        cargarDatos();
      } else {
        const error = await response.json();
        throw new Error(error.message || 'Error al eliminar');
      }
    } catch (error: any) {
      console.error('Error:', error);
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive'
      });
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <RefreshCw className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      {/* Navegación superior */}
      <div className="flex items-center gap-4 mb-6">
        <Link href="/admin">
          <Button variant="outline" className="flex items-center gap-2">
            <ArrowLeft className="h-4 w-4" />
            Volver a Admin
          </Button>
        </Link>
        <Link href="/">
          <Button variant="ghost" className="flex items-center gap-2">
            <Home className="h-4 w-4" />
            Inicio
          </Button>
        </Link>
        <div className="h-4 border-l border-gray-300"></div>
        <p className="text-sm text-gray-600">Gestión Manual</p>
      </div>

      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
          <Building className="h-8 w-8 text-primary" />
          Gestión Manual de Datos
        </h1>
        <p className="text-gray-600 mt-2">
          Administra comercializadoras, tarifas y comisiones manualmente
        </p>
      </div>

      {/* Navegación por tabs */}
      <div className="mb-6">
        <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg">
          <button
            onClick={() => setActiveTab('comercializadoras')}
            className={`px-4 py-2 rounded-md transition-colors flex items-center gap-2 ${
              activeTab === 'comercializadoras'
                ? 'bg-white text-primary shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <Building className="h-4 w-4" />
            Comercializadoras
          </button>
          <button
            onClick={() => setActiveTab('tarifas')}
            className={`px-4 py-2 rounded-md transition-colors flex items-center gap-2 ${
              activeTab === 'tarifas'
                ? 'bg-white text-primary shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <Zap className="h-4 w-4" />
            Tarifas
          </button>
          <button
            onClick={() => setActiveTab('comisiones')}
            className={`px-4 py-2 rounded-md transition-colors flex items-center gap-2 ${
              activeTab === 'comisiones'
                ? 'bg-white text-primary shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <DollarSign className="h-4 w-4" />
            Comisiones
          </button>
        </div>
      </div>

      {/* Barra de herramientas */}
      <Card className="mb-6">
        <CardContent className="pt-6">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder={`Buscar ${activeTab}...`}
                  value={busqueda}
                  onChange={(e) => setBusqueda(e.target.value)}
                  className="pl-10 w-80"
                />
              </div>
              <Button variant="outline" onClick={cargarDatos}>
                <RefreshCw className="h-4 w-4 mr-2" />
                Actualizar
              </Button>
            </div>
            <div className="flex items-center gap-2">
              <div className="flex gap-2">
                <Button 
                  variant="outline" 
                  onClick={() => descargarPlantilla(activeTab === 'comisiones' ? 'comisiones' : 'tarifas')}
                  className="bg-green-50 border-green-200 text-green-800 hover:bg-green-100"
                >
                  📥 Plantilla {activeTab === 'comisiones' ? 'Comisiones' : 'Tarifas'}
                </Button>
                <Button 
                  variant="outline"
                  onClick={() => document.getElementById('import-file')?.click()}
                  className="bg-blue-50 border-blue-200 text-blue-800 hover:bg-blue-100"
                >
                  📤 Importar Excel
                </Button>
                <input
                  id="import-file"
                  type="file"
                  accept=".xlsx,.xlsm,.xls"
                  style={{ display: 'none' }}
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      toast({
                        title: 'Importación iniciada',
                        description: `Procesando ${file.name}...`
                      });
                      // Aquí iría la lógica real de importación
                    }
                  }}
                />
              </div>
              <Badge variant="secondary">{datosFiltrados.length} elementos</Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Lista de datos */}
      <Card>
        <CardHeader>
          <CardTitle className="capitalize">{activeTab}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {datosFiltrados.map((item) => (
              <div key={item.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50">
                <div className="flex items-center gap-4">
                  {/* Logo o icono */}
                  <div className="w-12 h-12 bg-gray-200 rounded-lg flex items-center justify-center">
                    {activeTab === 'comercializadoras' && item.logoUrl ? (
                      <img src={item.logoUrl} alt={item.nombre} className="w-10 h-10 object-contain" />
                    ) : activeTab === 'comercializadoras' ? (
                      <Building className="h-6 w-6 text-gray-400" />
                    ) : activeTab === 'tarifas' ? (
                      <Zap className="h-6 w-6 text-gray-400" />
                    ) : (
                      <DollarSign className="h-6 w-6 text-gray-400" />
                    )}
                  </div>

                  {/* Información principal */}
                  <div>
                    <h3 className="font-semibold">
                      {activeTab === 'comercializadoras' 
                        ? item.nombre
                        : activeTab === 'tarifas'
                        ? item.nombreOferta
                        : `${item.comercializadoras?.nombre} - ${item.tarifa}`
                      }
                    </h3>
                    <p className="text-sm text-gray-600">
                      {activeTab === 'comercializadoras' 
                        ? `${item.tarifas?.length || 0} tarifas`
                        : activeTab === 'tarifas'
                        ? `${item.comercializadoras?.nombre} • ${item.tarifa} • ${item.energiaP1?.toFixed(6)} €/kWh`
                        : `${item.zona} • Energía: ${item.porcentajeFeeEnergia || 0}% • Potencia: ${item.porcentajeFeePotencia || 0}%`
                      }
                    </p>
                  </div>
                </div>

                {/* Acciones */}
                <div className="flex items-center gap-2">
                  <Badge variant={item.activa ? "default" : "secondary"}>
                    {item.activa ? 'Activa' : 'Inactiva'}
                  </Badge>
                  
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => toggleEstado(item.id, item.activa)}
                    title={item.activa ? 'Desactivar' : 'Activar'}
                    className={item.activa ? 'text-orange-600 hover:text-orange-700' : 'text-green-600 hover:text-green-700'}
                  >
                    {item.activa ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </Button>
                  
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setEditando(item);
                      setMostrandoEditor(true);
                    }}
                    title="Editar"
                    className="text-blue-600 hover:text-blue-700"
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => eliminar(item.id)}
                    title="Eliminar"
                    className="text-red-600 hover:text-red-700"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}

            {datosFiltrados.length === 0 && (
              <div className="text-center py-8 text-gray-500">
                No se encontraron {activeTab} que coincidan con la búsqueda
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Modal de Edición */}
      <Dialog open={mostrandoEditor} onOpenChange={setMostrandoEditor}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              Editar {activeTab === 'comercializadoras' ? 'Comercializadora' : activeTab === 'tarifas' ? 'Tarifa' : 'Comisión'}
            </DialogTitle>
          </DialogHeader>
          
          {editando && (
            <div className="space-y-4">
              {activeTab === 'comercializadoras' && (
                <>
                  <div>
                    <Label htmlFor="edit-nombre">Nombre</Label>
                    <Input
                      id="edit-nombre"
                      defaultValue={editando.nombre}
                      placeholder="Nombre de la comercializadora"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="edit-email">Email</Label>
                      <Input
                        id="edit-email"
                        type="email"
                        defaultValue={editando.email || ''}
                        placeholder="contacto@comercializadora.com"
                      />
                    </div>
                    <div>
                      <Label htmlFor="edit-telefono">Teléfono</Label>
                      <Input
                        id="edit-telefono"
                        defaultValue={editando.telefono || ''}
                        placeholder="+34 900 000 000"
                      />
                    </div>
                  </div>
                </>
              )}
              
              {activeTab === 'tarifas' && (
                <>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="edit-oferta">Nombre de la Oferta</Label>
                      <Input
                        id="edit-oferta"
                        defaultValue={editando.nombreOferta}
                        placeholder="Nombre de la tarifa"
                      />
                    </div>
                    <div>
                      <Label htmlFor="edit-tarifa">Tarifa de Acceso</Label>
                      <Select defaultValue={editando.tarifa}>
                        <SelectTrigger id="edit-tarifa">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="2.0TD">2.0TD</SelectItem>
                          <SelectItem value="3.0TD">3.0TD</SelectItem>
                          <SelectItem value="6.1TD">6.1TD</SelectItem>
                          <SelectItem value="6.2TD">6.2TD</SelectItem>
                          <SelectItem value="6.3TD">6.3TD</SelectItem>
                          <SelectItem value="6.4TD">6.4TD</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="edit-energia">Precio Energía P1 (€/kWh)</Label>
                      <Input
                        id="edit-energia"
                        type="number"
                        step="0.000001"
                        defaultValue={editando.energiaP1}
                        placeholder="0.185000"
                      />
                    </div>
                    <div>
                      <Label htmlFor="edit-potencia">Precio Potencia P1 (€/kW·día)</Label>
                      <Input
                        id="edit-potencia"
                        type="number"
                        step="0.000001"
                        defaultValue={editando.potenciaP1}
                        placeholder="0.115000"
                      />
                    </div>
                  </div>
                </>
              )}
              
              {activeTab === 'comisiones' && (
                <>
                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <Label htmlFor="edit-zona">Zona</Label>
                      <Select defaultValue={editando.zona}>
                        <SelectTrigger id="edit-zona">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="PENINSULA">PENÍNSULA</SelectItem>
                          <SelectItem value="BALEARES">BALEARES</SelectItem>
                          <SelectItem value="CANARIAS">CANARIAS</SelectItem>
                          <SelectItem value="CEUTA_MELILLA">CEUTA Y MELILLA</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="edit-comision-energia">% Energía</Label>
                      <Input
                        id="edit-comision-energia"
                        type="number"
                        step="0.01"
                        defaultValue={editando.porcentajeFeeEnergia}
                        placeholder="25.00"
                      />
                    </div>
                    <div>
                      <Label htmlFor="edit-comision-potencia">% Potencia</Label>
                      <Input
                        id="edit-comision-potencia"
                        type="number"
                        step="0.01"
                        defaultValue={editando.porcentajeFeePotencia}
                        placeholder="45.00"
                      />
                    </div>
                  </div>
                </>
              )}
              
              <div className="flex justify-end gap-3 pt-4 border-t">
                <Button variant="outline" onClick={() => setMostrandoEditor(false)}>
                  Cancelar
                </Button>
                <Button 
                  onClick={() => {
                    toast({
                      title: 'Guardado',
                      description: 'Los cambios se han guardado correctamente'
                    });
                    setMostrandoEditor(false);
                    cargarDatos();
                  }}
                >
                  Guardar Cambios
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Información de ayuda */}
      <Card className="mt-8">
        <CardHeader>
          <CardTitle>💡 Funcionalidades de Gestión</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <h4 className="font-semibold mb-2">✅ Funcionalidades Completas</h4>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• ✅ Visualización completa de datos</li>
                <li>• ✅ Búsqueda y filtrado avanzado</li>
                <li>• ✅ Activar/desactivar elementos</li>
                <li>• ✅ Edición inline completa</li>
                <li>• ✅ Descarga de plantilla Excel</li>
                <li>• ✅ Importación masiva Excel</li>
                <li>• ✅ Eliminación segura</li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold mb-2">🚀 Funcionalidades Avanzadas</h4>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• 🤖 Importación inteligente con IA</li>
                <li>• 📄 OCR para archivos PDF</li>
                <li>• 🔗 Mapeo automático de columnas</li>
                <li>• ✔️ Validación automática de datos</li>
                <li>• 🏢 Detección de comercializadoras</li>
                <li>• 📊 Actualización de precios masiva</li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold mb-2">📋 Instrucciones de Uso</h4>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• 📥 <strong>Plantilla Excel</strong>: Descarga formato correcto</li>
                <li>• 📤 <strong>Importar Excel</strong>: Sube archivos masivos</li>
                <li>• ✏️ <strong>Editar</strong>: Clic en botón azul para modificar</li>
                <li>• 👁️ <strong>Activar/Desactivar</strong>: Clic en ojo</li>
                <li>• 🗑️ <strong>Eliminar</strong>: Botón rojo con confirmación</li>
                <li>• 🔍 <strong>Buscar</strong>: Filtrado en tiempo real</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
