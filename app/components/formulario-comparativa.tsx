
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { 
  Calculator, 
  User, 
  Zap, 
  Building,
  Phone,
  Mail,
  MapPin,
  FileText,
  Loader2
} from 'lucide-react';

interface FormData {
  cliente: {
    nombre: string;
    cif: string;
    direccion: string;
    telefono: string;
    email: string;
  };
  consumo: {
    consumoAnual: number | string;
    potenciaContratada: number | string;
    tarifaActual: string;
    importeActual: number | string;
  };
  titulo: string;
  notas: string;
}

export function FormularioComparativa() {
  const router = useRouter();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<FormData>({
    cliente: {
      nombre: '',
      cif: '',
      direccion: '',
      telefono: '',
      email: ''
    },
    consumo: {
      consumoAnual: '',
      potenciaContratada: '',
      tarifaActual: '2.0TD',
      importeActual: ''
    },
    titulo: '',
    notas: ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validación básica
    if (!formData.cliente.nombre || !formData.consumo.consumoAnual || 
        !formData.consumo.potenciaContratada || !formData.consumo.importeActual) {
      toast({
        title: 'Error de validación',
        description: 'Por favor completa los campos obligatorios',
        variant: 'destructive'
      });
      return;
    }

    setLoading(true);
    
    try {
      // Preparar datos para enviar
      const dataToSend = {
        cliente: formData.cliente,
        consumo: {
          consumoAnual: Number(formData.consumo.consumoAnual),
          potenciaContratada: Number(formData.consumo.potenciaContratada),
          tarifaActual: formData.consumo.tarifaActual,
          importeActual: Number(formData.consumo.importeActual),
        },
        titulo: formData.titulo || `Comparativa ${formData.cliente.nombre}`,
        notas: formData.notas
      };

      const response = await fetch('/api/comparativas', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(dataToSend),
      });

      if (response.ok) {
        const comparativa = await response.json();
        toast({
          title: 'Comparativa creada',
          description: 'Los resultados han sido calculados exitosamente',
        });
        
        // Redirigir a la página de resultados
        router.push(`/comparativa/${comparativa.id}`);
      } else {
        throw new Error('Error al crear la comparativa');
      }
    } catch (error) {
      console.error('Error:', error);
      toast({
        title: 'Error',
        description: 'No se pudo crear la comparativa. Inténtalo de nuevo.',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const updateFormData = (section: keyof FormData | string, field: string, value: string | number) => {
    if (section === 'titulo' || section === 'notas') {
      setFormData(prev => ({
        ...prev,
        [section]: value
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [section]: {
          ...(prev[section as keyof FormData] as Record<string, any>),
          [field]: value
        }
      }));
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Datos del Cliente */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <User className="h-5 w-5 mr-2 text-blue-600" />
            Datos del Cliente
          </CardTitle>
          <CardDescription>
            Información básica del cliente para la comparativa
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="nombre">Nombre completo *</Label>
              <div className="relative">
                <User className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  id="nombre"
                  type="text"
                  placeholder="Ej: Juan Pérez García"
                  value={formData.cliente.nombre}
                  onChange={(e) => updateFormData('cliente', 'nombre', e.target.value)}
                  className="pl-10"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="cif">CIF/NIF</Label>
              <div className="relative">
                <FileText className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  id="cif"
                  type="text"
                  placeholder="Ej: 12345678Z"
                  value={formData.cliente.cif}
                  onChange={(e) => updateFormData('cliente', 'cif', e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="telefono">Teléfono</Label>
              <div className="relative">
                <Phone className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  id="telefono"
                  type="tel"
                  placeholder="Ej: 666123456"
                  value={formData.cliente.telefono}
                  onChange={(e) => updateFormData('cliente', 'telefono', e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  id="email"
                  type="email"
                  placeholder="Ej: cliente@email.com"
                  value={formData.cliente.email}
                  onChange={(e) => updateFormData('cliente', 'email', e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="direccion">Dirección</Label>
              <div className="relative">
                <MapPin className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  id="direccion"
                  type="text"
                  placeholder="Ej: Calle Ejemplo 123, Madrid"
                  value={formData.cliente.direccion}
                  onChange={(e) => updateFormData('cliente', 'direccion', e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Datos de Consumo */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Zap className="h-5 w-5 mr-2 text-orange-600" />
            Datos de Consumo Energético
          </CardTitle>
          <CardDescription>
            Información sobre el consumo actual del cliente
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="consumoAnual">Consumo Anual (kWh) *</Label>
              <Input
                id="consumoAnual"
                type="number"
                placeholder="Ej: 3500"
                value={formData.consumo.consumoAnual}
                onChange={(e) => updateFormData('consumo', 'consumoAnual', e.target.value)}
                min="0"
                step="1"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="potenciaContratada">Potencia Contratada (kW) *</Label>
              <Input
                id="potenciaContratada"
                type="number"
                placeholder="Ej: 4.4"
                value={formData.consumo.potenciaContratada}
                onChange={(e) => updateFormData('consumo', 'potenciaContratada', e.target.value)}
                min="0"
                step="0.1"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="tarifaActual">Tarifa Actual</Label>
              <Select 
                value={formData.consumo.tarifaActual} 
                onValueChange={(value) => updateFormData('consumo', 'tarifaActual', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecciona la tarifa" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="2.0TD">2.0TD (Baja tensión ≤ 15 kW)</SelectItem>
                  <SelectItem value="3.0TD">3.0TD (Baja tensión &gt; 15 kW)</SelectItem>
                  <SelectItem value="6.1TD">6.1TD (Alta tensión)</SelectItem>
                  <SelectItem value="otra">Otra</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="importeActual">Factura Actual Anual (€) *</Label>
              <Input
                id="importeActual"
                type="number"
                placeholder="Ej: 800"
                value={formData.consumo.importeActual}
                onChange={(e) => updateFormData('consumo', 'importeActual', e.target.value)}
                min="0"
                step="0.01"
                required
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Información Adicional */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Building className="h-5 w-5 mr-2 text-purple-600" />
            Información Adicional
          </CardTitle>
          <CardDescription>
            Datos opcionales para organizar mejor las comparativas
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="titulo">Título de la comparativa</Label>
            <Input
              id="titulo"
              type="text"
              placeholder="Ej: Comparativa Juan Pérez - Oficina Madrid"
              value={formData.titulo}
              onChange={(e) => updateFormData('titulo', 'titulo', e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="notas">Notas</Label>
            <Textarea
              id="notas"
              placeholder="Cualquier información adicional relevante..."
              value={formData.notas}
              onChange={(e) => updateFormData('notas', 'notas', e.target.value)}
              rows={3}
            />
          </div>
        </CardContent>
      </Card>

      {/* Botones de Acción */}
      <div className="flex justify-between items-center pt-6">
        <Button 
          type="button" 
          variant="outline"
          onClick={() => router.back()}
        >
          Cancelar
        </Button>
        
        <Button 
          type="submit" 
          disabled={loading}
          className="bg-blue-600 hover:bg-blue-700 min-w-[150px]"
        >
          {loading ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Procesando...
            </>
          ) : (
            <>
              <Calculator className="h-4 w-4 mr-2" />
              Crear Comparativa
            </>
          )}
        </Button>
      </div>
    </form>
  );
}
