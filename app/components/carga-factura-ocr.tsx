
'use client';

import { useState, useRef } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { useToast } from '@/hooks/use-toast';
import { 
  Upload, 
  FileText, 
  Image, 
  CheckCircle, 
  AlertCircle,
  Loader2,
  Eye
} from 'lucide-react';

interface DatosExtraidos {
  cliente: {
    razonSocial: string;
    cif: string;
    direccion: string;
    localidad: string;
    provincia: string;
    codigoPostal: string;
    telefono?: string;
    email?: string;
  };
  periodofactura: {
    fechaInicial: string; // YYYY-MM-DD
    fechaFinal: string;   // YYYY-MM-DD
    diasPeriodo: number;
  };
  electricidad: {
    contrataElectricidad: boolean;
    tarifaAccesoElectricidad: string;
    cupsElectricidad: string;
    consumoAnualElectricidad: number;
    comercializadoraActual: string;
    distribuidoraElectrica?: string;
  };
  historicoConsumo?: {
    tieneGrafico: boolean;
    mesesDetectados: number;
    consumosMensuales: number[];
    periodoAnalizado: string;
    consumoAnualCalculado: number;
  };
  potencias: {
    potenciaP1: number;
    potenciaP2?: number;
    potenciaP3?: number;
    potenciaP4?: number;
    potenciaP5?: number;
    potenciaP6?: number;
  };
  consumos: {
    consumoP1: number;
    consumoP2?: number;
    consumoP3?: number;
    consumoP4?: number;
    consumoP5?: number;
    consumoP6?: number;
  };
  facturaElectricidad: {
    terminoFijo: number;
    terminoVariable: number;
    excesoPotencia: number;
    compensacionExcedentes: number; // kW de compensación de excedentes
    alquilerEquipos: number; // € alquiler de contador/equipos
    impuesto: number;
    iva: number;
    total: number;
  };
  gas?: {
    contrataGas: boolean;
    cupsGas?: string;
    consumoAnualGas?: number;
  };
  facturaGas?: {
    terminoFijo: number;
    terminoVariable: number;
    impuesto: number;
    iva: number;
    total: number;
  };
  confianza: number; // 0-100% confianza en la extracción
}

interface CargaFacturaOCRProps {
  onDatosExtraidos: (datos: DatosExtraidos) => void;
  onError: (error: string) => void;
}

