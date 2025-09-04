
'use client';

import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { FormularioComparativaCompleto } from './formulario-comparativa-completo';
import { CargaFacturaOCR } from './carga-factura-ocr';
import { Upload, FileText, CheckCircle } from 'lucide-react';

export function FormularioConOCR() {
  const [metodoSeleccionado, setMetodoSeleccionado] = useState<'manual' | 'ocr'>('ocr');
  const [datosOCR, setDatosOCR] = useState<any>(null);
  const [facturaProcessed, setFacturaProcessed] = useState(false);
  const { toast } = useToast();

  const handleDatosExtraidos = (datos: any) => {
    if (datos) {
      setDatosOCR(datos);
      setFacturaProcessed(true);
      setMetodoSeleccionado('manual'); // Cambiar a manual para revisar/editar
      
      toast({
        title: '✅ Datos extraídos',
        description: 'Revisa y edita los datos extraídos antes de calcular la comparativa',
      });
    } else {
      // Usuario eligió completar manualmente
      setMetodoSeleccionado('manual');
    }
  };

  const handleErrorOCR = (error: string) => {
    toast({
      title: '❌ Error OCR',
      description: error,
      variant: 'destructive',
    });
  };

  return (
    <div className="space-y-6">
      
      {/* Selector de método */}
      {!facturaProcessed && (
        <Card className="border-2">
          <CardHeader>
            <CardTitle className="text-center text-xl">¿Cómo quieres introducir los datos?</CardTitle>
            <CardDescription className="text-center">
              Elige el método que prefieras para crear la comparativa
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs value={metodoSeleccionado} onValueChange={(value) => setMetodoSeleccionado(value as 'manual' | 'ocr')}>
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="ocr" className="flex items-center gap-2">
                  <Upload className="h-4 w-4" />
                  OCR/IA Automático
                </TabsTrigger>
                <TabsTrigger value="manual" className="flex items-center gap-2">
                  <FileText className="h-4 w-4" />
                  Entrada Manual
                </TabsTrigger>
              </TabsList>

              <TabsContent value="ocr" className="mt-6">
                <div className="text-center space-y-4">
                  <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto">
                    <Upload className="h-8 w-8 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">
                      Procesamiento Automático con IA
                    </h3>
                    <p className="text-sm text-gray-600 mt-2">
                      Sube una factura y extraemos automáticamente todos los datos necesarios
                    </p>
                  </div>
                  <ul className="text-sm text-gray-500 space-y-1">
                    <li>✅ Extracción automática de más de 40 campos</li>
                    <li>✅ Soporte para PDF e imágenes</li>
                    <li>✅ Validación inteligente de datos</li>
                    <li>✅ Pre-llenado automático del formulario</li>
                  </ul>
                </div>
              </TabsContent>

              <TabsContent value="manual" className="mt-6">
                <div className="text-center space-y-4">
                  <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto">
                    <FileText className="h-8 w-8 text-green-600" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">
                      Entrada Manual de Datos
                    </h3>
                    <p className="text-sm text-gray-600 mt-2">
                      Completa el formulario paso a paso con los datos del cliente
                    </p>
                  </div>
                  <ul className="text-sm text-gray-500 space-y-1">
                    <li>✅ Control total sobre los datos</li>
                    <li>✅ Validación en tiempo real</li>
                    <li>✅ Formulario organizado por pestañas</li>
                    <li>✅ Ideal para casos complejos</li>
                  </ul>
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      )}

      {/* Procesamiento OCR */}
      {metodoSeleccionado === 'ocr' && !facturaProcessed && (
        <CargaFacturaOCR
          onDatosExtraidos={handleDatosExtraidos}
          onError={handleErrorOCR}
        />
      )}

      {/* Formulario manual o revisión de datos OCR */}
      {(metodoSeleccionado === 'manual' || facturaProcessed) && (
        <div className="space-y-4">
          {facturaProcessed && (
            <Card className="bg-green-50 border-green-200">
              <CardContent className="py-4">
                <div className="flex items-center gap-2 text-green-700">
                  <CheckCircle className="h-5 w-5" />
                  <span className="font-medium">
                    Datos extraídos automáticamente - Revisa y edita si es necesario
                  </span>
                </div>
              </CardContent>
            </Card>
          )}
          
          <FormularioComparativaCompleto datosIniciales={datosOCR} />
        </div>
      )}

    </div>
  );
}
