
'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import Link from 'next/link';
import { 
  Upload, 
  FileSpreadsheet, 
  Edit, 
  Trash2, 
  Plus, 
  Search, 
  Filter,
  Download,
  RefreshCw,
  AlertTriangle,
  FileText,
  DollarSign,
  Building,
  Percent,
  ArrowLeft,
  Home
} from 'lucide-react';

export default function AdminComisionesPage() {
  const [comisiones, setComisiones] = useState<any[]>([]);
  const [comercializadoras, setComercializadoras] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filtroComercializadora, setFiltroComercializadora] = useState('todas');
  const [filtroTarifa, setFiltroTarifa] = useState('todas');
  const [filtroZona, setFiltroZona] = useState('todas');
  const [busqueda, setBusqueda] = useState('');
  const [mostrandoEditor, setMostrandoEditor] = useState(false);
  const [comisionEditando, setComisionEditando] = useState<any>(null);
  const [procesandoArchivo, setProcesandoArchivo] = useState(false);
  const { toast } = useToast();

  const [formData, setFormData] = useState({
    comercializadoraId: '',
    nombreOferta: '',
    tarifa: '2.0TD',
    zona: 'Peninsula',
    tipoOferta: 'Fijo',
    tipoCliente: 'General',
    rango: 'E',
    rangoDesde: 0,
    rangoHasta: null,
    comisionEnergia: 0,
    comisionPotencia: 0,
    comisionFija: 0,
    observaciones: ''
  });

  useEffect(() => {
    cargarDatos();
  }, []);

  const cargarDatos = async () => {
    try {
      setLoading(true);
      
      const [comisionesRes, comercializadorasRes] = await Promise.all([
        fetch('/api/admin/comisiones'),
        fetch('/api/comercializadoras')
      ]);

      if (comisionesRes.ok) {
        const comisionesData = await comisionesRes.json();
        setComisiones(comisionesData);
      }

      if (comercializadorasRes.ok) {
        const comercializadorasData = await comercializadorasRes.json();
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

  const comisionesFiltradas = comisiones.filter(comision => {
    const matchComercializadora = filtroComercializadora === 'todas' || 
      comision.comercializadoraId === filtroComercializadora;
    const matchTarifa = filtroTarifa === 'todas' || comision.tarifa === filtroTarifa;
    const matchZona = filtroZona === 'todas' || comision.zona === filtroZona;
    const matchBusqueda = !busqueda || 
      comision.comercializadoras?.nombre?.toLowerCase().includes(busqueda.toLowerCase()) ||
      comision.nombreOferta?.toLowerCase().includes(busqueda.toLowerCase());
    
    return matchComercializadora && matchTarifa && matchZona && matchBusqueda;
  });

  const handleSubirExcel = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.name.match(/\.(xlsx|xlsm|xls|pdf)$/i)) {
      toast({
        title: 'Error',
        description: 'Por favor sube un archivo válido (.xlsx, .xlsm, .xls, .pdf)',
        variant: 'destructive'
      });
      return;
    }

    const formData = new FormData();
    formData.append('file', file);
    formData.append('tipo', 'comisiones');

    setProcesandoArchivo(true);
    
    try {
      const response = await fetch('/api/admin/import-smart', {
        method: 'POST',
        body: formData
      });

      const result = await response.json();

      if (response.ok) {
        toast({
          title: 'Importación exitosa',
          description: `${result.imported} comisiones procesadas correctamente`
        });
        cargarDatos();
      } else {
        throw new Error(result.error || 'Error en la importación');
      }
    } catch (error) {
      console.error('Error subiendo archivo:', error);
      toast({
        title: 'Error',
        description: 'No se pudo procesar el archivo: ' + (error instanceof Error ? error.message : 'Error desconocido'),
        variant: 'destructive'
      });
    } finally {
      setProcesandoArchivo(false);
      event.target.value = '';
    }
  };

  const abrirEditor = (comision: any = null) => {
    if (comision) {
      setComisionEditando(comision);
      setFormData({
        comercializadoraId: comision.comercializadoraId,
        nombreOferta: comision.nombreOferta,
        tarifa: comision.tarifa,
        zona: comision.zona,
        tipoOferta: comision.tipoOferta,
        tipoCliente: 'General',
        rango: comision.rango,
        rangoDesde: comision.rangoDesde || 0,
        rangoHasta: comision.rangoHasta,
        comisionEnergia: comision.porcentajeFeeEnergia || 0,
        comisionPotencia: comision.porcentajeFeePotencia || 0,
        comisionFija: comision.comision || 0,
        observaciones: ''
      });
    } else {
      setComisionEditando(null);
      setFormData({
        comercializadoraId: '',
        nombreOferta: '',
        tarifa: '2.0TD',
        zona: 'Peninsula',
        tipoOferta: 'Fijo',
        tipoCliente: 'General',
        rango: 'E',
        rangoDesde: 0,
        rangoHasta: null,
        comisionEnergia: 0,
        comisionPotencia: 0,
        comisionFija: 0,
        observaciones: ''
      });
    }
    setMostrandoEditor(true);
  };

  const guardarComision = async () => {
    try {
      const method = comisionEditando ? 'PUT' : 'POST';
      const url = comisionEditando ? `/api/admin/comisiones/${comisionEditando.id}` : '/api/admin/comisiones';

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      if (response.ok) {
        toast({
          title: 'Éxito',
          description: comisionEditando ? 'Comisión actualizada' : 'Comisión creada'
        });
        setMostrandoEditor(false);
        cargarDatos();
      } else {
        const error = await response.json();
        throw new Error(error.message);
      }
    } catch (error) {
      console.error('Error guardando comisión:', error);
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Error desconocido',
        variant: 'destructive'
      });
    }
  };

  const eliminarComision = async (id: string) => {
    if (!confirm('¿Estás seguro de que quieres eliminar esta comisión?')) return;

    try {
      const response = await fetch(`/api/admin/comisiones/${id}`, {
        method: 'DELETE'
      });

      if (response.ok) {
        toast({
          title: 'Éxito',
          description: 'Comisión eliminada'
        });
        cargarDatos();
      } else {
        const error = await response.json();
        throw new Error(error.message);
      }
    } catch (error) {
      console.error('Error eliminando comisión:', error);
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Error desconocido',
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
        <p className="text-sm text-gray-600">Gestión de Comisiones</p>
      </div>

      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
            <DollarSign className="h-8 w-8 text-primary" />
            Administración de Comisiones
          </h1>
          <p className="text-gray-600 mt-2">
            Gestiona las comisiones por comercializadora, sube archivos Excel o añade manualmente
          </p>
        </div>
        
        <div className="flex items-center gap-3">
          <Button onClick={() => abrirEditor()} className="flex items-center gap-2">
            <Plus className="h-4 w-4" />
            Nueva Comisión
          </Button>
        </div>
      </div>

      {/* Panel de Importación */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Upload className="h-5 w-5" />
            Importación Inteligente de Comisiones
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <Label htmlFor="excel-comisiones" className="text-sm font-medium mb-2 block">
                Subir Excel de Comisiones
              </Label>
              <div className="flex items-center gap-3">
                <Input
                  id="excel-comisiones"
                  type="file"
                  accept=".xlsx,.xlsm,.xls,.pdf"
                  onChange={handleSubirExcel}
                  disabled={procesandoArchivo}
                />
                {procesandoArchivo && <RefreshCw className="h-4 w-4 animate-spin" />}
              </div>
              <p className="text-xs text-gray-500 mt-2">
                Soporta archivos Excel (.xlsx, .xlsm, .xls) y PDF - IA interpretará automáticamente las columnas
              </p>
            </div>
            
            <div className="bg-green-50 p-4 rounded-lg">
              <h4 className="font-semibold text-green-900 mb-2 flex items-center gap-2">
                <FileSpreadsheet className="h-4 w-4" />
                Funcionalidad IA
              </h4>
              <ul className="text-sm text-green-800 space-y-1">
                <li>• Detección automática de columnas en Excel y OCR para PDF</li>
                <li>• Mapeo inteligente de comisiones por comercializadora</li>
                <li>• Validación automática de porcentajes y rangos</li>
                <li>• Reconocimiento de múltiples formatos de comisiones</li>
                <li>• Actualización inteligente de comisiones existentes</li>
                <li>• Interpretación de comisiones fijas y variables</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Filtros */}
      <Card className="mb-6">
        <CardContent className="pt-6">
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            <div>
              <Label className="text-sm font-medium">Buscar</Label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Buscar comercializadora..."
                  value={busqueda}
                  onChange={(e) => setBusqueda(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            
            <div>
              <Label className="text-sm font-medium">Comercializadora</Label>
              <Select value={filtroComercializadora} onValueChange={setFiltroComercializadora}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todas">Todas</SelectItem>
                  {comercializadoras.map(c => (
                    <SelectItem key={c.id} value={c.id}>{c.nombre}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Label className="text-sm font-medium">Tarifa</Label>
              <Select value={filtroTarifa} onValueChange={setFiltroTarifa}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todas">Todas</SelectItem>
                  <SelectItem value="2.0TD">2.0TD</SelectItem>
                  <SelectItem value="3.0TD">3.0TD</SelectItem>
                  <SelectItem value="6.1TD">6.1TD</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Label className="text-sm font-medium">Zona</Label>
              <Select value={filtroZona} onValueChange={setFiltroZona}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todas">Todas</SelectItem>
                  <SelectItem value="Peninsula">Península</SelectItem>
                  <SelectItem value="Baleares">Baleares</SelectItem>
                  <SelectItem value="Canarias">Canarias</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="flex items-end">
              <Button variant="outline" onClick={cargarDatos} className="flex items-center gap-2">
                <RefreshCw className="h-4 w-4" />
                Actualizar
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Estadísticas */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Comisiones</p>
                <p className="text-2xl font-bold">{comisiones.length}</p>
              </div>
              <DollarSign className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Filtradas</p>
                <p className="text-2xl font-bold">{comisionesFiltradas.length}</p>
              </div>
              <Filter className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Comercializadoras</p>
                <p className="text-2xl font-bold">{new Set(comisiones.map((c: any) => c.comercializadoraId)).size}</p>
              </div>
              <Building className="h-8 w-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Con Comisión Fija</p>
                <p className="text-2xl font-bold">{comisiones.filter((c: any) => c.comision > 0).length}</p>
              </div>
              <Percent className="h-8 w-8 text-orange-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabla de Comisiones */}
      <Card>
        <CardHeader>
          <CardTitle>Comisiones ({comisionesFiltradas.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full border-collapse border border-gray-200">
              <thead>
                <tr className="bg-gray-50">
                  <th className="border border-gray-200 px-4 py-2 text-left">Comercializadora</th>
                  <th className="border border-gray-200 px-4 py-2 text-left">Tarifa</th>
                  <th className="border border-gray-200 px-4 py-2 text-left">Zona</th>
                  <th className="border border-gray-200 px-4 py-2 text-left">Cliente</th>
                  <th className="border border-gray-200 px-4 py-2 text-left">Energía</th>
                  <th className="border border-gray-200 px-4 py-2 text-left">Potencia</th>
                  <th className="border border-gray-200 px-4 py-2 text-left">Fija</th>
                  <th className="border border-gray-200 px-4 py-2 text-left">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {comisionesFiltradas.map((comision: any) => (
                  <tr key={comision.id} className="hover:bg-gray-50">
                    <td className="border border-gray-200 px-4 py-2">
                      <div className="flex items-center gap-2">
                        {comision.comercializadoras?.logoUrl && (
                          <img 
                            src={comision.comercializadoras.logoUrl} 
                            alt={comision.comercializadoras.nombre}
                            className="h-6 w-6 object-contain"
                          />
                        )}
                        <span className="font-medium">{comision.comercializadoras?.nombre}</span>
                      </div>
                    </td>
                    <td className="border border-gray-200 px-4 py-2">
                      <Badge variant="outline">{comision.tarifa}</Badge>
                    </td>
                    <td className="border border-gray-200 px-4 py-2">{comision.zona}</td>
                    <td className="border border-gray-200 px-4 py-2">General</td>
                    <td className="border border-gray-200 px-4 py-2">
                      {comision.porcentajeFeeEnergia > 0 ? `${comision.porcentajeFeeEnergia.toFixed(4)}%` : '-'}
                    </td>
                    <td className="border border-gray-200 px-4 py-2">
                      {comision.porcentajeFeePotencia > 0 ? `${comision.porcentajeFeePotencia.toFixed(4)}%` : '-'}
                    </td>
                    <td className="border border-gray-200 px-4 py-2">
                      {comision.comision > 0 ? `${comision.comision.toFixed(2)}€` : '-'}
                    </td>
                    <td className="border border-gray-200 px-4 py-2">
                      <div className="flex items-center gap-2">
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => abrirEditor(comision)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => eliminarComision(comision.id)}
                          className="text-red-600 hover:text-red-700"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Modal Editor */}
      {mostrandoEditor && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold">
                  {comisionEditando ? 'Editar Comisión' : 'Nueva Comisión'}
                </h2>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setMostrandoEditor(false)}
                >
                  ×
                </Button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <Label htmlFor="comercializadora">Comercializadora</Label>
                  <Select value={formData.comercializadoraId} onValueChange={(value) => 
                    setFormData(prev => ({...prev, comercializadoraId: value}))
                  }>
                    <SelectTrigger>
                      <SelectValue placeholder="Seleccionar comercializadora" />
                    </SelectTrigger>
                    <SelectContent>
                      {comercializadoras.map(c => (
                        <SelectItem key={c.id} value={c.id}>{c.nombre}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="tarifa">Tipo de Tarifa</Label>
                  <Select value={formData.tarifa} onValueChange={(value) => 
                    setFormData(prev => ({...prev, tarifa: value}))
                  }>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="2.0TD">2.0TD</SelectItem>
                      <SelectItem value="3.0TD">3.0TD</SelectItem>
                      <SelectItem value="6.1TD">6.1TD</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="zona">Zona</Label>
                  <Select value={formData.zona} onValueChange={(value) => 
                    setFormData(prev => ({...prev, zona: value}))
                  }>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Peninsula">Península</SelectItem>
                      <SelectItem value="Baleares">Baleares</SelectItem>
                      <SelectItem value="Canarias">Canarias</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="tipoCliente">Tipo de Cliente</Label>
                  <Select value={formData.tipoCliente} onValueChange={(value) => 
                    setFormData(prev => ({...prev, tipoCliente: value}))
                  }>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="General">General</SelectItem>
                      <SelectItem value="Domestico">Doméstico</SelectItem>
                      <SelectItem value="Empresarial">Empresarial</SelectItem>
                      <SelectItem value="Industrial">Industrial</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="comisionEnergia">Comisión Energía (%)</Label>
                  <Input
                    id="comisionEnergia"
                    type="number"
                    step="0.0001"
                    value={formData.comisionEnergia}
                    onChange={(e) => setFormData(prev => ({...prev, comisionEnergia: parseFloat(e.target.value) || 0}))}
                  />
                </div>

                <div>
                  <Label htmlFor="comisionPotencia">Comisión Potencia (%)</Label>
                  <Input
                    id="comisionPotencia"
                    type="number"
                    step="0.0001"
                    value={formData.comisionPotencia}
                    onChange={(e) => setFormData(prev => ({...prev, comisionPotencia: parseFloat(e.target.value) || 0}))}
                  />
                </div>

                <div>
                  <Label htmlFor="comisionFija">Comisión Fija (€/mes)</Label>
                  <Input
                    id="comisionFija"
                    type="number"
                    step="0.01"
                    value={formData.comisionFija}
                    onChange={(e) => setFormData(prev => ({...prev, comisionFija: parseFloat(e.target.value) || 0}))}
                  />
                </div>

                <div>
                  <Label htmlFor="observaciones">Observaciones</Label>
                  <Input
                    id="observaciones"
                    value={formData.observaciones}
                    onChange={(e) => setFormData(prev => ({...prev, observaciones: e.target.value}))}
                    placeholder="Notas adicionales..."
                  />
                </div>
              </div>

              <div className="flex justify-end space-x-3 mt-6">
                <Button
                  variant="outline"
                  onClick={() => setMostrandoEditor(false)}
                >
                  Cancelar
                </Button>
                <Button onClick={guardarComision}>
                  {comisionEditando ? 'Actualizar' : 'Crear'} Comisión
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
