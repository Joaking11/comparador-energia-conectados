
'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useToast } from '@/hooks/use-toast';
import { 
  Globe, 
  Play, 
  RefreshCw, 
  CheckCircle, 
  AlertCircle, 
  Clock, 
  Zap,
  Activity
} from 'lucide-react';

interface ScrapingWidgetProps {
  onDataObtained?: (data: ConsumptionData) => void;
  cups?: string;
  distribuidora?: string;
  disabled?: boolean;
}

interface ConsumptionData {
  cups: string;
  distribuidora: string;
  consumoTotal: number;
  consumoP1?: number;
  consumoP2?: number;
  consumoP3?: number;
  potenciaMaxima?: number;
  periodo_analizado?: string;
}

interface Credencial {
  id: string;
  distribuidora: string;
  usuario: string;
  activa: boolean;
  ultima_conexion: string | null;
}

interface DistribuidoraInfo {
  codigo: string;
  nombre: string;
  url_portal: string;
  soportada: boolean;
}

export function ScrapingWidget({ 
  onDataObtained, 
  cups: initialCups = '', 
  distribuidora: initialDistribuidora = '',
  disabled = false 
}: ScrapingWidgetProps) {
  const [cups, setCups] = useState(initialCups);
  const [selectedDistribuidora, setSelectedDistribuidora] = useState(initialDistribuidora);
  const [credenciales, setCredenciales] = useState<Credencial[]>([]);
  const [distribuidoras, setDistribuidoras] = useState<DistribuidoraInfo[]>([]);
  const [scrapingStatus, setScrapingStatus] = useState<'idle' | 'running' | 'success' | 'error'>('idle');
  const [scrapingId, setScrapingId] = useState<string | null>(null);
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const { toast } = useToast();

  useEffect(() => {
    loadInitialData();
  }, []);

  useEffect(() => {
    setCups(initialCups);
  }, [initialCups]);

  useEffect(() => {
    setSelectedDistribuidora(initialDistribuidora);
  }, [initialDistribuidora]);

  const loadInitialData = async () => {
    try {
      // Cargar credenciales disponibles
      const credRes = await fetch('/api/scraping/credenciales');
      if (credRes.ok) {
        const credData = await credRes.json();
        setCredenciales(credData);
      }

      // Cargar distribuidoras soportadas
      const distRes = await fetch('/api/scraping/distribuidoras');
      if (distRes.ok) {
        const distData = await distRes.json();
        setDistribuidoras(distData);
      }

    } catch (error) {
      console.error('Error cargando datos iniciales:', error);
    }
  };

  const executeReautomatic = async () => {
    if (!cups.trim()) {
      toast({
        title: 'Error',
        description: 'El CUPS es requerido',
        variant: 'destructive'
      });
      return;
    }

    if (!selectedDistribuidora) {
      toast({
        title: 'Error',
        description: 'Selecciona una distribuidora',
        variant: 'destructive'
      });
      return;
    }

    // Verificar si hay credenciales para la distribuidora
    const credencial = credenciales.find(c => 
      c.distribuidora === selectedDistribuidora && c.activa
    );

    if (!credencial) {
      toast({
        title: 'Sin credenciales',
        description: `No hay credenciales configuradas para ${selectedDistribuidora}. Ve a Administración > Scraping para configurarlas.`,
        variant: 'destructive'
      });
      return;
    }

    setLoading(true);
    setScrapingStatus('running');
    setResult(null);

    try {
      const response = await fetch('/api/scraping/ejecutar', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          cups: cups.trim(),
          distribuidora: selectedDistribuidora
        })
      });

      const data = await response.json();

      if (response.ok && data.success) {
        setScrapingId(data.scrapingId);
        toast({
          title: 'Scraping iniciado',
          description: 'Obteniendo datos automáticamente...',
        });

        // Polling para verificar el resultado
        setTimeout(() => checkScrapingResult(data.scrapingId), 3000);
      } else {
        throw new Error(data.error || 'Error ejecutando scraping');
      }

    } catch (error) {
      setScrapingStatus('error');
      setResult({ error: error instanceof Error ? error.message : 'Error desconocido' });
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Error ejecutando scraping',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const checkScrapingResult = async (id: string) => {
    try {
      const response = await fetch(`/api/scraping/ejecutar?id=${id}`);
      const results = await response.json();

      if (results.length > 0) {
        const result = results[0];
        setResult(result);

        if (result.estado_scraping === 'exitoso') {
          setScrapingStatus('success');
          
          // Preparar datos para el callback
          const consumptionData: ConsumptionData = {
            cups: result.cups,
            distribuidora: result.distribuidora,
            consumoTotal: result.consumoTotal,
            consumoP1: result.consumoP1,
            consumoP2: result.consumoP2,
            consumoP3: result.consumoP3,
            potenciaMaxima: result.potenciaMaxima,
            periodo_analizado: result.periodo_analizado
          };

          // Llamar al callback si está disponible
          if (onDataObtained) {
            onDataObtained(consumptionData);
          }

          toast({
            title: 'Datos obtenidos',
            description: 'Los datos de consumo se obtuvieron exitosamente y se han aplicado al formulario',
          });

        } else if (result.estado_scraping === 'error') {
          setScrapingStatus('error');
          toast({
            title: 'Error en scraping',
            description: result.mensaje_error || 'Error obteniendo datos',
            variant: 'destructive'
          });
        } else {
          // Todavía en progreso, continuar polling
          setTimeout(() => checkScrapingResult(id), 3000);
        }
      }
    } catch (error) {
      console.error('Error verificando resultado:', error);
      setScrapingStatus('error');
    }
  };

  const getStatusIcon = () => {
    switch (scrapingStatus) {
      case 'running':
        return <RefreshCw className="w-4 h-4 animate-spin text-blue-500" />;
      case 'success':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'error':
        return <AlertCircle className="w-4 h-4 text-red-500" />;
      default:
        return <Activity className="w-4 h-4 text-gray-400" />;
    }
  };

  const getStatusText = () => {
    switch (scrapingStatus) {
      case 'running':
        return 'Obteniendo datos...';
      case 'success':
        return 'Datos obtenidos exitosamente';
      case 'error':
        return 'Error obteniendo datos';
      default:
        return 'Listo para obtener datos';
    }
  };

  // Verificar si hay credenciales para la distribuidora seleccionada
  const credencialDisponible = selectedDistribuidora ? 
    credenciales.some(c => c.distribuidora === selectedDistribuidora && c.activa) : false;

  return (
    <Card className="border-2 border-blue-200">
      <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50">
        <CardTitle className="flex items-center gap-2 text-blue-900">
          <Globe className="w-5 h-5" />
          Obtención Automática de Datos
        </CardTitle>
        <CardDescription className="text-blue-700">
          Obtén datos de consumo y potencia directamente desde el portal de la distribuidora
        </CardDescription>
      </CardHeader>

      <CardContent className="p-6 space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="scraping-cups">CUPS</Label>
            <Input
              id="scraping-cups"
              value={cups}
              onChange={(e) => setCups(e.target.value)}
              placeholder="ES0000000000000000AB"
              disabled={disabled || scrapingStatus === 'running'}
            />
          </div>

          <div>
            <Label htmlFor="scraping-distribuidora">Distribuidora</Label>
            <Select 
              value={selectedDistribuidora} 
              onValueChange={setSelectedDistribuidora}
              disabled={disabled || scrapingStatus === 'running'}
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecciona distribuidora" />
              </SelectTrigger>
              <SelectContent>
                {distribuidoras.map(dist => (
                  <SelectItem key={dist.codigo} value={dist.codigo}>
                    {dist.nombre}
                    {!credenciales.some(c => c.distribuidora === dist.codigo && c.activa) && (
                      <Badge variant="outline" className="ml-2 text-xs">
                        Sin credenciales
                      </Badge>
                    )}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Estado del scraping */}
        <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg">
          {getStatusIcon()}
          <span className="text-sm font-medium">{getStatusText()}</span>
        </div>

        {/* Alertas */}
        {selectedDistribuidora && !credencialDisponible && (
          <Alert>
            <AlertCircle className="w-4 h-4" />
            <AlertDescription>
              No hay credenciales configuradas para {selectedDistribuidora}. 
              <a 
                href="/admin/scraping" 
                target="_blank" 
                className="underline text-blue-600 hover:text-blue-800 ml-1"
              >
                Configurar credenciales
              </a>
            </AlertDescription>
          </Alert>
        )}

        {/* Resultado exitoso */}
        {scrapingStatus === 'success' && result && (
          <Alert className="border-green-200 bg-green-50">
            <CheckCircle className="w-4 h-4 text-green-600" />
            <AlertDescription className="text-green-800">
              <div className="space-y-1">
                <p><strong>Datos obtenidos para CUPS:</strong> {result.cups}</p>
                <p><strong>Consumo total:</strong> {result.consumoTotal?.toLocaleString()} kWh</p>
                {result.potenciaMaxima && (
                  <p><strong>Potencia máxima:</strong> {result.potenciaMaxima.toFixed(2)} kW</p>
                )}
                <p><strong>Período:</strong> {result.periodo_analizado || 'No especificado'}</p>
              </div>
            </AlertDescription>
          </Alert>
        )}

        {/* Error */}
        {scrapingStatus === 'error' && result && (
          <Alert variant="destructive">
            <AlertCircle className="w-4 h-4" />
            <AlertDescription>
              {result.mensaje_error || result.error || 'Error desconocido obteniendo datos'}
            </AlertDescription>
          </Alert>
        )}

        {/* Botón principal */}
        <Button 
          onClick={executeReautomatic}
          disabled={disabled || loading || !cups.trim() || !selectedDistribuidora || !credencialDisponible}
          className="w-full"
          size="lg"
        >
          {loading ? (
            <>
              <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
              Obteniendo datos...
            </>
          ) : (
            <>
              <Play className="w-4 h-4 mr-2" />
              Obtener Datos Automáticamente
            </>
          )}
        </Button>

        {/* Información adicional */}
        <div className="text-xs text-gray-600 space-y-1">
          <p>• Los datos se obtienen directamente desde el portal de la distribuidora</p>
          <p>• Se incluyen consumos por períodos (P1-P6) y potencias contratadas</p>
          <p>• El proceso puede tardar 30-60 segundos en completarse</p>
        </div>
      </CardContent>
    </Card>
  );
}
