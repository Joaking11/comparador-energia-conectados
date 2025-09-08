
'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
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
  EyeOff
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
                  >
                    {item.activa ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </Button>
                  
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => eliminar(item.id)}
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

      {/* Información de ayuda */}
      <Card className="mt-8">
        <CardHeader>
          <CardTitle>💡 Funcionalidades de Gestión</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <h4 className="font-semibold mb-2">✅ Funcionalidades Implementadas</h4>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• Visualización completa de datos</li>
                <li>• Búsqueda y filtrado avanzado</li>
                <li>• Activar/desactivar elementos</li>
                <li>• Eliminación segura con confirmación</li>
                <li>• Actualización automática de datos</li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold mb-2">🚀 Funcionalidades Avanzadas</h4>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• Importación inteligente con IA</li>
                <li>• OCR para archivos PDF</li>
                <li>• Mapeo automático de columnas</li>
                <li>• Validación automática de datos</li>
                <li>• Detección de comercializadoras</li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold mb-2">🔧 Próximas Mejoras</h4>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• Editor inline para modificaciones</li>
                <li>• Exportación masiva de datos</li>
                <li>• Histórico de cambios</li>
                <li>• Plantillas personalizables</li>
                <li>• API REST completa</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
