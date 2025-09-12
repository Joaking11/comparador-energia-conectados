
'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export default function ScrapingDebugPage() {
  const [cups, setCups] = useState('ES0021000000000001JN0F');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [scrapingId, setScrapingId] = useState('');

  const ejecutarScraping = async () => {
    setLoading(true);
    setResult(null);
    
    try {
      const response = await fetch('/api/scraping/ejecutar', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          distribuidora: 'LOGOS_ENERGIA',
          cups: cups
        })
      });
      
      const data = await response.json();
      
      if (data.success) {
        setScrapingId(data.scrapingId);
        setResult({ type: 'iniciado', data });
        
        // Monitorear el progreso
        setTimeout(() => checkProgress(data.scrapingId), 5000);
      } else {
        setResult({ type: 'error', data });
      }
      
    } catch (error) {
      setResult({ type: 'error', data: { error: error.message } });
    } finally {
      setLoading(false);
    }
  };

  const checkProgress = async (id: string) => {
    try {
      const response = await fetch(`/api/scraping/ejecutar?id=${id}`);
      const data = await response.json();
      
      setResult({ type: 'progreso', data });
      
      // Si aún está pendiente, volver a verificar en 3 segundos
      if (data[0]?.estado_scraping === 'pendiente') {
        setTimeout(() => checkProgress(id), 3000);
      }
      
    } catch (error) {
      console.error('Error verificando progreso:', error);
    }
  };

  const limpiarResultados = () => {
    setResult(null);
    setScrapingId('');
  };

  return (
    <div className="container mx-auto py-10">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Debug Scraping - Logos Energía</h1>
        <p className="text-gray-600 mt-2">
          Panel de pruebas para debuggear el scraper de Logos Energía
        </p>
      </div>

      <div className="grid gap-6">
        {/* Panel de control */}
        <Card>
          <CardHeader>
            <CardTitle>🧪 Test de Scraping</CardTitle>
            <CardDescription>
              Configurar y ejecutar scraping en Logos Energía
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">CUPS:</label>
              <Input
                value={cups}
                onChange={(e) => setCups(e.target.value)}
                placeholder="Introduce el CUPS a consultar"
                className="max-w-md"
              />
            </div>
            
            <div className="flex gap-3">
              <Button 
                onClick={ejecutarScraping} 
                disabled={loading || !cups}
                className="bg-blue-600 hover:bg-blue-700"
              >
                {loading ? '⏳ Ejecutando...' : '🚀 Ejecutar Scraping'}
              </Button>
              
              {scrapingId && (
                <Button 
                  onClick={() => checkProgress(scrapingId)} 
                  variant="outline"
                >
                  🔄 Verificar Estado
                </Button>
              )}
              
              <Button 
                onClick={limpiarResultados} 
                variant="outline"
              >
                🗑️ Limpiar
              </Button>
            </div>

            {scrapingId && (
              <div className="text-sm text-gray-600">
                <strong>ID de Scraping:</strong> {scrapingId}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Panel de resultados */}
        {result && (
          <Card>
            <CardHeader>
              <CardTitle>
                {result.type === 'iniciado' && '🚀 Scraping Iniciado'}
                {result.type === 'progreso' && '📊 Estado del Scraping'}
                {result.type === 'error' && '❌ Error'}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="bg-gray-50 p-4 rounded-lg">
                <pre className="text-sm overflow-x-auto whitespace-pre-wrap">
                  {JSON.stringify(result.data, null, 2)}
                </pre>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Panel de información */}
        <Card>
          <CardHeader>
            <CardTitle>ℹ️ Información del Test</CardTitle>
          </CardHeader>
          <CardContent className="text-sm space-y-2">
            <div><strong>URL Portal:</strong> https://cconsulting.logosenergia.wolfcrm.es/documents/</div>
            <div><strong>Usuario:</strong> GERENCIA</div>
            <div><strong>Proceso esperado:</strong></div>
            <ol className="list-decimal list-inside ml-4 space-y-1">
              <li>Login con credenciales</li>
              <li>Click en esquina superior izquierda</li>
              <li>Click en "Consulta de SIPS"</li>
              <li>Introducir CUPS en campo</li>
              <li>Extraer datos y descargar archivos</li>
            </ol>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
