
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
  Zap,
  Building,
  ArrowLeft,
  Home
} from 'lucide-react';

export default function AdminTarifasPage() {
  const [tarifas, setTarifas] = useState<any[]>([]);
  const [comercializadoras, setComercializadoras] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filtroComercializadora, setFiltroComercializadora] = useState('todas');
  const [filtroTarifa, setFiltroTarifa] = useState('todas');
  const [filtroOferta, setFiltroOferta] = useState('todas');
  const [busqueda, setBusqueda] = useState('');
  const [mostrandoEditor, setMostrandoEditor] = useState(false);
  const [tarifaEditando, setTarifaEditando] = useState<any>(null);
  const [procesandoArchivo, setProcesandoArchivo] = useState(false);
  const { toast } = useToast();

  const [formData, setFormData] = useState({
    comercializadoraId: '',
    nombreOferta: '',
    tarifa: '2.0TD',
    tipoOferta: 'Fijo',
    zona: 'Peninsula',
    energiaP1: 0,
    energiaP2: 0,
    energiaP3: 0,
    energiaP4: 0,
    energiaP5: 0,
    energiaP6: 0,
    potenciaP1: 0,
    potenciaP2: 0,
    potenciaP3: 0,
    potenciaP4: 0,
    potenciaP5: 0,
    potenciaP6: 0,
    costeGestion: 0
  });

  useEffect(() => {
    cargarDatos();
  }, []);

  const cargarDatos = async () => {
    try {
      setLoading(true);
      
      const [tarifasRes, comercializadorasRes] = await Promise.all([
        fetch('/api/ofertas'),
        fetch('/api/comercializadoras')
      ]);

      if (tarifasRes.ok) {
        const tarifasData = await tarifasRes.json();
        setTarifas(tarifasData);
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

  const tarifasFiltradas = tarifas.filter((tarifa: any) => {
    const matchComercializadora = filtroComercializadora === 'todas' || 
      tarifa.comercializadoraId === filtroComercializadora;
    const matchTarifa = filtroTarifa === 'todas' || tarifa.tarifa === filtroTarifa;
    const matchOferta = filtroOferta === 'todas' || tarifa.nombreOferta === filtroOferta;
    const matchBusqueda = !busqueda || 
      tarifa.nombreOferta?.toLowerCase().includes(busqueda.toLowerCase()) ||
      tarifa.comercializadoras?.nombre?.toLowerCase().includes(busqueda.toLowerCase());
    
    return matchComercializadora && matchTarifa && matchOferta && matchBusqueda;
  });

  // Obtener ofertas únicas para el filtro
  const ofertasUnicas = [...new Set(tarifas.map((t: any) => t.nombreOferta))].filter(Boolean);

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
    formData.append('tipo', 'tarifas');

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
          description: `${result.imported} tarifas procesadas correctamente`
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

  const abrirEditor = (tarifa: any = null) => {
    if (tarifa) {
      setTarifaEditando(tarifa);
      setFormData({
        comercializadoraId: tarifa.comercializadoraId || '',
        nombreOferta: tarifa.nombreOferta || '',
        tarifa: tarifa.tarifa || '2.0TD',
        tipoOferta: tarifa.tipoOferta || 'Fijo',
        zona: tarifa.zona || 'Peninsula',
        energiaP1: tarifa.energiaP1 || 0,
        energiaP2: tarifa.energiaP2 || 0,
        energiaP3: tarifa.energiaP3 || 0,
        energiaP4: tarifa.energiaP4 || 0,
        energiaP5: tarifa.energiaP5 || 0,
        energiaP6: tarifa.energiaP6 || 0,
        potenciaP1: tarifa.potenciaP1 || 0,
        potenciaP2: tarifa.potenciaP2 || 0,
        potenciaP3: tarifa.potenciaP3 || 0,
        potenciaP4: tarifa.potenciaP4 || 0,
        potenciaP5: tarifa.potenciaP5 || 0,
        potenciaP6: tarifa.potenciaP6 || 0,
        costeGestion: tarifa.costeGestion || 0
      });
    } else {
      setTarifaEditando(null);
      setFormData({
        comercializadoraId: '',
        nombreOferta: '',
        tarifa: '2.0TD',
        tipoOferta: 'Fijo',
        zona: 'Peninsula',
        energiaP1: 0,
        energiaP2: 0,
        energiaP3: 0,
        energiaP4: 0,
        energiaP5: 0,
        energiaP6: 0,
        potenciaP1: 0,
        potenciaP2: 0,
        potenciaP3: 0,
        potenciaP4: 0,
        potenciaP5: 0,
        potenciaP6: 0,
        costeGestion: 0
      });
    }
    setMostrandoEditor(true);
  };

  const guardarTarifa = async () => {
    try {
      const method = tarifaEditando ? 'PUT' : 'POST';
      const url = tarifaEditando ? `/api/ofertas/${tarifaEditando.id}` : '/api/ofertas';

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      if (response.ok) {
        toast({
          title: 'Éxito',
          description: tarifaEditando ? 'Tarifa actualizada' : 'Tarifa creada'
        });
        setMostrandoEditor(false);
        cargarDatos();
      } else {
        const error = await response.json();
        throw new Error(error.message);
      }
    } catch (error) {
      console.error('Error guardando tarifa:', error);
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Error desconocido',
        variant: 'destructive'
      });
    }
  };

  const eliminarTarifa = async (id: string) => {
    if (!confirm('¿Estás seguro de que quieres eliminar esta tarifa?')) return;

    try {
      const response = await fetch(`/api/ofertas/${id}`, {
        method: 'DELETE'
      });

      if (response.ok) {
        toast({
          title: 'Éxito',
          description: 'Tarifa eliminada'
        });
        cargarDatos();
      } else {
        const error = await response.json();
        throw new Error(error.message);
      }
    } catch (error) {
      console.error('Error eliminando tarifa:', error);
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
        <p className="text-sm text-gray-600">Gestión de Tarifas</p>
      </div>

      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
            <Zap className="h-8 w-8 text-primary" />
            Administración de Tarifas
          </h1>
          <p className="text-gray-600 mt-2">
            Gestiona las tarifas eléctricas, sube archivos Excel o añade manualmente
          </p>
        </div>
        
        <div className="flex items-center gap-3">
          <Button onClick={() => abrirEditor()} className="flex items-center gap-2">
            <Plus className="h-4 w-4" />
            Nueva Tarifa
          </Button>
        </div>
      </div>

      {/* Panel de Importación */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Upload className="h-5 w-5" />
            Importación Inteligente
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <Label htmlFor="excel-upload" className="text-sm font-medium mb-2 block">
                Subir Excel de Tarifas
              </Label>
              <div className="flex items-center gap-3">
                <Input
                  id="excel-upload"
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
            
            <div className="bg-blue-50 p-4 rounded-lg">
              <h4 className="font-semibold text-blue-900 mb-2 flex items-center gap-2">
                <FileSpreadsheet className="h-4 w-4" />
                Funcionalidad IA
              </h4>
              <ul className="text-sm text-blue-800 space-y-1">
                <li>• Detección automática de columnas en Excel y OCR para PDF</li>
                <li>• Mapeo inteligente con patrones avanzados</li>
                <li>• Validación automática de precios y formatos</li>
                <li>• Actualización inteligente de tarifas existentes</li>
                <li>• Reconocimiento de nombres de comercializadoras</li>
                <li>• Interpretación de múltiples formatos de datos</li>
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
                  placeholder="Buscar..."
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
              <Label className="text-sm font-medium">Oferta</Label>
              <Select value={filtroOferta} onValueChange={setFiltroOferta}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todas">Todas</SelectItem>
                  {ofertasUnicas.map(oferta => (
                    <SelectItem key={oferta} value={oferta}>{oferta}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Label className="text-sm font-medium">Tipo de Tarifa</Label>
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
                <p className="text-sm font-medium text-gray-600">Total Tarifas</p>
                <p className="text-2xl font-bold">{tarifas.length}</p>
              </div>
              <FileSpreadsheet className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Filtradas</p>
                <p className="text-2xl font-bold">{tarifasFiltradas.length}</p>
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
                <p className="text-2xl font-bold">{comercializadoras.length}</p>
              </div>
              <Building className="h-8 w-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Con Fee</p>
                <p className="text-2xl font-bold">{tarifas.filter(t => t.tieneFee).length}</p>
              </div>
              <Zap className="h-8 w-8 text-orange-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabla de Tarifas */}
      <Card>
        <CardHeader>
          <CardTitle>Tarifas ({tarifasFiltradas.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full border-collapse border border-gray-200">
              <thead>
                <tr className="bg-gray-50">
                  <th className="border border-gray-200 px-4 py-2 text-left">Comercializadora</th>
                  <th className="border border-gray-200 px-4 py-2 text-left">Oferta</th>
                  <th className="border border-gray-200 px-4 py-2 text-left">Tarifa</th>
                  <th className="border border-gray-200 px-4 py-2 text-left">Tipo</th>
                  <th className="border border-gray-200 px-4 py-2 text-left">Energía P1</th>
                  <th className="border border-gray-200 px-4 py-2 text-left">Potencia P1</th>
                  <th className="border border-gray-200 px-4 py-2 text-left">Fee</th>
                  <th className="border border-gray-200 px-4 py-2 text-left">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {tarifasFiltradas.map((tarifa: any) => (
                  <tr key={tarifa.id} className="hover:bg-gray-50">
                    <td className="border border-gray-200 px-4 py-2">
                      <div className="flex items-center gap-2">
                        {tarifa.comercializadoras?.logoUrl && (
                          <img 
                            src={tarifa.comercializadoras.logoUrl} 
                            alt={tarifa.comercializadoras.nombre}
                            className="h-6 w-6 object-contain"
                          />
                        )}
                        <span className="font-medium">{tarifa.comercializadoras?.nombre}</span>
                      </div>
                    </td>
                    <td className="border border-gray-200 px-4 py-2">{tarifa.nombreOferta}</td>
                    <td className="border border-gray-200 px-4 py-2">
                      <Badge variant="outline">{tarifa.tarifa}</Badge>
                    </td>
                    <td className="border border-gray-200 px-4 py-2">{tarifa.tipoOferta}</td>
                    <td className="border border-gray-200 px-4 py-2">
                      {tarifa.energiaP1?.toFixed(6)} €/kWh
                    </td>
                    <td className="border border-gray-200 px-4 py-2">
                      {tarifa.potenciaP1?.toFixed(6)} €/kW
                    </td>
                    <td className="border border-gray-200 px-4 py-2">
                      {tarifa.tieneFee ? (
                        <Badge variant="secondary">Sí</Badge>
                      ) : (
                        <Badge variant="outline">No</Badge>
                      )}
                    </td>
                    <td className="border border-gray-200 px-4 py-2">
                      <div className="flex items-center gap-2">
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => abrirEditor(tarifa)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => eliminarTarifa(tarifa.id)}
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
                  {tarifaEditando ? 'Editar Tarifa' : 'Nueva Tarifa'}
                </h2>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setMostrandoEditor(false)}
                >
                  ×
                </Button>
              </div>

              {/* Información General */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
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
                  <Label htmlFor="nombreOferta">Nombre de la Oferta</Label>
                  <Input
                    id="nombreOferta"
                    value={formData.nombreOferta}
                    onChange={(e) => setFormData(prev => ({...prev, nombreOferta: e.target.value}))}
                    placeholder="Ej: Tarifa Verde 2024"
                  />
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
                  <Label htmlFor="tipoOferta">Tipo de Oferta</Label>
                  <Select value={formData.tipoOferta} onValueChange={(value) => 
                    setFormData(prev => ({...prev, tipoOferta: value}))
                  }>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Fijo">Fijo</SelectItem>
                      <SelectItem value="Indexado">Indexado</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="zona">Zona</Label>
                  <Input
                    id="zona"
                    value={formData.zona}
                    onChange={(e) => setFormData(prev => ({...prev, zona: e.target.value}))}
                    placeholder="Peninsula"
                  />
                </div>

                <div>
                  <Label htmlFor="costeGestion">Coste Gestión (€/mes)</Label>
                  <Input
                    id="costeGestion"
                    type="number"
                    step="0.01"
                    value={formData.costeGestion}
                    onChange={(e) => setFormData(prev => ({...prev, costeGestion: parseFloat(e.target.value) || 0}))}
                  />
                </div>
              </div>

              {/* Precios de Energía */}
              <div className="mb-6">
                <h3 className="text-lg font-semibold mb-4 text-orange-600">⚡ Precios de Energía (€/kWh)</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <Label htmlFor="energiaP1">P1 (Punta)</Label>
                    <Input
                      id="energiaP1"
                      type="number"
                      step="0.000001"
                      value={formData.energiaP1}
                      onChange={(e) => setFormData(prev => ({...prev, energiaP1: parseFloat(e.target.value) || 0}))}
                      placeholder="0.000000"
                    />
                  </div>
                  <div>
                    <Label htmlFor="energiaP2">P2 (Llano)</Label>
                    <Input
                      id="energiaP2"
                      type="number"
                      step="0.000001"
                      value={formData.energiaP2}
                      onChange={(e) => setFormData(prev => ({...prev, energiaP2: parseFloat(e.target.value) || 0}))}
                      placeholder="0.000000"
                    />
                  </div>
                  <div>
                    <Label htmlFor="energiaP3">P3 (Valle)</Label>
                    <Input
                      id="energiaP3"
                      type="number"
                      step="0.000001"
                      value={formData.energiaP3}
                      onChange={(e) => setFormData(prev => ({...prev, energiaP3: parseFloat(e.target.value) || 0}))}
                      placeholder="0.000000"
                    />
                  </div>
                  <div>
                    <Label htmlFor="energiaP4">P4</Label>
                    <Input
                      id="energiaP4"
                      type="number"
                      step="0.000001"
                      value={formData.energiaP4}
                      onChange={(e) => setFormData(prev => ({...prev, energiaP4: parseFloat(e.target.value) || 0}))}
                      placeholder="0.000000"
                    />
                  </div>
                  <div>
                    <Label htmlFor="energiaP5">P5</Label>
                    <Input
                      id="energiaP5"
                      type="number"
                      step="0.000001"
                      value={formData.energiaP5}
                      onChange={(e) => setFormData(prev => ({...prev, energiaP5: parseFloat(e.target.value) || 0}))}
                      placeholder="0.000000"
                    />
                  </div>
                  <div>
                    <Label htmlFor="energiaP6">P6</Label>
                    <Input
                      id="energiaP6"
                      type="number"
                      step="0.000001"
                      value={formData.energiaP6}
                      onChange={(e) => setFormData(prev => ({...prev, energiaP6: parseFloat(e.target.value) || 0}))}
                      placeholder="0.000000"
                    />
                  </div>
                </div>
              </div>

              {/* Precios de Potencia */}
              <div className="mb-6">
                <h3 className="text-lg font-semibold mb-4 text-purple-600">🔌 Precios de Potencia (€/kW·día)</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <Label htmlFor="potenciaP1">P1 (Punta)</Label>
                    <Input
                      id="potenciaP1"
                      type="number"
                      step="0.000001"
                      value={formData.potenciaP1}
                      onChange={(e) => setFormData(prev => ({...prev, potenciaP1: parseFloat(e.target.value) || 0}))}
                      placeholder="0.000000"
                    />
                  </div>
                  <div>
                    <Label htmlFor="potenciaP2">P2 (Llano)</Label>
                    <Input
                      id="potenciaP2"
                      type="number"
                      step="0.000001"
                      value={formData.potenciaP2}
                      onChange={(e) => setFormData(prev => ({...prev, potenciaP2: parseFloat(e.target.value) || 0}))}
                      placeholder="0.000000"
                    />
                  </div>
                  <div>
                    <Label htmlFor="potenciaP3">P3 (Valle)</Label>
                    <Input
                      id="potenciaP3"
                      type="number"
                      step="0.000001"
                      value={formData.potenciaP3}
                      onChange={(e) => setFormData(prev => ({...prev, potenciaP3: parseFloat(e.target.value) || 0}))}
                      placeholder="0.000000"
                    />
                  </div>
                  <div>
                    <Label htmlFor="potenciaP4">P4</Label>
                    <Input
                      id="potenciaP4"
                      type="number"
                      step="0.000001"
                      value={formData.potenciaP4}
                      onChange={(e) => setFormData(prev => ({...prev, potenciaP4: parseFloat(e.target.value) || 0}))}
                      placeholder="0.000000"
                    />
                  </div>
                  <div>
                    <Label htmlFor="potenciaP5">P5</Label>
                    <Input
                      id="potenciaP5"
                      type="number"
                      step="0.000001"
                      value={formData.potenciaP5}
                      onChange={(e) => setFormData(prev => ({...prev, potenciaP5: parseFloat(e.target.value) || 0}))}
                      placeholder="0.000000"
                    />
                  </div>
                  <div>
                    <Label htmlFor="potenciaP6">P6</Label>
                    <Input
                      id="potenciaP6"
                      type="number"
                      step="0.000001"
                      value={formData.potenciaP6}
                      onChange={(e) => setFormData(prev => ({...prev, potenciaP6: parseFloat(e.target.value) || 0}))}
                      placeholder="0.000000"
                    />
                  </div>
                </div>
              </div>

              <div className="text-sm text-gray-600 bg-blue-50 p-3 rounded-lg">
                <p className="font-semibold mb-2">📝 Notas importantes:</p>
                <ul className="space-y-1">
                  <li>• Los precios de energía se introducen en €/kWh (6 decimales)</li>
                  <li>• Los precios de potencia se introducen en €/kW·día (6 decimales)</li>
                  <li>• Las comisiones se gestionan por separado en el módulo de comisiones</li>
                  <li>• Para tarifas 2.0TD usar principalmente P1, P2, P3</li>
                  <li>• Para tarifas 3.0TD y 6.1TD usar todos los periodos según corresponda</li>
                </ul>
              </div>

              <div className="flex justify-end space-x-3 mt-6">
                <Button
                  variant="outline"
                  onClick={() => setMostrandoEditor(false)}
                >
                  Cancelar
                </Button>
                <Button onClick={guardarTarifa}>
                  {tarifaEditando ? 'Actualizar' : 'Crear'} Tarifa
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
