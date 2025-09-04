
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
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
  Loader2,
  Flame,
  Settings,
  TrendingUp
} from 'lucide-react';

interface FormDataCompleto {
  cliente: {
    razonSocial: string;
    cif: string;
    direccion: string;
    localidad: string;
    provincia: string;
    codigoPostal: string;
    nombreFirmante: string;
    nifFirmante: string;
    telefono: string;
    email: string;
  };
  electricidad: {
    contrataElectricidad: boolean;
    multipuntoElectricidad: boolean;
    tarifaAccesoElectricidad: string;
    cupsElectricidad: string;
    consumoAnualElectricidad: number | string;
    duracionContratoElectricidad: number | string;
    comercializadoraActual: string;
    ahorroMinimo: number | string;
    distribuidoraElectrica: string;
  };
  gas: {
    contrataGas: boolean;
    multipuntoGas: boolean;
    tarifaAccesoGas: string;
    cupsGas: string;
    consumoAnualGas: number | string;
    duracionContratoGas: number | string;
  };
  fee: {
    feeEnergia: number | string;
    feeEnergiaMinimo: number | string;
    feeEnergiaMaximo: number | string;
    feePotencia: number | string;
    feePotenciaMinimo: number | string;
    feePotenciaMaximo: number | string;
    energiaFijo: boolean;
    potenciaFijo: boolean;
  };
  potencias: {
    potenciaP1: number | string;
    potenciaP2: number | string;
    potenciaP3: number | string;
    potenciaP4: number | string;
    potenciaP5: number | string;
    potenciaP6: number | string;
  };
  consumos: {
    consumoP1: number | string;
    consumoP2: number | string;
    consumoP3: number | string;
    consumoP4: number | string;
    consumoP5: number | string;
    consumoP6: number | string;
  };
  facturaElectricidad: {
    terminoFijo: number | string;
    terminoVariable: number | string;
    excesoPotencia: number | string;
    impuesto: number | string;
    iva: number | string;
    total: number | string;
  };
  facturaGas: {
    terminoFijo: number | string;
    terminoVariable: number | string;
    impuesto: number | string;
    iva: number | string;
    total: number | string;
  };
  metadatos: {
    titulo: string;
    notas: string;
  };
}

const TARIFAS_ACCESO_ELECTRICIDAD = ['2.0TD', '3.0TD', '6.1TD', '6.2TD'];
const TARIFAS_ACCESO_GAS = ['RL.1', 'RL.2', 'RL.3', 'RL.4'];
const COMERCIALIZADORAS = ['Iberdrola', 'Endesa', 'Naturgy', 'EDP', 'Repsol', 'Audax', 'Acciona', 'Holaluz'];
const DISTRIBUIDORAS = ['Iberdrola', 'Endesa', 'Naturgy', 'EDP', 'UFD', 'Viesgo'];

