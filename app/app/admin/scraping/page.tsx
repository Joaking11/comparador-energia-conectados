
'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { 
  Globe, 
  Key, 
  Plus, 
  Trash2, 
  Eye, 
  EyeOff, 
  Settings, 
  Activity,
  Download,
  AlertCircle,
  CheckCircle,
  Clock
} from 'lucide-react';

interface Credencial {
  id: string;
  distribuidora: string;
  usuario: string;
  url_portal: string;
  activa: boolean;
  ultima_conexion: string | null;
  createdAt: string;
}

interface DistribuidoraInfo {
  codigo: string;
  nombre: string;
  url_portal: string;
  descripcion: string;
  soportada: boolean;
}

interface DatosConsumo {
  id: string;
  cups: string;
  distribuidora: string;
  consumoTotal: number;
  potenciaMaxima: number | null;
  estado_scraping: string;
  fecha_obtencion: string;
  periodo_analizado: string | null;
}

export default function ScrapingAdminPage() {
  const [credenciales, setCredenciales] = useState<Credencial[]>([]);
  const [distribuidoras, setDistribuidoras] = useState<DistribuidoraInfo[]>([]);
  const [datosRecientes, setDatosRecientes] = useState<DatosConsumo[]>([]);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'credenciales' | 'datos' | 'test'>('credenciales');
  
  // Estados para nueva credencial
  const [showForm, setShowForm] = useState(false);
  const [newCredencial, setNewCredencial] = useState({
    distribuidora: '',
    usuario: '',
    password: '',
    url_portal: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  
  // Estados para test de scraping
  const [testCups, setTestCups] = useState('');
  const [testDistribuidora, setTestDistribuidora] = useState('');
  const [testResult, setTestResult] = useState<any>(null);
  const [testing, setTesting] = useState(false);

  const { toast } = useToast();

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      // Cargar credenciales
      const credRes = await fetch('/api/scraping/credenciales');
      const credData = await credRes.json();
      setCredenciales(credData);

      // Cargar distribuidoras soportadas
      const distRes = await fetch('/api/scraping/distribuidoras');
      const distData = await distRes.json();
      setDistribuidoras(distData);

      // Cargar datos recientes
      const datosRes = await fetch('/api/scraping/datos?limit=5');
      const datosData = await datosRes.json();
      setDatosRecientes(datosData);

    } catch (error) {
      console.error('Error cargando datos:', error);
      toast({
        title: 'Error',
        description: 'Error cargando datos del scraping',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSaveCredencial = async () => {
    if (!newCredencial.distribuidora || !newCredencial.usuario || !newCredencial.password) {
      toast({
        title: 'Error',
        description: 'Todos los campos son requeridos',
        variant: 'destructive'
      });
      return;
    }

    try {
      const response = await fetch('/api/scraping/credenciales', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newCredencial)
      });

      const result = await response.json();

      if (response.ok) {
        toast({
          title: 'Éxito',
          description: result.message,
        });
        
        setNewCredencial({
          distribuidora: '',
          usuario: '',
          password: '',
          url_portal: ''
        });
        setShowForm(false);
        loadData();
      } else {
        throw new Error(result.error);
      }

    } catch (error) {
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Error guardando credencial',
        variant: 'destructive'
      });
    }
  };

  const handleDeleteCredencial = async (id: string) => {
    if (!confirm('¿Estás seguro de eliminar esta credencial?')) return;

    try {
      const response = await fetch(`/api/scraping/credenciales?id=${id}`, {
        method: 'DELETE'
      });

      if (response.ok) {
        toast({
          title: 'Éxito',
          description: 'Credencial eliminada exitosamente',
        });
        loadData();
      } else {
        throw new Error('Error eliminando credencial');
      }

    } catch (error) {
      toast({
        title: 'Error',
        description: 'Error eliminando credencial',
        variant: 'destructive'
      });
    }
  };

  const handleTestScraping = async () => {
    if (!testCups || !testDistribuidora) {
      toast({
        title: 'Error',
        description: 'CUPS y distribuidora son requeridos',
        variant: 'destructive'
      });
      return;
    }

    setTesting(true);
    setTestResult(null);

    try {
      const response = await fetch('/api/scraping/ejecutar', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          cups: testCups,
          distribuidora: testDistribuidora
        })
      });

      const result = await response.json();
      setTestResult(result);

      if (result.success) {
        toast({
          title: 'Scraping iniciado',
          description: 'El scraping se está ejecutando en background',
        });
        
        // Polling para verificar resultado
        setTimeout(() => checkScrapingResult(result.scrapingId), 5000);
      } else {
        throw new Error(result.error);
      }

    } catch (error) {
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Error ejecutando scraping',
        variant: 'destructive'
      });
      setTestResult({ success: false, error: error instanceof Error ? error.message : 'Error desconocido' });
    } finally {
      setTesting(false);
    }
  };

  const checkScrapingResult = async (scrapingId: string) => {
    try {
      const response = await fetch(`/api/scraping/ejecutar?id=${scrapingId}`);
      const results = await response.json();
      
      if (results.length > 0) {
        const result = results[0];
        setTestResult(result);
        
        if (result.estado_scraping === 'exitoso') {
          toast({
            title: 'Scraping completado',
            description: 'Los datos se obtuvieron exitosamente',
          });
          loadData(); // Recargar datos recientes
        } else if (result.estado_scraping === 'error') {
          toast({
            title: 'Error en scraping',
            description: result.mensaje_error,
            variant: 'destructive'
          });
        }
      }
    } catch (error) {
      console.error('Error verificando resultado:', error);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('es-ES');
  };

  const getStatusBadge = (estado: string) => {
    const variants = {
      'exitoso': 'default',
      'error': 'destructive',
      'pendiente': 'secondary'
    } as const;
    
    const icons = {
      'exitoso': CheckCircle,
      'error': AlertCircle,
      'pendiente': Clock
    };
    
    const Icon = icons[estado as keyof typeof icons] || Clock;
    
    return (
      <Badge variant={variants[estado as keyof typeof variants] || 'secondary'}>
        <Icon className="w-3 h-3 mr-1" />
        {estado.charAt(0).toUpperCase() + estado.slice(1)}
      </Badge>
    );
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Gestión de Scraping</h1>
        <p className="text-gray-600 mt-2">
          Configure credenciales y obtenga datos de consumo automáticamente
        </p>
      </div>

      {/* Tabs */}
      <div className="flex space-x-4 border-b">
        <button
          onClick={() => setActiveTab('credenciales')}
          className={`pb-2 px-4 ${activeTab === 'credenciales' ? 'border-b-2 border-primary text-primary' : 'text-gray-500'}`}
        >
          <Key className="w-4 h-4 mr-2 inline" />
          Credenciales
        </button>
        <button
          onClick={() => setActiveTab('datos')}
          className={`pb-2 px-4 ${activeTab === 'datos' ? 'border-b-2 border-primary text-primary' : 'text-gray-500'}`}
        >
          <Download className="w-4 h-4 mr-2 inline" />
          Datos Obtenidos
        </button>
        <button
          onClick={() => setActiveTab('test')}
          className={`pb-2 px-4 ${activeTab === 'test' ? 'border-b-2 border-primary text-primary' : 'text-gray-500'}`}
        >
          <Activity className="w-4 h-4 mr-2 inline" />
          Probar Scraping
        </button>
      </div>

      {/* Tab: Credenciales */}
      {activeTab === 'credenciales' && (
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold">Credenciales de Distribuidoras</h2>
            <Button onClick={() => setShowForm(!showForm)}>
              <Plus className="w-4 h-4 mr-2" />
              Nueva Credencial
            </Button>
          </div>

          {/* Formulario nueva credencial */}
          {showForm && (
            <Card>
              <CardHeader>
                <CardTitle>Nueva Credencial</CardTitle>
                <CardDescription>
                  Configure las credenciales para acceder al portal de la distribuidora
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Distribuidora</Label>
                    <Select 
                      value={newCredencial.distribuidora} 
                      onValueChange={(value) => {
                        setNewCredencial({ ...newCredencial, distribuidora: value });
                        const info = distribuidoras.find(d => d.codigo === value);
                        if (info) {
                          setNewCredencial(prev => ({ ...prev, url_portal: info.url_portal }));
                        }
                      }}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Selecciona distribuidora" />
                      </SelectTrigger>
                      <SelectContent>
                        {distribuidoras.map(dist => (
                          <SelectItem key={dist.codigo} value={dist.codigo}>
                            {dist.nombre}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div>
                    <Label>Usuario/Email</Label>
                    <Input
                      value={newCredencial.usuario}
                      onChange={(e) => setNewCredencial({ ...newCredencial, usuario: e.target.value })}
                      placeholder="usuario@email.com"
                    />
                  </div>
                </div>

                <div>
                  <Label>Contraseña</Label>
                  <div className="relative">
                    <Input
                      type={showPassword ? 'text' : 'password'}
                      value={newCredencial.password}
                      onChange={(e) => setNewCredencial({ ...newCredencial, password: e.target.value })}
                      placeholder="••••••••"
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-0 top-0 h-full px-3"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </Button>
                  </div>
                </div>

                <div>
                  <Label>URL del Portal</Label>
                  <Input
                    value={newCredencial.url_portal}
                    onChange={(e) => setNewCredencial({ ...newCredencial, url_portal: e.target.value })}
                    placeholder="https://..."
                  />
                </div>

                <div className="flex gap-2">
                  <Button onClick={handleSaveCredencial}>
                    Guardar Credencial
                  </Button>
                  <Button variant="outline" onClick={() => setShowForm(false)}>
                    Cancelar
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Lista de credenciales */}
          <div className="grid gap-4">
            {credenciales.map(cred => (
              <Card key={cred.id}>
                <CardContent className="p-4">
                  <div className="flex justify-between items-center">
                    <div>
                      <div className="flex items-center gap-2">
                        <Globe className="w-4 h-4" />
                        <span className="font-medium">{cred.distribuidora}</span>
                        <Badge variant={cred.activa ? 'default' : 'secondary'}>
                          {cred.activa ? 'Activa' : 'Inactiva'}
                        </Badge>
                      </div>
                      <p className="text-sm text-gray-600">
                        Usuario: {cred.usuario}
                      </p>
                      <p className="text-xs text-gray-500">
                        Última conexión: {cred.ultima_conexion ? formatDate(cred.ultima_conexion) : 'Nunca'}
                      </p>
                    </div>
                    
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => window.open(cred.url_portal, '_blank')}
                      >
                        <Globe className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => handleDeleteCredencial(cred.id)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {credenciales.length === 0 && !loading && (
            <Card>
              <CardContent className="text-center py-8">
                <Key className="w-16 h-16 mx-auto text-gray-300 mb-4" />
                <h3 className="text-lg font-medium mb-2">No hay credenciales configuradas</h3>
                <p className="text-gray-600 mb-4">
                  Añade credenciales para comenzar a obtener datos automáticamente
                </p>
                <Button onClick={() => setShowForm(true)}>
                  <Plus className="w-4 h-4 mr-2" />
                  Añadir Primera Credencial
                </Button>
              </CardContent>
            </Card>
          )}
        </div>
      )}

      {/* Tab: Datos */}
      {activeTab === 'datos' && (
        <div className="space-y-6">
          <h2 className="text-xl font-semibold">Datos Obtenidos Recientemente</h2>
          
          <div className="grid gap-4">
            {datosRecientes.map(dato => (
              <Card key={dato.id}>
                <CardContent className="p-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <div className="flex items-center gap-2 mb-2">
                        <span className="font-medium">{dato.distribuidora}</span>
                        {getStatusBadge(dato.estado_scraping)}
                      </div>
                      <p className="text-sm text-gray-600">
                        CUPS: {dato.cups}
                      </p>
                      <p className="text-sm text-gray-600">
                        Consumo total: {dato.consumoTotal.toLocaleString()} kWh
                      </p>
                      {dato.potenciaMaxima && (
                        <p className="text-sm text-gray-600">
                          Potencia máxima: {dato.potenciaMaxima.toFixed(2)} kW
                        </p>
                      )}
                      <p className="text-xs text-gray-500">
                        Período: {dato.periodo_analizado || 'No especificado'}
                      </p>
                    </div>
                    
                    <div className="text-right">
                      <p className="text-xs text-gray-500">
                        {formatDate(dato.fecha_obtencion)}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {datosRecientes.length === 0 && !loading && (
            <Card>
              <CardContent className="text-center py-8">
                <Download className="w-16 h-16 mx-auto text-gray-300 mb-4" />
                <h3 className="text-lg font-medium mb-2">No hay datos obtenidos</h3>
                <p className="text-gray-600">
                  Los datos obtenidos mediante scraping aparecerán aquí
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      )}

      {/* Tab: Test */}
      {activeTab === 'test' && (
        <div className="space-y-6">
          <h2 className="text-xl font-semibold">Probar Scraping</h2>
          
          <Card>
            <CardHeader>
              <CardTitle>Test de Obtención de Datos</CardTitle>
              <CardDescription>
                Prueba la extracción de datos para un CUPS específico
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>CUPS</Label>
                  <Input
                    value={testCups}
                    onChange={(e) => setTestCups(e.target.value)}
                    placeholder="ES0000000000000000AB"
                  />
                </div>
                
                <div>
                  <Label>Distribuidora</Label>
                  <Select value={testDistribuidora} onValueChange={setTestDistribuidora}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecciona distribuidora" />
                    </SelectTrigger>
                    <SelectContent>
                      {distribuidoras.map(dist => (
                        <SelectItem key={dist.codigo} value={dist.codigo}>
                          {dist.nombre}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <Button onClick={handleTestScraping} disabled={testing}>
                {testing ? (
                  <>
                    <Clock className="w-4 h-4 mr-2 animate-spin" />
                    Ejecutando...
                  </>
                ) : (
                  <>
                    <Activity className="w-4 h-4 mr-2" />
                    Ejecutar Test
                  </>
                )}
              </Button>

              {testResult && (
                <Card className="mt-4">
                  <CardHeader>
                    <CardTitle className="text-sm">Resultado del Test</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <pre className="bg-gray-100 p-4 rounded text-xs overflow-auto">
                      {JSON.stringify(testResult, null, 2)}
                    </pre>
                  </CardContent>
                </Card>
              )}
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
