
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
  const [filtroComercializadora, setFiltroComercializadora] = useState('todas');
  const [filtroOferta, setFiltroOferta] = useState('todas');
  const [comercializadoras, setComercializadoras] = useState<any[]>([]);
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
      
      const promises = [fetch(url)];
      
      // Cargar comercializadoras para filtros si estamos en tarifas
      if (activeTab === 'tarifas') {
        promises.push(fetch('/api/comercializadoras'));
      }

      const responses = await Promise.all(promises);
      
      if (responses[0].ok) {
        const data = await responses[0].json();
        setDatos(data);
      }

      // Si hay segunda respuesta (comercializadoras), procesarla
      if (responses[1] && responses[1].ok) {
        const comercializadorasData = await responses[1].json();
        setComercializadoras(comercializadorasData);
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
    // Filtro por búsqueda de texto
    if (busqueda) {
      const busquedaLower = busqueda.toLowerCase();
      let matchBusqueda = false;
      
      switch (activeTab) {
        case 'comercializadoras':
          matchBusqueda = item.nombre?.toLowerCase().includes(busquedaLower);
          break;
        case 'tarifas':
          matchBusqueda = (
            item.nombreOferta?.toLowerCase().includes(busquedaLower) ||
            item.comercializadoras?.nombre?.toLowerCase().includes(busquedaLower)
          );
          break;
        case 'comisiones':
          matchBusqueda = (
            item.comercializadoras?.nombre?.toLowerCase().includes(busquedaLower) ||
            item.tarifa?.toLowerCase().includes(busquedaLower)
          );
          break;
        default:
          matchBusqueda = true;
      }
      
      if (!matchBusqueda) return false;
    }

    // Filtros específicos para tarifas
    if (activeTab === 'tarifas') {
      // Filtro por comercializadora
      if (filtroComercializadora !== 'todas' && item.comercializadoraId !== filtroComercializadora) {
        return false;
      }
      
      // Filtro por oferta
      if (filtroOferta !== 'todas' && item.nombreOferta !== filtroOferta) {
        return false;
      }
    }

    return true;
  });

  // Obtener ofertas únicas para el filtro
  const ofertasUnicas = activeTab === 'tarifas' ? 
    [...new Set(datos.map((t: any) => t.nombreOferta))].filter(Boolean) : 
    [];

  const toggleEstado = async (id: string, activo: boolean) => {
    try {
      console.log('👁️ Toggle estado:', { id, activo, activeTab });
      
      let url = '';
      let payload: any = {};
      
      switch (activeTab) {
        case 'comercializadoras':
          url = `/api/comercializadoras`;
          payload = { id, activa: !activo };
          break;
        case 'tarifas':
          url = `/api/ofertas/${id}`;
          payload = { activa: !activo };
          break;
        case 'comisiones':
          url = `/api/admin/comisiones/${id}`;
          payload = { activa: !activo };
          break;
        default:
          throw new Error(`Tipo no soportado: ${activeTab}`);
      }
      
      console.log('📡 Enviando:', { url, payload, method: 'PUT' });
      
      const response = await fetch(url, {
        method: 'PUT',
        headers: { 
          'Content-Type': 'application/json',
          'Cache-Control': 'no-cache'
        },
        body: JSON.stringify(payload)
      });

      console.log('📡 Respuesta:', { status: response.status, statusText: response.statusText });

      if (response.ok) {
        const result = await response.json();
        console.log('✅ Resultado:', result);
        
        toast({
          title: '✅ Estado actualizado',
          description: `${activeTab.slice(0, -1)} ${!activo ? 'activada' : 'desactivada'}`
        });
        
        // Recargar datos después de un breve retraso
        setTimeout(() => {
          cargarDatos();
        }, 200);
        
      } else {
        const errorText = await response.text();
        console.error('❌ Error en respuesta:', { status: response.status, errorText });
        
        let errorData;
        try {
          errorData = JSON.parse(errorText);
        } catch {
          errorData = { message: errorText };
        }
        
        throw new Error(errorData.message || `Error HTTP ${response.status}`);
      }
    } catch (error) {
      console.error('❌ Error completo:', error);
      toast({
        title: '❌ Error',
        description: `No se pudo actualizar el estado: ${error instanceof Error ? error.message : 'Error desconocido'}`,
        variant: 'destructive'
      });
    }
  };

  const descargarPlantilla = (tipo: 'tarifas' | 'comisiones') => {
    try {
      const endpoint = tipo === 'comisiones' 
        ? '/api/plantilla-comisiones' 
        : '/api/plantilla-excel';
      
      console.log('🎯 Descarga directa plantilla:', { endpoint, tipo });
      
      toast({
        title: '⬇️ Descargando...',
        description: `Iniciando descarga de ${tipo}. Si no funciona, usa "Copiar URL"`
      });
      
      // Método más directo: usar window.location.href
      window.location.href = endpoint;
      
      // Alternativa: abrir en ventana nueva
      setTimeout(() => {
        const newWindow = window.open(endpoint, '_blank');
        if (!newWindow) {
          console.log('Popup bloqueado, usando método directo');
        }
      }, 500);
      
    } catch (error) {
      console.error('❌ Error descarga plantilla:', error);
      toast({
        title: 'Error en la descarga',
        description: 'Usa el botón "Copiar URL" como alternativa',
        variant: 'destructive'
      });
    }
  };

  const descargarDirecto = (tipo: 'tarifas' | 'comisiones') => {
    try {
      const endpoint = tipo === 'comisiones' 
        ? '/api/plantilla-comisiones' 
        : '/api/plantilla-excel';
      
      console.log('🔗 Descarga directa alternativa:', { endpoint, tipo });
      
      // Método 1: Usar iframe oculto (funciona mejor en algunos navegadores)
      const iframe = document.createElement('iframe');
      iframe.style.display = 'none';
      iframe.src = endpoint;
      document.body.appendChild(iframe);
      
      // Limpiar el iframe después de un momento
      setTimeout(() => {
        document.body.removeChild(iframe);
      }, 3000);
      
      toast({
        title: '🔄 Método alternativo',
        description: `Intentando descarga con iframe para ${tipo}. Si falla, usa "Copiar URL"`
      });
      
    } catch (error) {
      console.error('❌ Error en descarga directa:', error);
      
      // Fallback final: mostrar la URL directamente
      const endpoint = tipo === 'comisiones' 
        ? '/api/plantilla-comisiones' 
        : '/api/plantilla-excel';
      const urlCompleta = `${window.location.origin}${endpoint}`;
      
      alert(`Copia esta URL en tu navegador:\n\n${urlCompleta}`);
      
      toast({
        title: 'URL de descarga',
        description: 'Revisa la alerta con la URL para copiar',
        variant: 'default'
      });
    }
  };

  const copiarURL = async (tipo: 'tarifas' | 'comisiones') => {
    try {
      const endpoint = tipo === 'comisiones' 
        ? '/api/plantilla-comisiones' 
        : '/api/plantilla-excel';
      
      const urlCompleta = `${window.location.origin}${endpoint}`;
      
      console.log('📋 Copiando URL:', urlCompleta);
      
      // Intentar copiar al portapapeles usando la API moderna
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(urlCompleta);
        
        toast({
          title: '📋 URL copiada al portapapeles',
          description: `✅ ${urlCompleta}`
        });
      } else {
        // Fallback: Crear un elemento input temporal para copiar
        const input = document.createElement('input');
        input.value = urlCompleta;
        input.style.position = 'absolute';
        input.style.left = '-9999px';
        document.body.appendChild(input);
        
        input.select();
        input.setSelectionRange(0, 99999); // Para móviles
        
        const success = document.execCommand('copy');
        document.body.removeChild(input);
        
        if (success) {
          toast({
            title: '📋 URL copiada (método clásico)',
            description: `✅ ${urlCompleta}`
          });
        } else {
          throw new Error('No se pudo copiar automáticamente');
        }
      }
      
    } catch (error) {
      // Fallback: Mostrar la URL en un toast para copiar manualmente
      const endpoint = tipo === 'comisiones' 
        ? '/api/plantilla-comisiones' 
        : '/api/plantilla-excel';
      
      const urlCompleta = `${window.location.origin}${endpoint}`;
      
      console.error('Error copiando URL:', error);
      console.log('🔗 URL para copiar manualmente:', urlCompleta);
      
      // Mostrar un modal o prompt con la URL
      if (confirm(`No se pudo copiar automáticamente. ¿Quieres que se abra la URL?\n\n${urlCompleta}`)) {
        window.open(urlCompleta, '_blank');
      }
      
      toast({
        title: '⚠️ Copia esta URL manualmente',
        description: urlCompleta,
        variant: 'default'
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

              {/* Filtros adicionales para tarifas */}
              {activeTab === 'tarifas' && (
                <>
                  <Select value={filtroComercializadora} onValueChange={setFiltroComercializadora}>
                    <SelectTrigger className="w-48">
                      <SelectValue placeholder="Comercializadora" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="todas">Todas las comercializadoras</SelectItem>
                      {comercializadoras.map(c => (
                        <SelectItem key={c.id} value={c.id}>{c.nombre}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  
                  <Select value={filtroOferta} onValueChange={setFiltroOferta}>
                    <SelectTrigger className="w-48">
                      <SelectValue placeholder="Oferta" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="todas">Todas las ofertas</SelectItem>
                      {ofertasUnicas.map(oferta => (
                        <SelectItem key={oferta} value={oferta}>{oferta}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </>
              )}
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
                  onClick={() => descargarDirecto(activeTab === 'comisiones' ? 'comisiones' : 'tarifas')}
                  className="bg-yellow-50 border-yellow-200 text-yellow-800 hover:bg-yellow-100"
                  title="Método alternativo si no funciona la descarga normal"
                >
                  ⬇️ Descarga Directa
                </Button>
                <Button 
                  variant="outline"
                  onClick={() => copiarURL(activeTab === 'comisiones' ? 'comisiones' : 'tarifas')}
                  className="bg-purple-50 border-purple-200 text-purple-800 hover:bg-purple-100"
                  title="Copia la URL completa al portapapeles"
                >
                  📋 Copiar URL
                </Button>
                <Button 
                  variant="outline"
                  onClick={() => {
                    const tipo = activeTab === 'comisiones' ? 'comisiones' : 'tarifas';
                    const endpoint = tipo === 'comisiones' 
                      ? '/api/plantilla-comisiones' 
                      : '/api/plantilla-excel';
                    const urlCompleta = `${window.location.origin}${endpoint}`;
                    
                    // Mostrar en un modal o alert para copiar fácilmente
                    const mensaje = `📥 URL DE DESCARGA DIRECTA:\n\n${urlCompleta}\n\n✅ Copia y pega esta URL en una nueva pestaña del navegador para descargar directamente el Excel de ${tipo}.`;
                    
                    if (confirm(mensaje + "\n\n¿Quieres que se abra automáticamente?")) {
                      window.open(urlCompleta, '_blank');
                    }
                    
                    toast({
                      title: '🔗 URL mostrada',
                      description: `URL de ${tipo} lista para copiar de la ventana emergente`
                    });
                  }}
                  className="bg-orange-50 border-orange-200 text-orange-800 hover:bg-orange-100"
                  title="Muestra la URL en texto para copiar manualmente"
                >
                  🔗 Mostrar URL
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
              <form id="edit-form">
              {activeTab === 'comercializadoras' && (
                <>
                  <div>
                    <Label htmlFor="edit-nombre">Nombre</Label>
                    <Input
                      id="edit-nombre"
                      name="nombre"
                      defaultValue={editando.nombre}
                      placeholder="Nombre de la comercializadora"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="edit-email">Email</Label>
                      <Input
                        id="edit-email"
                        name="email"
                        type="email"
                        defaultValue={editando.email || ''}
                        placeholder="contacto@comercializadora.com"
                      />
                    </div>
                    <div>
                      <Label htmlFor="edit-telefono">Teléfono</Label>
                      <Input
                        id="edit-telefono"
                        name="telefono"
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
                        name="nombreOferta"
                        defaultValue={editando.nombreOferta}
                        placeholder="Nombre de la tarifa"
                      />
                    </div>
                    <div>
                      <Label htmlFor="edit-tarifa">Tarifa de Acceso</Label>
                      <Select defaultValue={editando.tarifa} name="tarifa">
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
                  
                  {/* Precios de Energía */}
                  <div className="mb-4">
                    <h3 className="text-lg font-semibold mb-3 text-orange-600">⚡ Precios de Energía (€/kWh)</h3>
                    <div className="grid grid-cols-3 gap-3">
                      <div>
                        <Label htmlFor="edit-energiaP1">P1 (Punta)</Label>
                        <Input
                          id="edit-energiaP1" name="energiaP1"
                          type="number"
                          step="0.000001"
                          defaultValue={editando.energiaP1}
                          placeholder="0.185000"
                        />
                      </div>
                      <div>
                        <Label htmlFor="edit-energiaP2">P2 (Llano)</Label>
                        <Input
                          id="edit-energiaP2" name="energiaP2"
                          type="number"
                          step="0.000001"
                          defaultValue={editando.energiaP2}
                          placeholder="0.160000"
                        />
                      </div>
                      <div>
                        <Label htmlFor="edit-energiaP3">P3 (Valle)</Label>
                        <Input
                          id="edit-energiaP3" name="energiaP3"
                          type="number"
                          step="0.000001"
                          defaultValue={editando.energiaP3}
                          placeholder="0.140000"
                        />
                      </div>
                      <div>
                        <Label htmlFor="edit-energiaP4">P4</Label>
                        <Input
                          id="edit-energiaP4" name="energiaP4"
                          type="number"
                          step="0.000001"
                          defaultValue={editando.energiaP4}
                          placeholder="0.000000"
                        />
                      </div>
                      <div>
                        <Label htmlFor="edit-energiaP5">P5</Label>
                        <Input
                          id="edit-energiaP5" name="energiaP5"
                          type="number"
                          step="0.000001"
                          defaultValue={editando.energiaP5}
                          placeholder="0.000000"
                        />
                      </div>
                      <div>
                        <Label htmlFor="edit-energiaP6">P6</Label>
                        <Input
                          id="edit-energiaP6" name="energiaP6"
                          type="number"
                          step="0.000001"
                          defaultValue={editando.energiaP6}
                          placeholder="0.000000"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Precios de Potencia */}
                  <div className="mb-4">
                    <h3 className="text-lg font-semibold mb-3 text-purple-600">🔌 Precios de Potencia (€/kW·día)</h3>
                    <div className="grid grid-cols-3 gap-3">
                      <div>
                        <Label htmlFor="edit-potenciaP1">P1 (Punta)</Label>
                        <Input
                          id="edit-potenciaP1" name="potenciaP1"
                          type="number"
                          step="0.000001"
                          defaultValue={editando.potenciaP1}
                          placeholder="0.115000"
                        />
                      </div>
                      <div>
                        <Label htmlFor="edit-potenciaP2">P2 (Llano)</Label>
                        <Input
                          id="edit-potenciaP2" name="potenciaP2"
                          type="number"
                          step="0.000001"
                          defaultValue={editando.potenciaP2}
                          placeholder="0.080000"
                        />
                      </div>
                      <div>
                        <Label htmlFor="edit-potenciaP3">P3 (Valle)</Label>
                        <Input
                          id="edit-potenciaP3" name="potenciaP3"
                          type="number"
                          step="0.000001"
                          defaultValue={editando.potenciaP3}
                          placeholder="0.040000"
                        />
                      </div>
                      <div>
                        <Label htmlFor="edit-potenciaP4">P4</Label>
                        <Input
                          id="edit-potenciaP4" name="potenciaP4"
                          type="number"
                          step="0.000001"
                          defaultValue={editando.potenciaP4}
                          placeholder="0.000000"
                        />
                      </div>
                      <div>
                        <Label htmlFor="edit-potenciaP5">P5</Label>
                        <Input
                          id="edit-potenciaP5" name="potenciaP5"
                          type="number"
                          step="0.000001"
                          defaultValue={editando.potenciaP5}
                          placeholder="0.000000"
                        />
                      </div>
                      <div>
                        <Label htmlFor="edit-potenciaP6">P6</Label>
                        <Input
                          id="edit-potenciaP6" name="potenciaP6"
                          type="number"
                          step="0.000001"
                          defaultValue={editando.potenciaP6}
                          placeholder="0.000000"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="text-sm text-gray-600 bg-blue-50 p-3 rounded-lg">
                    <p className="font-semibold mb-1">📝 Nota importante:</p>
                    <p>Para tarifas 2.0TD usar principalmente P1, P2, P3. Para tarifas 3.0TD y 6.1TD usar todos los periodos según corresponda. Las comisiones se gestionan en el tab "Comisiones".</p>
                  </div>
                </>
              )}
              
              {activeTab === 'comisiones' && (
                <>
                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <Label htmlFor="edit-zona">Zona</Label>
                      <Select defaultValue={editando.zona} name="zona">
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
                        id="edit-comision-energia" name="porcentajeFeeEnergia"
                        type="number"
                        step="0.01"
                        defaultValue={editando.porcentajeFeeEnergia}
                        placeholder="25.00"
                      />
                    </div>
                    <div>
                      <Label htmlFor="edit-comision-potencia">% Potencia</Label>
                      <Input
                        id="edit-comision-potencia" name="porcentajeFeePotencia"
                        type="number"
                        step="0.01"
                        defaultValue={editando.porcentajeFeePotencia}
                        placeholder="45.00"
                      />
                    </div>
                  </div>
                </>
              )}
              
              </form>
              <div className="flex justify-end gap-3 pt-4 border-t">
                <Button variant="outline" onClick={() => setMostrandoEditor(false)}>
                  Cancelar
                </Button>
                <Button 
                  onClick={async () => {
                    try {
                      const formData = new FormData(document.getElementById('edit-form') as HTMLFormElement);
                      const data: any = {};
                      
                      if (activeTab === 'comercializadoras') {
                        data.nombre = formData.get('nombre');
                        data.email = formData.get('email');
                        data.telefono = formData.get('telefono');
                      } else if (activeTab === 'tarifas') {
                        data.nombreOferta = formData.get('nombreOferta');
                        data.tarifa = formData.get('tarifa');
                        data.energiaP1 = parseFloat(formData.get('energiaP1') as string) || 0;
                        data.energiaP2 = parseFloat(formData.get('energiaP2') as string) || 0;
                        data.energiaP3 = parseFloat(formData.get('energiaP3') as string) || 0;
                        data.energiaP4 = parseFloat(formData.get('energiaP4') as string) || 0;
                        data.energiaP5 = parseFloat(formData.get('energiaP5') as string) || 0;
                        data.energiaP6 = parseFloat(formData.get('energiaP6') as string) || 0;
                        data.potenciaP1 = parseFloat(formData.get('potenciaP1') as string) || 0;
                        data.potenciaP2 = parseFloat(formData.get('potenciaP2') as string) || 0;
                        data.potenciaP3 = parseFloat(formData.get('potenciaP3') as string) || 0;
                        data.potenciaP4 = parseFloat(formData.get('potenciaP4') as string) || 0;
                        data.potenciaP5 = parseFloat(formData.get('potenciaP5') as string) || 0;
                        data.potenciaP6 = parseFloat(formData.get('potenciaP6') as string) || 0;
                      } else if (activeTab === 'comisiones') {
                        data.zona = formData.get('zona');
                        data.porcentajeFeeEnergia = parseFloat(formData.get('porcentajeFeeEnergia') as string) || 0;
                        data.porcentajeFeePotencia = parseFloat(formData.get('porcentajeFeePotencia') as string) || 0;
                      }
                      
                      let url = '';
                      switch (activeTab) {
                        case 'comercializadoras':
                          url = `/api/comercializadoras`;
                          data.id = editando.id;
                          break;
                        case 'tarifas':
                          url = `/api/ofertas/${editando.id}`;
                          break;
                        case 'comisiones':
                          url = `/api/admin/comisiones/${editando.id}`;
                          break;
                      }

                      const response = await fetch(url, {
                        method: 'PUT',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify(data)
                      });

                      if (response.ok) {
                        toast({
                          title: '✅ Guardado exitoso',
                          description: 'Los cambios se han guardado correctamente'
                        });
                        setMostrandoEditor(false);
                        cargarDatos();
                      } else {
                        const error = await response.json();
                        throw new Error(error.message || 'Error al guardar');
                      }
                    } catch (error) {
                      console.error('Error guardando:', error);
                      toast({
                        title: '❌ Error',
                        description: `No se pudieron guardar los cambios: ${error instanceof Error ? error.message : 'Error desconocido'}`,
                        variant: 'destructive'
                      });
                    }
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
                <li>• 📥 <strong>Plantilla Excel</strong>: Descarga directa usando window.location</li>
                <li>• ⬇️ <strong>Descarga Directa</strong>: Método iframe alternativo</li>
                <li>• 📋 <strong>Copiar URL</strong>: Copia URL completa al portapapeles</li>
                <li>• 🔗 <strong>Mostrar URL</strong>: Ventana emergente con URL para copiar fácilmente</li>
                <li>• 📤 <strong>Importar Excel</strong>: Sube archivos masivos</li>
                <li>• ✏️ <strong>Editar</strong>: Clic en botón azul para modificar</li>
                <li>• 👁️ <strong>Activar/Desactivar</strong>: Clic en ojo (ahora corregido para tarifas)</li>
                <li>• 🗑️ <strong>Eliminar</strong>: Botón rojo con confirmación</li>
                <li>• 🔍 <strong>Buscar</strong>: Filtrado en tiempo real</li>
                <li className="mt-2 pt-2 border-t border-gray-300">
                  <strong>✨ Nuevo: Exportación de comisiones mejorada</strong>
                </li>
                <li>• Las tarifas con FEE ahora muestran porcentajes en lugar de comisión fija</li>
                <li>• Columna "Tipo Comisión" indica si es "Fija" o "Porcentual (FEE)"</li>
                <li>• Nueva columna "Energía Verde" para ofertas ecológicas</li>
                <li className="mt-2 pt-2 border-t border-gray-300">
                  <strong>📋 URLs de emergencia (copia y pega):</strong>
                </li>
                <li>• Tarifas: <code className="bg-gray-100 px-1 rounded text-xs break-all">{typeof window !== 'undefined' ? window.location.origin : ''}/api/plantilla-excel</code></li>
                <li>• Comisiones: <code className="bg-gray-100 px-1 rounded text-xs break-all">{typeof window !== 'undefined' ? window.location.origin : ''}/api/plantilla-comisiones</code></li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