export function FormularioComparativaCompleto({ datosIniciales }: { datosIniciales?: any }) {
  const router = useRouter();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);

  // Función para mapear datos de OCR al formato del formulario
  const mapearDatosOCR = (datosOCR: any): FormDataCompleto => {
    if (!datosOCR) {
      return formDataVacio;
    }

    return {
      cliente: {
        razonSocial: datosOCR.cliente?.razonSocial || '',
        cif: datosOCR.cliente?.cif || '',
        direccion: datosOCR.cliente?.direccion || '',
        localidad: datosOCR.cliente?.localidad || '',
        provincia: datosOCR.cliente?.provincia || '',
        codigoPostal: datosOCR.cliente?.codigoPostal || '',
        nombreFirmante: datosOCR.cliente?.nombreFirmante || '',
        nifFirmante: datosOCR.cliente?.nifFirmante || '',
        telefono: datosOCR.cliente?.telefono || '',
        email: datosOCR.cliente?.email || ''
      },
      electricidad: {
        contrataElectricidad: datosOCR.electricidad?.contrataElectricidad ?? true,
        multipuntoElectricidad: false,
        tarifaAccesoElectricidad: datosOCR.electricidad?.tarifaAccesoElectricidad || '2.0TD',
        cupsElectricidad: datosOCR.electricidad?.cupsElectricidad || '',
        consumoAnualElectricidad: datosOCR.electricidad?.consumoAnualElectricidad || '',
        duracionContratoElectricidad: 12,
        comercializadoraActual: datosOCR.electricidad?.comercializadoraActual || '',
        ahorroMinimo: 0.1,
        distribuidoraElectrica: datosOCR.electricidad?.distribuidoraElectrica || ''
      },
      gas: {
        contrataGas: datosOCR.gas?.contrataGas || false,
        multipuntoGas: false,
        tarifaAccesoGas: '',
        cupsGas: datosOCR.gas?.cupsGas || '',
        consumoAnualGas: datosOCR.gas?.consumoAnualGas || '',
        duracionContratoGas: 12
      },
      fee: {
        feeEnergia: 0,
        feeEnergiaMinimo: '',
        feeEnergiaMaximo: '',
        feePotencia: 0,
        feePotenciaMinimo: '',
        feePotenciaMaximo: '',
        energiaFijo: false,
        potenciaFijo: false
      },
      potencias: {
        potenciaP1: datosOCR.potencias?.potenciaP1 || '',
        potenciaP2: datosOCR.potencias?.potenciaP2 || '',
        potenciaP3: datosOCR.potencias?.potenciaP3 || '',
        potenciaP4: datosOCR.potencias?.potenciaP4 || '',
        potenciaP5: datosOCR.potencias?.potenciaP5 || '',
        potenciaP6: datosOCR.potencias?.potenciaP6 || ''
      },
      consumos: {
        consumoP1: datosOCR.consumos?.consumoP1 || '',
        consumoP2: datosOCR.consumos?.consumoP2 || '',
        consumoP3: datosOCR.consumos?.consumoP3 || '',
        consumoP4: datosOCR.consumos?.consumoP4 || '',
        consumoP5: datosOCR.consumos?.consumoP5 || '',
        consumoP6: datosOCR.consumos?.consumoP6 || ''
      },
      facturaElectricidad: {
        terminoFijo: datosOCR.facturaElectricidad?.terminoFijo || '',
        terminoVariable: datosOCR.facturaElectricidad?.terminoVariable || '',
        excesoPotencia: datosOCR.facturaElectricidad?.excesoPotencia || 0,
        impuesto: datosOCR.facturaElectricidad?.impuesto || '',
        iva: datosOCR.facturaElectricidad?.iva || '',
        total: datosOCR.facturaElectricidad?.total || ''
      },
      facturaGas: {
        terminoFijo: datosOCR.facturaGas?.terminoFijo || '',
        terminoVariable: datosOCR.facturaGas?.terminoVariable || '',
        impuesto: datosOCR.facturaGas?.impuesto || '',
        iva: datosOCR.facturaGas?.iva || '',
        total: datosOCR.facturaGas?.total || ''
      },
      metadatos: {
        titulo: '',
        notas: ''
      }
    };
  };

  const formDataVacio: FormDataCompleto = {
    cliente: {
      razonSocial: '',
      cif: '',
      direccion: '',
      localidad: '',
      provincia: '',
      codigoPostal: '',
      nombreFirmante: '',
      nifFirmante: '',
      telefono: '',
      email: ''
    },
    electricidad: {
      contrataElectricidad: true,
      multipuntoElectricidad: false,
      tarifaAccesoElectricidad: '2.0TD',
      cupsElectricidad: '',
      consumoAnualElectricidad: '',
      duracionContratoElectricidad: 12,
      comercializadoraActual: '',
      ahorroMinimo: 0.1,
      distribuidoraElectrica: ''
    },
    gas: {
      contrataGas: false,
      multipuntoGas: false,
      tarifaAccesoGas: '',
      cupsGas: '',
      consumoAnualGas: '',
      duracionContratoGas: 12
    },
    fee: {
      feeEnergia: 0,
      feeEnergiaMinimo: '',
      feeEnergiaMaximo: '',
      feePotencia: 0,
      feePotenciaMinimo: '',
      feePotenciaMaximo: '',
      energiaFijo: false,
      potenciaFijo: false
    },
    potencias: {
      potenciaP1: '',
      potenciaP2: '',
      potenciaP3: '',
      potenciaP4: '',
      potenciaP5: '',
      potenciaP6: ''
    },
    consumos: {
      consumoP1: '',
      consumoP2: '',
      consumoP3: '',
      consumoP4: '',
      consumoP5: '',
      consumoP6: ''
    },
    facturaElectricidad: {
      terminoFijo: '',
      terminoVariable: '',
      excesoPotencia: 0,
      impuesto: '',
      iva: '',
      total: ''
    },
    facturaGas: {
      terminoFijo: '',
      terminoVariable: '',
      impuesto: '',
      iva: '',
      total: ''
    },
    metadatos: {
      titulo: '',
      notas: ''
    }
  };

  // Inicializar formData con datos OCR si están disponibles
  const [formData, setFormData] = useState<FormDataCompleto>(
    datosIniciales ? mapearDatosOCR(datosIniciales) : formDataVacio
  );

  const updateFormData = (section: keyof FormDataCompleto, field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        [field]: value
      }
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Preparar datos para envío
      const datos = {
        cliente: formData.cliente,
        comparativa: {
          titulo: formData.metadatos.titulo,
          
          // Electricidad
          contrataElectricidad: formData.electricidad.contrataElectricidad,
          multipuntoElectricidad: formData.electricidad.multipuntoElectricidad,
          tarifaAccesoElectricidad: formData.electricidad.tarifaAccesoElectricidad,
          cupsElectricidad: formData.electricidad.cupsElectricidad || undefined,
          consumoAnualElectricidad: parseFloat(formData.electricidad.consumoAnualElectricidad.toString()),
          duracionContratoElectricidad: parseInt(formData.electricidad.duracionContratoElectricidad.toString()),
          comercializadoraActual: formData.electricidad.comercializadoraActual,
          ahorroMinimo: parseFloat(formData.electricidad.ahorroMinimo.toString()),
          distribuidoraElectrica: formData.electricidad.distribuidoraElectrica || undefined,
          
          // Gas
          contrataGas: formData.gas.contrataGas,
          multipuntoGas: formData.gas.multipuntoGas,
          tarifaAccesoGas: formData.gas.tarifaAccesoGas || undefined,
          cupsGas: formData.gas.cupsGas || undefined,
          consumoAnualGas: formData.gas.consumoAnualGas ? parseFloat(formData.gas.consumoAnualGas.toString()) : undefined,
          duracionContratoGas: formData.gas.duracionContratoGas ? parseInt(formData.gas.duracionContratoGas.toString()) : undefined,
          
          // FEE
          feeEnergia: parseFloat(formData.fee.feeEnergia.toString()) || 0,
          feeEnergiaMinimo: formData.fee.feeEnergiaMinimo ? parseFloat(formData.fee.feeEnergiaMinimo.toString()) : undefined,
          feeEnergiaMaximo: formData.fee.feeEnergiaMaximo ? parseFloat(formData.fee.feeEnergiaMaximo.toString()) : undefined,
          feePotencia: parseFloat(formData.fee.feePotencia.toString()) || 0,
          feePotenciaMinimo: formData.fee.feePotenciaMinimo ? parseFloat(formData.fee.feePotenciaMinimo.toString()) : undefined,
          feePotenciaMaximo: formData.fee.feePotenciaMaximo ? parseFloat(formData.fee.feePotenciaMaximo.toString()) : undefined,
          energiaFijo: formData.fee.energiaFijo,
          potenciaFijo: formData.fee.potenciaFijo,
          
          // Potencias
          potenciaP1: parseFloat(formData.potencias.potenciaP1.toString()),
          potenciaP2: formData.potencias.potenciaP2 ? parseFloat(formData.potencias.potenciaP2.toString()) : undefined,
          potenciaP3: formData.potencias.potenciaP3 ? parseFloat(formData.potencias.potenciaP3.toString()) : undefined,
          potenciaP4: formData.potencias.potenciaP4 ? parseFloat(formData.potencias.potenciaP4.toString()) : undefined,
          potenciaP5: formData.potencias.potenciaP5 ? parseFloat(formData.potencias.potenciaP5.toString()) : undefined,
          potenciaP6: formData.potencias.potenciaP6 ? parseFloat(formData.potencias.potenciaP6.toString()) : undefined,
          
          // Consumos
          consumoP1: parseFloat(formData.consumos.consumoP1.toString()),
          consumoP2: formData.consumos.consumoP2 ? parseFloat(formData.consumos.consumoP2.toString()) : undefined,
          consumoP3: formData.consumos.consumoP3 ? parseFloat(formData.consumos.consumoP3.toString()) : undefined,
          consumoP4: formData.consumos.consumoP4 ? parseFloat(formData.consumos.consumoP4.toString()) : undefined,
          consumoP5: formData.consumos.consumoP5 ? parseFloat(formData.consumos.consumoP5.toString()) : undefined,
          consumoP6: formData.consumos.consumoP6 ? parseFloat(formData.consumos.consumoP6.toString()) : undefined,
          
          // Factura Electricidad
          terminoFijoElectricidad: parseFloat(formData.facturaElectricidad.terminoFijo.toString()),
          terminoVariableElectricidad: parseFloat(formData.facturaElectricidad.terminoVariable.toString()),
          excesoPotencia: formData.facturaElectricidad.excesoPotencia ? parseFloat(formData.facturaElectricidad.excesoPotencia.toString()) : 0,
          impuestoElectricidad: parseFloat(formData.facturaElectricidad.impuesto.toString()),
          ivaElectricidad: parseFloat(formData.facturaElectricidad.iva.toString()),
          totalFacturaElectricidad: parseFloat(formData.facturaElectricidad.total.toString()),
          
          // Factura Gas (opcional)
          terminoFijoGas: formData.gas.contrataGas && formData.facturaGas.terminoFijo ? parseFloat(formData.facturaGas.terminoFijo.toString()) : undefined,
          terminoVariableGas: formData.gas.contrataGas && formData.facturaGas.terminoVariable ? parseFloat(formData.facturaGas.terminoVariable.toString()) : undefined,
          impuestoGas: formData.gas.contrataGas && formData.facturaGas.impuesto ? parseFloat(formData.facturaGas.impuesto.toString()) : undefined,
          ivaGas: formData.gas.contrataGas && formData.facturaGas.iva ? parseFloat(formData.facturaGas.iva.toString()) : undefined,
          totalFacturaGas: formData.gas.contrataGas && formData.facturaGas.total ? parseFloat(formData.facturaGas.total.toString()) : undefined,
          
          notas: formData.metadatos.notas || undefined
        }
      };

      const response = await fetch('/api/comparativas', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(datos),
      });

      if (!response.ok) {
        throw new Error('Error al crear la comparativa');
      }

      const result = await response.json();
      
      toast({
        title: 'Comparativa creada',
        description: 'Se ha calculado la comparativa exitosamente',
      });

      router.push(`/comparativa/${result.comparativa.id}`);
      
    } catch (error) {
      console.error('Error:', error);
      toast({
        title: 'Error',
        description: 'No se pudo crear la comparativa. Inténtalo de nuevo.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <div className="space-y-6">
        
        {/* Metadatos de la comparativa */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Información General
            </CardTitle>
            <CardDescription>
              Datos básicos de la comparativa
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="titulo">Título de la comparativa (opcional)</Label>
              <Input
                id="titulo"
                placeholder="Ej: Comparativa Cliente Empresa ABC - Septiembre 2025"
                value={formData.metadatos.titulo}
                onChange={(e) => updateFormData('metadatos', 'titulo', e.target.value)}
              />
            </div>
          </CardContent>
        </Card>

        <Tabs defaultValue="cliente" className="w-full">
          <TabsList className="grid w-full grid-cols-6">
            <TabsTrigger value="cliente">Cliente</TabsTrigger>
            <TabsTrigger value="electricidad">Electricidad</TabsTrigger>
            <TabsTrigger value="gas">Gas</TabsTrigger>
            <TabsTrigger value="fee">Configuración</TabsTrigger>
            <TabsTrigger value="consumo">Consumo/Potencia</TabsTrigger>
            <TabsTrigger value="factura">Factura Actual</TabsTrigger>
          </TabsList>

          {/* TAB CLIENTE */}
          <TabsContent value="cliente" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="h-5 w-5" />
                  Datos del Cliente
                </CardTitle>
                <CardDescription>
                  Información básica del cliente para la comparativa
                </CardDescription>
              </CardHeader>
              <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="razonSocial">Razón Social / Nombre *</Label>
                  <Input
                    id="razonSocial"
                    required
                    placeholder="Nombre completo o razón social"
                    value={formData.cliente.razonSocial}
                    onChange={(e) => updateFormData('cliente', 'razonSocial', e.target.value)}
                  />
                </div>
                
                <div>
                  <Label htmlFor="cif">CIF / NIF</Label>
                  <Input
                    id="cif"
                    placeholder="12345678A"
                    value={formData.cliente.cif}
                    onChange={(e) => updateFormData('cliente', 'cif', e.target.value)}
                  />
                </div>
                
                <div className="md:col-span-2">
                  <Label htmlFor="direccion">Dirección</Label>
                  <Input
                    id="direccion"
                    placeholder="Calle, número, piso..."
                    value={formData.cliente.direccion}
                    onChange={(e) => updateFormData('cliente', 'direccion', e.target.value)}
                  />
                </div>
                
                <div>
                  <Label htmlFor="localidad">Localidad</Label>
                  <Input
                    id="localidad"
                    placeholder="Madrid, Barcelona..."
                    value={formData.cliente.localidad}
                    onChange={(e) => updateFormData('cliente', 'localidad', e.target.value)}
                  />
                </div>
                
                <div>
                  <Label htmlFor="provincia">Provincia</Label>
                  <Input
                    id="provincia"
                    placeholder="Madrid, Barcelona..."
                    value={formData.cliente.provincia}
                    onChange={(e) => updateFormData('cliente', 'provincia', e.target.value)}
                  />
                </div>
                
                <div>
                  <Label htmlFor="codigoPostal">Código Postal</Label>
                  <Input
                    id="codigoPostal"
                    placeholder="28001"
                    value={formData.cliente.codigoPostal}
                    onChange={(e) => updateFormData('cliente', 'codigoPostal', e.target.value)}
                  />
                </div>
                
                <div>
                  <Label htmlFor="telefono">Teléfono</Label>
                  <Input
                    id="telefono"
                    placeholder="666123456"
                    value={formData.cliente.telefono}
                    onChange={(e) => updateFormData('cliente', 'telefono', e.target.value)}
                  />
                </div>
                
                <div>
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="cliente@email.com"
                    value={formData.cliente.email}
                    onChange={(e) => updateFormData('cliente', 'email', e.target.value)}
                  />
                </div>
                
                <div>
                  <Label htmlFor="nombreFirmante">Nombre del Firmante</Label>
                  <Input
                    id="nombreFirmante"
                    placeholder="Persona que firma el contrato"
                    value={formData.cliente.nombreFirmante}
                    onChange={(e) => updateFormData('cliente', 'nombreFirmante', e.target.value)}
                  />
                </div>
                
                <div>
                  <Label htmlFor="nifFirmante">NIF del Firmante</Label>
                  <Input
                    id="nifFirmante"
                    placeholder="12345678A"
                    value={formData.cliente.nifFirmante}
                    onChange={(e) => updateFormData('cliente', 'nifFirmante', e.target.value)}
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* TAB ELECTRICIDAD */}
          <TabsContent value="electricidad" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Zap className="h-5 w-5" />
                  Suministro Eléctrico
                </CardTitle>
                <CardDescription>
                  Configuración del suministro eléctrico actual
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                
                {/* Switch principal electricidad */}
                <div className="flex items-center space-x-2">
                  <Switch
                    id="contrataElectricidad"
                    checked={formData.electricidad.contrataElectricidad}
                    onCheckedChange={(checked) => updateFormData('electricidad', 'contrataElectricidad', checked)}
                  />
                  <Label htmlFor="contrataElectricidad">Contrata electricidad</Label>
                </div>

                {formData.electricidad.contrataElectricidad && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="flex items-center space-x-2">
                      <Switch
                        id="multipuntoElectricidad"
                        checked={formData.electricidad.multipuntoElectricidad}
                        onCheckedChange={(checked) => updateFormData('electricidad', 'multipuntoElectricidad', checked)}
                      />
                      <Label htmlFor="multipuntoElectricidad">Suministro multipunto</Label>
                    </div>
                    
                    <div>
                      <Label htmlFor="tarifaAccesoElectricidad">Tarifa de Acceso *</Label>
                      <Select
                        value={formData.electricidad.tarifaAccesoElectricidad}
                        onValueChange={(value) => updateFormData('electricidad', 'tarifaAccesoElectricidad', value)}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Selecciona tarifa" />
                        </SelectTrigger>
                        <SelectContent>
                          {TARIFAS_ACCESO_ELECTRICIDAD.map((tarifa) => (
                            <SelectItem key={tarifa} value={tarifa}>
                              {tarifa}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div>
                      <Label htmlFor="cupsElectricidad">CUPS Electricidad</Label>
                      <Input
                        id="cupsElectricidad"
                        placeholder="ES0021000012737745EC"
                        value={formData.electricidad.cupsElectricidad}
                        onChange={(e) => updateFormData('electricidad', 'cupsElectricidad', e.target.value)}
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor="consumoAnualElectricidad">Consumo Anual (kWh) *</Label>
                      <Input
                        id="consumoAnualElectricidad"
                        type="number"
                        placeholder="1600"
                        required={formData.electricidad.contrataElectricidad}
                        value={formData.electricidad.consumoAnualElectricidad}
                        onChange={(e) => updateFormData('electricidad', 'consumoAnualElectricidad', e.target.value)}
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor="duracionContratoElectricidad">Duración Contrato (meses)</Label>
                      <Input
                        id="duracionContratoElectricidad"
                        type="number"
                        placeholder="12"
                        value={formData.electricidad.duracionContratoElectricidad}
                        onChange={(e) => updateFormData('electricidad', 'duracionContratoElectricidad', e.target.value)}
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor="comercializadoraActual">Comercializadora Actual *</Label>
                      <Select
                        value={formData.electricidad.comercializadoraActual}
                        onValueChange={(value) => updateFormData('electricidad', 'comercializadoraActual', value)}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Selecciona comercializadora" />
                        </SelectTrigger>
                        <SelectContent>
                          {COMERCIALIZADORAS.map((comercializadora) => (
                            <SelectItem key={comercializadora} value={comercializadora}>
                              {comercializadora}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div>
                      <Label htmlFor="ahorroMinimo">Ahorro Mínimo (%)</Label>
                      <Input
                        id="ahorroMinimo"
                        type="number"
                        step="0.1"
                        placeholder="0.1"
                        value={formData.electricidad.ahorroMinimo}
                        onChange={(e) => updateFormData('electricidad', 'ahorroMinimo', e.target.value)}
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor="distribuidoraElectrica">Distribuidora Eléctrica</Label>
                      <Select
                        value={formData.electricidad.distribuidoraElectrica}
                        onValueChange={(value) => updateFormData('electricidad', 'distribuidoraElectrica', value)}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Selecciona distribuidora" />
                        </SelectTrigger>
                        <SelectContent>
                          {DISTRIBUIDORAS.map((distribuidora) => (
                            <SelectItem key={distribuidora} value={distribuidora}>
                              {distribuidora}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* TAB GAS */}
          <TabsContent value="gas" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Flame className="h-5 w-5" />
                  Suministro de Gas
                </CardTitle>
                <CardDescription>
                  Configuración del suministro de gas (opcional)
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                
                <div className="flex items-center space-x-2">
                  <Switch
                    id="contrataGas"
                    checked={formData.gas.contrataGas}
                    onCheckedChange={(checked) => updateFormData('gas', 'contrataGas', checked)}
                  />
                  <Label htmlFor="contrataGas">Contrata gas</Label>
                </div>

                {formData.gas.contrataGas && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="flex items-center space-x-2">
                      <Switch
                        id="multipuntoGas"
                        checked={formData.gas.multipuntoGas}
                        onCheckedChange={(checked) => updateFormData('gas', 'multipuntoGas', checked)}
                      />
                      <Label htmlFor="multipuntoGas">Suministro multipunto</Label>
                    </div>
                    
                    <div>
                      <Label htmlFor="tarifaAccesoGas">Tarifa de Acceso Gas</Label>
                      <Select
                        value={formData.gas.tarifaAccesoGas}
                        onValueChange={(value) => updateFormData('gas', 'tarifaAccesoGas', value)}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Selecciona tarifa" />
                        </SelectTrigger>
                        <SelectContent>
                          {TARIFAS_ACCESO_GAS.map((tarifa) => (
                            <SelectItem key={tarifa} value={tarifa}>
                              {tarifa}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div>
                      <Label htmlFor="cupsGas">CUPS Gas</Label>
                      <Input
                        id="cupsGas"
                        placeholder="ES..."
                        value={formData.gas.cupsGas}
                        onChange={(e) => updateFormData('gas', 'cupsGas', e.target.value)}
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor="consumoAnualGas">Consumo Anual Gas (kWh)</Label>
                      <Input
                        id="consumoAnualGas"
                        type="number"
                        placeholder="3000"
                        value={formData.gas.consumoAnualGas}
                        onChange={(e) => updateFormData('gas', 'consumoAnualGas', e.target.value)}
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor="duracionContratoGas">Duración Contrato Gas (meses)</Label>
                      <Input
                        id="duracionContratoGas"
                        type="number"
                        placeholder="12"
                        value={formData.gas.duracionContratoGas}
                        onChange={(e) => updateFormData('gas', 'duracionContratoGas', e.target.value)}
                      />
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* TAB CONFIGURACIÓN FEE */}
          <TabsContent value="fee" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Settings className="h-5 w-5" />
                  Configuración FEE
                </CardTitle>
                <CardDescription>
                  Parámetros de comisión y márgenes operativos
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  
                  {/* FEE ENERGÍA */}
                  <div className="space-y-4">
                    <h4 className="font-medium text-sm text-gray-700">FEE Energía</h4>
                    
                    <div className="flex items-center space-x-2">
                      <Switch
                        id="energiaFijo"
                        checked={formData.fee.energiaFijo}
                        onCheckedChange={(checked) => updateFormData('fee', 'energiaFijo', checked)}
                      />
                      <Label htmlFor="energiaFijo">Energía FEE Fijo</Label>
                    </div>
                    
                    <div>
                      <Label htmlFor="feeEnergia">FEE Energía (€/MWh)</Label>
                      <Input
                        id="feeEnergia"
                        type="number"
                        step="0.01"
                        placeholder="2.0"
                        value={formData.fee.feeEnergia}
                        onChange={(e) => updateFormData('fee', 'feeEnergia', e.target.value)}
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor="feeEnergiaMinimo">FEE Energía Mínimo</Label>
                      <Input
                        id="feeEnergiaMinimo"
                        type="number"
                        step="0.01"
                        value={formData.fee.feeEnergiaMinimo}
                        onChange={(e) => updateFormData('fee', 'feeEnergiaMinimo', e.target.value)}
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor="feeEnergiaMaximo">FEE Energía Máximo</Label>
                      <Input
                        id="feeEnergiaMaximo"
                        type="number"
                        step="0.01"
                        value={formData.fee.feeEnergiaMaximo}
                        onChange={(e) => updateFormData('fee', 'feeEnergiaMaximo', e.target.value)}
                      />
                    </div>
                  </div>

                  {/* FEE POTENCIA */}
                  <div className="space-y-4">
                    <h4 className="font-medium text-sm text-gray-700">FEE Potencia</h4>
                    
                    <div className="flex items-center space-x-2">
                      <Switch
                        id="potenciaFijo"
                        checked={formData.fee.potenciaFijo}
                        onCheckedChange={(checked) => updateFormData('fee', 'potenciaFijo', checked)}
                      />
                      <Label htmlFor="potenciaFijo">Potencia FEE Fijo</Label>
                    </div>
                    
                    <div>
                      <Label htmlFor="feePotencia">FEE Potencia (€/kW·mes)</Label>
                      <Input
                        id="feePotencia"
                        type="number"
                        step="0.01"
                        placeholder="15.0"
                        value={formData.fee.feePotencia}
                        onChange={(e) => updateFormData('fee', 'feePotencia', e.target.value)}
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor="feePotenciaMinimo">FEE Potencia Mínimo</Label>
                      <Input
                        id="feePotenciaMinimo"
                        type="number"
                        step="0.01"
                        value={formData.fee.feePotenciaMinimo}
                        onChange={(e) => updateFormData('fee', 'feePotenciaMinimo', e.target.value)}
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor="feePotenciaMaximo">FEE Potencia Máximo</Label>
                      <Input
                        id="feePotenciaMaximo"
                        type="number"
                        step="0.01"
                        value={formData.fee.feePotenciaMaximo}
                        onChange={(e) => updateFormData('fee', 'feePotenciaMaximo', e.target.value)}
                      />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* TAB CONSUMO/POTENCIA */}
          <TabsContent value="consumo" className="space-y-4">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              
              {/* Potencias */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Potencias Contratadas (kW)</CardTitle>
                  <CardDescription>
                    Potencia contratada por período
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="potenciaP1">Período P1 (Punta) *</Label>
                    <Input
                      id="potenciaP1"
                      type="number"
                      step="0.001"
                      placeholder="6.93"
                      required
                      value={formData.potencias.potenciaP1}
                      onChange={(e) => updateFormData('potencias', 'potenciaP1', e.target.value)}
                    />
                  </div>
                  
                  {['P2', 'P3', 'P4', 'P5', 'P6'].map((periodo, index) => (
                    <div key={periodo}>
                      <Label htmlFor={`potencia${periodo}`}>Período {periodo}</Label>
                      <Input
                        id={`potencia${periodo}`}
                        type="number"
                        step="0.001"
                        placeholder="6.93"
                        value={formData.potencias[`potencia${periodo}` as keyof typeof formData.potencias]}
                        onChange={(e) => updateFormData('potencias', `potencia${periodo}`, e.target.value)}
                      />
                    </div>
                  ))}
                </CardContent>
              </Card>

              {/* Consumos */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Consumos Facturados (kWh)</CardTitle>
                  <CardDescription>
                    Consumo real por período
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="consumoP1">Período P1 (Punta) *</Label>
                    <Input
                      id="consumoP1"
                      type="number"
                      step="0.01"
                      placeholder="140"
                      required
                      value={formData.consumos.consumoP1}
                      onChange={(e) => updateFormData('consumos', 'consumoP1', e.target.value)}
                    />
                  </div>
                  
                  {['P2', 'P3', 'P4', 'P5', 'P6'].map((periodo, index) => (
                    <div key={periodo}>
                      <Label htmlFor={`consumo${periodo}`}>Período {periodo}</Label>
                      <Input
                        id={`consumo${periodo}`}
                        type="number"
                        step="0.01"
                        value={formData.consumos[`consumo${periodo}` as keyof typeof formData.consumos]}
                        onChange={(e) => updateFormData('consumos', `consumo${periodo}`, e.target.value)}
                      />
                    </div>
                  ))}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* TAB FACTURA ACTUAL */}
          <TabsContent value="factura" className="space-y-4">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              
              {/* Factura Electricidad */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Zap className="h-5 w-5" />
                    Factura Actual - Electricidad
                  </CardTitle>
                  <CardDescription>
                    Importes de la factura eléctrica actual
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="terminoFijoElectricidad">Término Fijo (€) *</Label>
                    <Input
                      id="terminoFijoElectricidad"
                      type="number"
                      step="0.01"
                      placeholder="15.50"
                      required={formData.electricidad.contrataElectricidad}
                      value={formData.facturaElectricidad.terminoFijo}
                      onChange={(e) => updateFormData('facturaElectricidad', 'terminoFijo', e.target.value)}
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="terminoVariableElectricidad">Término Variable (€) *</Label>
                    <Input
                      id="terminoVariableElectricidad"
                      type="number"
                      step="0.01"
                      placeholder="25.30"
                      required={formData.electricidad.contrataElectricidad}
                      value={formData.facturaElectricidad.terminoVariable}
                      onChange={(e) => updateFormData('facturaElectricidad', 'terminoVariable', e.target.value)}
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="excesoPotenciaElectricidad">Exceso de Potencia (€)</Label>
                    <Input
                      id="excesoPotenciaElectricidad"
                      type="number"
                      step="0.01"
                      placeholder="0.00"
                      value={formData.facturaElectricidad.excesoPotencia}
                      onChange={(e) => updateFormData('facturaElectricidad', 'excesoPotencia', e.target.value)}
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="impuestoElectricidad">Impuesto Electricidad (€) *</Label>
                    <Input
                      id="impuestoElectricidad"
                      type="number"
                      step="0.01"
                      placeholder="2.15"
                      required={formData.electricidad.contrataElectricidad}
                      value={formData.facturaElectricidad.impuesto}
                      onChange={(e) => updateFormData('facturaElectricidad', 'impuesto', e.target.value)}
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="ivaElectricidad">IVA Electricidad (€) *</Label>
                    <Input
                      id="ivaElectricidad"
                      type="number"
                      step="0.01"
                      placeholder="9.05"
                      required={formData.electricidad.contrataElectricidad}
                      value={formData.facturaElectricidad.iva}
                      onChange={(e) => updateFormData('facturaElectricidad', 'iva', e.target.value)}
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="totalElectricidad">Total Factura Electricidad (€) *</Label>
                    <Input
                      id="totalElectricidad"
                      type="number"
                      step="0.01"
                      placeholder="52.00"
                      required={formData.electricidad.contrataElectricidad}
                      value={formData.facturaElectricidad.total}
                      onChange={(e) => updateFormData('facturaElectricidad', 'total', e.target.value)}
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Factura Gas */}
              {formData.gas.contrataGas && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                      <Flame className="h-5 w-5" />
                      Factura Actual - Gas
                    </CardTitle>
                    <CardDescription>
                      Importes de la factura de gas actual
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <Label htmlFor="terminoFijoGas">Término Fijo Gas (€)</Label>
                      <Input
                        id="terminoFijoGas"
                        type="number"
                        step="0.01"
                        value={formData.facturaGas.terminoFijo}
                        onChange={(e) => updateFormData('facturaGas', 'terminoFijo', e.target.value)}
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor="terminoVariableGas">Término Variable Gas (€)</Label>
                      <Input
                        id="terminoVariableGas"
                        type="number"
                        step="0.01"
                        value={formData.facturaGas.terminoVariable}
                        onChange={(e) => updateFormData('facturaGas', 'terminoVariable', e.target.value)}
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor="impuestoGas">Impuesto Gas (€)</Label>
                      <Input
                        id="impuestoGas"
                        type="number"
                        step="0.01"
                        value={formData.facturaGas.impuesto}
                        onChange={(e) => updateFormData('facturaGas', 'impuesto', e.target.value)}
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor="ivaGas">IVA Gas (€)</Label>
                      <Input
                        id="ivaGas"
                        type="number"
                        step="0.01"
                        value={formData.facturaGas.iva}
                        onChange={(e) => updateFormData('facturaGas', 'iva', e.target.value)}
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor="totalGas">Total Factura Gas (€)</Label>
                      <Input
                        id="totalGas"
                        type="number"
                        step="0.01"
                        value={formData.facturaGas.total}
                        onChange={(e) => updateFormData('facturaGas', 'total', e.target.value)}
                      />
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          </TabsContent>
        </Tabs>

        {/* Notas adicionales */}
        <Card>
          <CardHeader>
            <CardTitle>Notas Adicionales</CardTitle>
            <CardDescription>
              Información extra para la comparativa (opcional)
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Textarea
              placeholder="Añade cualquier información adicional relevante para esta comparativa..."
              value={formData.metadatos.notas}
              onChange={(e) => updateFormData('metadatos', 'notas', e.target.value)}
              className="min-h-[80px]"
            />
          </CardContent>
        </Card>

        {/* Botón enviar */}
        <div className="flex justify-end space-x-4">
          <Button type="button" variant="outline" onClick={() => router.push('/')}>
            Cancelar
          </Button>
          <Button 
            type="submit" 
            disabled={loading}
            className="min-w-[150px]"
          >
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Calculando...
              </>
            ) : (
              <>
                <Calculator className="mr-2 h-4 w-4" />
                Calcular Comparativa
              </>
            )}
          </Button>
        </div>
      </div>
    </form>
  );
}
