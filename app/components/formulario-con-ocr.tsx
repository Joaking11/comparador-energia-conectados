
'use client';

import { useState } from 'react';
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
            <div className="grid grid-cols-2 gap-4">
              <Button 
                variant={metodoSeleccionado === 'ocr' ? 'default' : 'outline'}
                className="h-auto p-4 flex flex-col items-center gap-2"
                onClick={() => setMetodoSeleccionado('ocr')}
              >
                <Upload className="h-6 w-6" />
                <div className="text-center">
                  <div className="font-medium">OCR/IA Automático</div>
                  <div className="text-xs opacity-80">Sube factura y extrae datos</div>
                </div>
              </Button>
              
              <Button 
                variant={metodoSeleccionado === 'manual' ? 'default' : 'outline'}
                className="h-auto p-4 flex flex-col items-center gap-2"
                onClick={() => setMetodoSeleccionado('manual')}
              >
                <FileText className="h-6 w-6" />
                <div className="text-center">
                  <div className="font-medium">Entrada Manual</div>
                  <div className="text-xs opacity-80">Completa formulario paso a paso</div>
                </div>
              </Button>
            </div>
            
            {/* Descripción del método seleccionado */}
            <div className="mt-6 p-4 rounded-lg border border-gray-200 bg-gray-50">
              {metodoSeleccionado === 'ocr' ? (
                <div className="text-center space-y-2">
                  <h4 className="font-medium text-gray-900">Procesamiento Automático con IA</h4>
                  <p className="text-sm text-gray-600">
                    Sube una factura y extraemos automáticamente todos los datos necesarios
                  </p>
                  <div className="flex justify-center gap-4 text-xs text-gray-500 mt-3">
                    <span>✅ Extracción de 40+ campos</span>
                    <span>✅ PDF e imágenes</span>
                    <span>✅ Pre-llenado automático</span>
                  </div>
                </div>
              ) : (
                <div className="text-center space-y-2">
                  <h4 className="font-medium text-gray-900">Entrada Manual de Datos</h4>
                  <p className="text-sm text-gray-600">
                    Completa el formulario paso a paso con los datos del cliente
                  </p>
                  <div className="flex justify-center gap-4 text-xs text-gray-500 mt-3">
                    <span>✅ Control total</span>
                    <span>✅ Validación en tiempo real</span>
                    <span>✅ Formulario organizado</span>
                  </div>
                </div>
              )}
            </div>
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