export function CargaFacturaOCR({ onDatosExtraidos, onError }: CargaFacturaOCRProps) {
  const [estado, setEstado] = useState<'inicial' | 'subiendo' | 'procesando' | 'completado' | 'error'>('inicial');
  const [progreso, setProgreso] = useState(0);
  const [archivo, setArchivo] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [datosExtraidos, setDatosExtraidos] = useState<DatosExtraidos | null>(null);
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (file: File) => {
    // Validar tipo de archivo
    const tiposPermitidos = ['application/pdf', 'image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    if (!tiposPermitidos.includes(file.type)) {
      onError('Formato de archivo no soportado. Usa PDF, JPG, PNG o WebP.');
      return;
    }

    // Validar tamaño (máximo 10MB)
    if (file.size > 10 * 1024 * 1024) {
      onError('El archivo es demasiado grande. Máximo 10MB.');
      return;
    }

    setArchivo(file);
    
    // Crear preview para imágenes
    if (file.type.startsWith('image/')) {
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
    }

    setEstado('inicial');
    setProgreso(0);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) {
      handleFileSelect(files[0]);
    }
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      handleFileSelect(files[0]);
    }
  };

  const procesarFactura = async () => {
    if (!archivo) return;

    console.log('🚀 Iniciando procesamiento de factura:', archivo.name);
    setEstado('subiendo');
    setProgreso(10);

    try {
      // Preparar archivo para subida
      const formData = new FormData();
      formData.append('file', archivo);
      console.log('📤 FormData preparado, enviando a API...');

      setProgreso(30);
      setEstado('procesando');

      // Enviar a API de procesamiento OCR/IA
      const response = await fetch('/api/ocr-factura', {
        method: 'POST',
        body: formData,
      });
      
      console.log('📡 Respuesta recibida:', response.status, response.statusText);

      if (!response.ok) {
        const errorText = await response.text();
        console.log('❌ Error en respuesta:', errorText);
        throw new Error(`Error ${response.status}: ${response.statusText} - ${errorText}`);
      }

      // Procesar respuesta streaming
      const reader = response.body?.getReader();
      const decoder = new TextDecoder();
      let buffer = '';
      let partialRead = '';

      if (!reader) {
        throw new Error('No se pudo procesar la respuesta');
      }

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        partialRead += decoder.decode(value, { stream: true });
        let lines = partialRead.split('\n');
        partialRead = lines.pop() || '';

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const data = line.slice(6);
            if (data === '[DONE]') {
              return;
            }
            try {
              const parsed = JSON.parse(data);
              console.log('📨 Mensaje recibido:', parsed);
              
              if (parsed.status === 'processing') {
                setProgreso(prev => Math.min(prev + 5, 90));
                console.log('⏳ Procesando...');
              } else if (parsed.status === 'completed') {
                console.log('🎉 Completado exitosamente:', parsed.result);
                setDatosExtraidos(parsed.result);
                setEstado('completado');
                setProgreso(100);
                onDatosExtraidos(parsed.result);
                
                toast({
                  title: '✅ Factura procesada',
                  description: `Datos extraídos con ${parsed.result.confianza}% de confianza`,
                });
                return;
              } else if (parsed.status === 'error') {
                console.log('❌ Error reportado por API:', parsed.message);
                throw new Error(parsed.message || 'Error en el procesamiento');
              }
            } catch (e) {
              console.log('⚠️ JSON inválido ignorado:', data);
            }
          }
        }
      }

    } catch (error) {
      console.error('Error procesando factura:', error);
      setEstado('error');
      onError(`Error al procesar la factura: ${error instanceof Error ? error.message : 'Error desconocido'}`);
      
      toast({
        title: '❌ Error',
        description: 'No se pudo procesar la factura',
        variant: 'destructive',
      });
    }
  };

  const reset = () => {
    setEstado('inicial');
    setProgreso(0);
    setArchivo(null);
    setPreviewUrl(null);
    setDatosExtraidos(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Área de carga */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Upload className="h-5 w-5" />
            Cargar Factura para OCR/IA
          </CardTitle>
          <CardDescription>
            Sube una factura en PDF o imagen y extraeremos automáticamente todos los datos
          </CardDescription>
        </CardHeader>
        <CardContent>
          
          {estado === 'inicial' && !archivo && (
            <div
              className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-blue-400 transition-colors cursor-pointer"
              onDrop={handleDrop}
              onDragOver={(e) => e.preventDefault()}
              onClick={() => fileInputRef.current?.click()}
            >
              <div className="flex flex-col items-center space-y-4">
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
                  <Upload className="h-8 w-8 text-blue-600" />
                </div>
                <div>
                  <p className="text-lg font-medium text-gray-900">
                    Arrastra tu factura aquí
                  </p>
                  <p className="text-sm text-gray-500 mt-2">
                    O haz clic para seleccionar un archivo
                  </p>
                  <p className="text-xs text-gray-400 mt-2">
                    Soporta PDF, JPG, PNG, WebP (máx. 10MB)
                  </p>
                </div>
              </div>
              
              <input
                ref={fileInputRef}
                type="file"
                hidden
                accept=".pdf,.jpg,.jpeg,.png,.webp"
                onChange={handleFileInput}
              />
            </div>
          )}

          {archivo && estado === 'inicial' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center space-x-3">
                  {archivo.type.startsWith('image/') ? (
                    <Image className="h-6 w-6 text-blue-600" />
                  ) : (
                    <FileText className="h-6 w-6 text-red-600" />
                  )}
                  <div>
                    <p className="font-medium text-sm">{archivo.name}</p>
                    <p className="text-xs text-gray-500">
                      {(archivo.size / 1024 / 1024).toFixed(2)} MB
                    </p>
                  </div>
                </div>
                <Button variant="outline" size="sm" onClick={reset}>
                  Cambiar
                </Button>
              </div>

              {previewUrl && (
                <div className="relative w-full max-w-md mx-auto">
                  <img 
                    src={previewUrl} 
                    alt="Preview de la factura"
                    className="w-full h-auto max-h-60 object-contain border rounded-lg"
                  />
                </div>
              )}

              <div className="flex justify-center">
                <Button onClick={procesarFactura} className="min-w-[200px]">
                  <Eye className="mr-2 h-4 w-4" />
                  Procesar con IA
                </Button>
              </div>
            </div>
          )}

          {(estado === 'subiendo' || estado === 'procesando') && (
            <div className="space-y-4">
              <div className="text-center">
                <div className="flex justify-center mb-4">
                  <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
                </div>
                <h3 className="font-medium">
                  {estado === 'subiendo' && 'Subiendo factura...'}
                  {estado === 'procesando' && 'Procesando con IA...'}
                </h3>
                <p className="text-sm text-gray-500">
                  {estado === 'subiendo' && 'Almacenando archivo en la nube'}
                  {estado === 'procesando' && 'Extrayendo datos de la factura automáticamente'}
                </p>
              </div>
              
              <Progress value={progreso} className="w-full" />
              
              <p className="text-xs text-center text-gray-400">
                Esto puede tardar 30-60 segundos dependiendo del tamaño del archivo
              </p>
            </div>
          )}

          {estado === 'completado' && datosExtraidos && (
            <div className="space-y-4">
              <div className="flex items-center justify-center space-x-2 text-green-600">
                <CheckCircle className="h-6 w-6" />
                <span className="font-medium">Datos extraídos exitosamente</span>
              </div>
              
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <h4 className="font-medium text-green-900 mb-2">Resumen de datos extraídos:</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                  <div>
                    <strong>Cliente:</strong> {datosExtraidos.cliente.razonSocial}
                  </div>
                  <div>
                    <strong>CIF:</strong> {datosExtraidos.cliente.cif}
                  </div>
                  <div>
                    <strong>Período:</strong> {datosExtraidos.periodofactura.fechaInicial} al {datosExtraidos.periodofactura.fechaFinal}
                  </div>
                  <div>
                    <strong>Días:</strong> {datosExtraidos.periodofactura.diasPeriodo} días
                  </div>
                  <div>
                    <strong>Tarifa:</strong> {datosExtraidos.electricidad.tarifaAccesoElectricidad}
                  </div>
                  <div>
                    <strong>Consumo:</strong> {datosExtraidos.electricidad.consumoAnualElectricidad} kWh/año
                  </div>
                  <div>
                    <strong>Potencia P1:</strong> {datosExtraidos.potencias.potenciaP1} kW
                  </div>
                  <div>
                    <strong>Total Factura:</strong> {datosExtraidos.facturaElectricidad.total}€
                  </div>
                </div>
                
                <div className="mt-3 pt-3 border-t border-green-200">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-green-700">
                      Confianza en la extracción: <strong>{datosExtraidos.confianza}%</strong>
                    </span>
                    {datosExtraidos.confianza < 80 && (
                      <span className="text-xs text-amber-600 flex items-center gap-1">
                        <AlertCircle className="h-3 w-3" />
                        Revisar manualmente
                      </span>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex justify-center space-x-4">
                <Button variant="outline" onClick={reset}>
                  Procesar otra factura
                </Button>
                <Button 
                  onClick={() => onDatosExtraidos(datosExtraidos)}
                  className="min-w-[200px]"
                >
                  <CheckCircle className="mr-2 h-4 w-4" />
                  Usar estos datos
                </Button>
              </div>
            </div>
          )}

          {estado === 'error' && (
            <div className="space-y-4">
              <div className="flex items-center justify-center space-x-2 text-red-600">
                <AlertCircle className="h-6 w-6" />
                <span className="font-medium">Error al procesar factura</span>
              </div>
              
              <div className="text-center">
                <p className="text-sm text-gray-600 mb-4">
                  No se pudieron extraer los datos automáticamente.
                  Puedes intentar con otra factura o completar manualmente.
                </p>
                <div className="space-x-4">
                  <Button variant="outline" onClick={reset}>
                    Intentar otra factura
                  </Button>
                  <Button onClick={() => onDatosExtraidos(null as any)}>
                    Completar manualmente
                  </Button>
                </div>
              </div>
            </div>
          )}

        </CardContent>
      </Card>

      {/* Información adicional */}
      <Card className="bg-blue-50 border-blue-200">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg text-blue-900">💡 Consejos para mejores resultados</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm text-blue-800">
          <p>• <strong>PDF:</strong> Mejor calidad de extracción, texto nativo seleccionable</p>
          <p>• <strong>Imágenes:</strong> Buena iluminación, texto claro y legible</p>
          <p>• <strong>Facturas completas:</strong> Incluye toda la información, no recortes parciales</p>
          <p>• <strong>Orientación:</strong> Imagen derecha, no rotada ni inclinada</p>
        </CardContent>
      </Card>

    </div>
  );
}
