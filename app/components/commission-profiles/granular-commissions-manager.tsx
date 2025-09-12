
'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { 
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  Plus, 
  Trash2, 
  Building, 
  FileText, 
  Target
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import { PerfilComision } from '@/types/users';

interface GranularCommissionsManagerProps {
  perfil: PerfilComision;
  comisionPrincipal: number;
  onClose: () => void;
}

interface Comercializadora {
  id: string;
  nombre: string;
  color?: string;
  logoUrl?: string;
}

export function GranularCommissionsManager({ perfil, comisionPrincipal, onClose }: GranularCommissionsManagerProps) {
  const [comercializadoras, setComerializadoras] = useState<Comercializadora[]>([]);
  const [ofertas, setOfertas] = useState<string[]>([]);
  
  // Estados para comisiones
  const [comisionesComercializadora, setComisionesComercializadora] = useState<any[]>([]);
  const [comisionesTarifa, setComisionesTarifa] = useState<any[]>([]);
  const [comisionesOferta, setComisionesOferta] = useState<any[]>([]);
  
  // Estados para formularios
  const [nuevaComisionComercializadora, setNuevaComisionComercializadora] = useState({
    comercializadoraId: '',
    porcentaje: 60
  });
  
  const [nuevaComisionTarifa, setNuevaComisionTarifa] = useState({
    tarifaAcceso: '',
    porcentaje: 60
  });
  
  const [nuevaComisionOferta, setNuevaComisionOferta] = useState({
    comercializadoraId: '',
    nombreOferta: '',
    tarifaAcceso: '',
    porcentaje: 60
  });

  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchComerializadoras();
    fetchComisiones();
    fetchOfertas();
  }, [perfil.id]);

  const fetchComerializadoras = async () => {
    try {
      const response = await fetch('/api/comercializadoras');
      const data = await response.json();
      if (response.ok) {
        setComerializadoras(data.comercializadoras.filter((c: any) => c.activa));
      }
    } catch (error) {
      console.error('Error fetching comercializadoras:', error);
    }
  };

  const fetchOfertas = async () => {
    try {
      const response = await fetch('/api/tarifas');
      const data = await response.json();
      if (response.ok) {
        const ofertasUnicas = [...new Set(data.tarifas.map((t: any) => t.nombreOferta))] as string[];
        setOfertas(ofertasUnicas);
      }
    } catch (error) {
      console.error('Error fetching ofertas:', error);
    }
  };

  const fetchComisiones = async () => {
    setLoading(true);
    try {
      // Fetch comisiones por comercializadora
      const respComercializadora = await fetch(`/api/comisiones-granulares/comercializadora?perfilComisionId=${perfil.id}`);
      if (respComercializadora.ok) {
        const dataComercializadora = await respComercializadora.json();
        setComisionesComercializadora(dataComercializadora.comisiones);
      }

      // Fetch comisiones por tarifa
      const respTarifa = await fetch(`/api/comisiones-granulares/tarifa?perfilComisionId=${perfil.id}`);
      if (respTarifa.ok) {
        const dataTarifa = await respTarifa.json();
        setComisionesTarifa(dataTarifa.comisiones);
      }

      // Fetch comisiones por oferta
      const respOferta = await fetch(`/api/comisiones-granulares/oferta?perfilComisionId=${perfil.id}`);
      if (respOferta.ok) {
        const dataOferta = await respOferta.json();
        setComisionesOferta(dataOferta.comisiones);
      }
    } catch (error) {
      console.error('Error fetching granular commissions:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddComisionComercializadora = async () => {
    if (!nuevaComisionComercializadora.comercializadoraId) {
      toast.error('Selecciona una comercializadora');
      return;
    }

    try {
      const response = await fetch('/api/comisiones-granulares/comercializadora', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          perfilComisionId: perfil.id,
          ...nuevaComisionComercializadora
        })
      });

      if (response.ok) {
        toast.success('Comisión agregada correctamente');
        setNuevaComisionComercializadora({ comercializadoraId: '', porcentaje: 60 });
        fetchComisiones();
      } else {
        const error = await response.json();
        toast.error(error.error || 'Error al agregar comisión');
      }
    } catch (error) {
      toast.error('Error de conexión');
    }
  };

  const handleAddComisionTarifa = async () => {
    if (!nuevaComisionTarifa.tarifaAcceso) {
      toast.error('Especifica la tarifa de acceso');
      return;
    }

    try {
      const response = await fetch('/api/comisiones-granulares/tarifa', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          perfilComisionId: perfil.id,
          ...nuevaComisionTarifa
        })
      });

      if (response.ok) {
        toast.success('Comisión agregada correctamente');
        setNuevaComisionTarifa({ tarifaAcceso: '', porcentaje: 60 });
        fetchComisiones();
      } else {
        const error = await response.json();
        toast.error(error.error || 'Error al agregar comisión');
      }
    } catch (error) {
      toast.error('Error de conexión');
    }
  };

  const handleAddComisionOferta = async () => {
    if (!nuevaComisionOferta.comercializadoraId || !nuevaComisionOferta.nombreOferta) {
      toast.error('Selecciona comercializadora y oferta');
      return;
    }

    try {
      const response = await fetch('/api/comisiones-granulares/oferta', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          perfilComisionId: perfil.id,
          ...nuevaComisionOferta,
          tarifaAcceso: nuevaComisionOferta.tarifaAcceso || undefined
        })
      });

      if (response.ok) {
        toast.success('Comisión agregada correctamente');
        setNuevaComisionOferta({ comercializadoraId: '', nombreOferta: '', tarifaAcceso: '', porcentaje: 60 });
        fetchComisiones();
      } else {
        const error = await response.json();
        toast.error(error.error || 'Error al agregar comisión');
      }
    } catch (error) {
      toast.error('Error de conexión');
    }
  };

  const handleDeleteComision = async (tipo: 'comercializadora' | 'tarifa' | 'oferta', params: any) => {
    try {
      const response = await fetch(`/api/comisiones-granulares/${tipo}`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(params)
      });

      if (response.ok) {
        toast.success('Comisión eliminada correctamente');
        fetchComisiones();
      } else {
        const error = await response.json();
        toast.error(error.error || 'Error al eliminar comisión');
      }
    } catch (error) {
      toast.error('Error de conexión');
    }
  };

  const calcularComisionReal = (porcentaje: number) => {
    return (comisionPrincipal * porcentaje / 100).toFixed(2);
  };

  const tarifasAcceso = ['2.0TD', '3.0TD', '6.1TD', '6.2TD', '6.3TD', '6.4TD'];

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-4 max-h-[70vh] overflow-y-auto">
      {/* Header Info */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">
            Perfil: {perfil.nombre} - Comisión Base: {perfil.porcentajeTotal}%
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            Comisión Principal del Sistema: <strong>{comisionPrincipal}%</strong> | 
            Comisión Real por Defecto: <strong>{calcularComisionReal(perfil.porcentajeTotal)}%</strong>
          </p>
        </CardContent>
      </Card>

      <Tabs defaultValue="comercializadora" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="comercializadora">Por Comercializadora</TabsTrigger>
          <TabsTrigger value="tarifa">Por Tarifa</TabsTrigger>
          <TabsTrigger value="oferta">Por Oferta</TabsTrigger>
        </TabsList>

        {/* Comisiones por Comercializadora */}
        <TabsContent value="comercializadora" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Building className="h-5 w-5" />
                Agregar Comisión por Comercializadora
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label>Comercializadora</Label>
                  <Select 
                    value={nuevaComisionComercializadora.comercializadoraId}
                    onValueChange={(value) => setNuevaComisionComercializadora({ 
                      ...nuevaComisionComercializadora, 
                      comercializadoraId: value 
                    })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Seleccionar..." />
                    </SelectTrigger>
                    <SelectContent>
                      {comercializadoras.map((comercializadora) => (
                        <SelectItem key={comercializadora.id} value={comercializadora.id}>
                          {comercializadora.nombre}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Porcentaje (%)</Label>
                  <Input
                    type="number"
                    min="0"
                    max="100"
                    step="0.1"
                    value={nuevaComisionComercializadora.porcentaje}
                    onChange={(e) => setNuevaComisionComercializadora({ 
                      ...nuevaComisionComercializadora, 
                      porcentaje: parseFloat(e.target.value) || 0 
                    })}
                  />
                  <p className="text-xs text-muted-foreground">
                    Comisión real: {calcularComisionReal(nuevaComisionComercializadora.porcentaje)}%
                  </p>
                </div>

                <div className="flex items-end">
                  <Button onClick={handleAddComisionComercializadora} className="w-full">
                    <Plus className="h-4 w-4 mr-2" />
                    Agregar
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Comisiones Configuradas</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Comercializadora</TableHead>
                    <TableHead>Porcentaje</TableHead>
                    <TableHead>Comisión Real</TableHead>
                    <TableHead>Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {comisionesComercializadora.map((comision) => (
                    <TableRow key={comision.id}>
                      <TableCell>
                        <div className="font-medium">{comision.comercializadora?.nombre}</div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">{comision.porcentaje}%</Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant="secondary">{calcularComisionReal(comision.porcentaje)}%</Badge>
                      </TableCell>
                      <TableCell>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button variant="ghost" size="sm">
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>¿Confirmar eliminación?</AlertDialogTitle>
                              <AlertDialogDescription>
                                Eliminar la comisión específica para {comision.comercializadora?.nombre}
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancelar</AlertDialogCancel>
                              <AlertDialogAction
                                onClick={() => handleDeleteComision('comercializadora', {
                                  perfilComisionId: perfil.id,
                                  comercializadoraId: comision.comercializadoraId
                                })}
                              >
                                Eliminar
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>

              {comisionesComercializadora.length === 0 && (
                <div className="text-center py-8 text-muted-foreground">
                  No hay comisiones por comercializadora configuradas
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Comisiones por Tarifa */}
        <TabsContent value="tarifa" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Agregar Comisión por Tarifa de Acceso
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label>Tarifa de Acceso</Label>
                  <Select 
                    value={nuevaComisionTarifa.tarifaAcceso}
                    onValueChange={(value) => setNuevaComisionTarifa({ 
                      ...nuevaComisionTarifa, 
                      tarifaAcceso: value 
                    })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Seleccionar..." />
                    </SelectTrigger>
                    <SelectContent>
                      {tarifasAcceso.map((tarifa) => (
                        <SelectItem key={tarifa} value={tarifa}>
                          {tarifa}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Porcentaje (%)</Label>
                  <Input
                    type="number"
                    min="0"
                    max="100"
                    step="0.1"
                    value={nuevaComisionTarifa.porcentaje}
                    onChange={(e) => setNuevaComisionTarifa({ 
                      ...nuevaComisionTarifa, 
                      porcentaje: parseFloat(e.target.value) || 0 
                    })}
                  />
                  <p className="text-xs text-muted-foreground">
                    Comisión real: {calcularComisionReal(nuevaComisionTarifa.porcentaje)}%
                  </p>
                </div>

                <div className="flex items-end">
                  <Button onClick={handleAddComisionTarifa} className="w-full">
                    <Plus className="h-4 w-4 mr-2" />
                    Agregar
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Comisiones Configuradas</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Tarifa de Acceso</TableHead>
                    <TableHead>Porcentaje</TableHead>
                    <TableHead>Comisión Real</TableHead>
                    <TableHead>Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {comisionesTarifa.map((comision) => (
                    <TableRow key={comision.id}>
                      <TableCell>
                        <Badge>{comision.tarifaAcceso}</Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">{comision.porcentaje}%</Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant="secondary">{calcularComisionReal(comision.porcentaje)}%</Badge>
                      </TableCell>
                      <TableCell>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button variant="ghost" size="sm">
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>¿Confirmar eliminación?</AlertDialogTitle>
                              <AlertDialogDescription>
                                Eliminar la comisión específica para la tarifa {comision.tarifaAcceso}
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancelar</AlertDialogCancel>
                              <AlertDialogAction
                                onClick={() => handleDeleteComision('tarifa', {
                                  perfilComisionId: perfil.id,
                                  tarifaAcceso: comision.tarifaAcceso
                                })}
                              >
                                Eliminar
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>

              {comisionesTarifa.length === 0 && (
                <div className="text-center py-8 text-muted-foreground">
                  No hay comisiones por tarifa configuradas
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Comisiones por Oferta */}
        <TabsContent value="oferta" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="h-5 w-5" />
                Agregar Comisión por Oferta Específica
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Comercializadora</Label>
                    <Select 
                      value={nuevaComisionOferta.comercializadoraId}
                      onValueChange={(value) => setNuevaComisionOferta({ 
                        ...nuevaComisionOferta, 
                        comercializadoraId: value 
                      })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Seleccionar..." />
                      </SelectTrigger>
                      <SelectContent>
                        {comercializadoras.map((comercializadora) => (
                          <SelectItem key={comercializadora.id} value={comercializadora.id}>
                            {comercializadora.nombre}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label>Nombre de la Oferta</Label>
                    <Select 
                      value={nuevaComisionOferta.nombreOferta}
                      onValueChange={(value) => setNuevaComisionOferta({ 
                        ...nuevaComisionOferta, 
                        nombreOferta: value 
                      })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Seleccionar..." />
                      </SelectTrigger>
                      <SelectContent>
                        {ofertas.map((oferta) => (
                          <SelectItem key={oferta} value={oferta}>
                            {oferta}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Tarifa Específica (Opcional)</Label>
                    <Select 
                      value={nuevaComisionOferta.tarifaAcceso}
                      onValueChange={(value) => setNuevaComisionOferta({ 
                        ...nuevaComisionOferta, 
                        tarifaAcceso: value 
                      })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Todas las tarifas" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="">Todas las tarifas</SelectItem>
                        {tarifasAcceso.map((tarifa) => (
                          <SelectItem key={tarifa} value={tarifa}>
                            {tarifa}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label>Porcentaje (%)</Label>
                    <Input
                      type="number"
                      min="0"
                      max="100"
                      step="0.1"
                      value={nuevaComisionOferta.porcentaje}
                      onChange={(e) => setNuevaComisionOferta({ 
                        ...nuevaComisionOferta, 
                        porcentaje: parseFloat(e.target.value) || 0 
                      })}
                    />
                    <p className="text-xs text-muted-foreground">
                      Comisión real: {calcularComisionReal(nuevaComisionOferta.porcentaje)}%
                    </p>
                  </div>
                </div>

                <Button onClick={handleAddComisionOferta} className="w-full">
                  <Plus className="h-4 w-4 mr-2" />
                  Agregar Comisión por Oferta
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Comisiones Configuradas</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Comercializadora</TableHead>
                    <TableHead>Oferta</TableHead>
                    <TableHead>Tarifa</TableHead>
                    <TableHead>Porcentaje</TableHead>
                    <TableHead>Comisión Real</TableHead>
                    <TableHead>Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {comisionesOferta.map((comision) => (
                    <TableRow key={comision.id}>
                      <TableCell>
                        <div className="font-medium">{comision.comercializadora?.nombre}</div>
                      </TableCell>
                      <TableCell>{comision.nombreOferta}</TableCell>
                      <TableCell>
                        {comision.tarifaAcceso ? (
                          <Badge>{comision.tarifaAcceso}</Badge>
                        ) : (
                          <span className="text-muted-foreground">Todas</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">{comision.porcentaje}%</Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant="secondary">{calcularComisionReal(comision.porcentaje)}%</Badge>
                      </TableCell>
                      <TableCell>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button variant="ghost" size="sm">
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>¿Confirmar eliminación?</AlertDialogTitle>
                              <AlertDialogDescription>
                                Eliminar la comisión específica para {comision.nombreOferta}
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancelar</AlertDialogCancel>
                              <AlertDialogAction
                                onClick={() => handleDeleteComision('oferta', {
                                  perfilComisionId: perfil.id,
                                  comercializadoraId: comision.comercializadoraId,
                                  nombreOferta: comision.nombreOferta,
                                  tarifaAcceso: comision.tarifaAcceso
                                })}
                              >
                                Eliminar
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>

              {comisionesOferta.length === 0 && (
                <div className="text-center py-8 text-muted-foreground">
                  No hay comisiones por oferta configuradas
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <div className="flex justify-end">
        <Button onClick={onClose}>Cerrar</Button>
      </div>
    </div>
  );
}
