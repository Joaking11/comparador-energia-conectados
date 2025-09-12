
'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
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
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger 
} from '@/components/ui/dialog';
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
import { 
  Award, 
  Plus, 
  Edit, 
  Trash2, 
  Users,
  Settings,
  TrendingUp
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import { PerfilComision, CreatePerfilComisionDTO } from '@/types/users';
import { CommissionProfileForm } from './commission-profile-form';
import { GranularCommissionsManager } from './granular-commissions-manager';

export function CommissionProfileDashboard() {
  const [perfiles, setPerfiles] = useState<PerfilComision[]>([]);
  const [selectedPerfil, setSelectedPerfil] = useState<PerfilComision | null>(null);
  const [loading, setLoading] = useState(true);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isGranularModalOpen, setIsGranularModalOpen] = useState(false);
  const [comisionPrincipal, setComisionPrincipal] = useState<number>(10);
  const [isEditingComisionPrincipal, setIsEditingComisionPrincipal] = useState(false);

  useEffect(() => {
    fetchPerfiles();
    fetchComisionPrincipal();
  }, []);

  const fetchPerfiles = async () => {
    try {
      const response = await fetch('/api/perfiles-comision?includeInactive=true');
      const data = await response.json();

      if (response.ok) {
        setPerfiles(data.perfiles);
      } else {
        toast.error('Error al cargar perfiles de comisión');
      }
    } catch (error) {
      toast.error('Error de conexión');
    } finally {
      setLoading(false);
    }
  };

  const fetchComisionPrincipal = async () => {
    try {
      const response = await fetch('/api/comision-principal');
      const data = await response.json();

      if (response.ok) {
        setComisionPrincipal(data.comision.porcentajeBase);
      }
    } catch (error) {
      console.error('Error fetching main commission:', error);
    }
  };

  const handleCreatePerfil = async (perfilData: CreatePerfilComisionDTO) => {
    try {
      const response = await fetch('/api/perfiles-comision', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(perfilData)
      });

      if (response.ok) {
        toast.success('Perfil de comisión creado correctamente');
        setIsCreateModalOpen(false);
        fetchPerfiles();
      } else {
        const error = await response.json();
        toast.error(error.error || 'Error al crear perfil');
      }
    } catch (error) {
      toast.error('Error de conexión');
    }
  };

  const handleEditPerfil = async (perfilData: CreatePerfilComisionDTO) => {
    if (!selectedPerfil) return;

    try {
      const response = await fetch(`/api/perfiles-comision/${selectedPerfil.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(perfilData)
      });

      if (response.ok) {
        toast.success('Perfil actualizado correctamente');
        setIsEditModalOpen(false);
        setSelectedPerfil(null);
        fetchPerfiles();
      } else {
        const error = await response.json();
        toast.error(error.error || 'Error al actualizar perfil');
      }
    } catch (error) {
      toast.error('Error de conexión');
    }
  };

  const handleDeletePerfil = async (perfilId: string) => {
    try {
      const response = await fetch(`/api/perfiles-comision/${perfilId}`, {
        method: 'DELETE'
      });

      const result = await response.json();

      if (response.ok) {
        toast.success(result.message || 'Perfil eliminado correctamente');
        fetchPerfiles();
      } else {
        toast.error(result.error || 'Error al eliminar perfil');
      }
    } catch (error) {
      toast.error('Error de conexión');
    }
  };

  const handleUpdateComisionPrincipal = async (nuevoPorcentaje: number) => {
    try {
      const response = await fetch('/api/comision-principal', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ porcentajeBase: nuevoPorcentaje })
      });

      if (response.ok) {
        toast.success('Comisión principal actualizada correctamente');
        setComisionPrincipal(nuevoPorcentaje);
        setIsEditingComisionPrincipal(false);
      } else {
        const error = await response.json();
        toast.error(error.error || 'Error al actualizar comisión principal');
      }
    } catch (error) {
      toast.error('Error de conexión');
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Perfiles de Comisión</h1>
          <p className="text-muted-foreground mt-2">
            Gestiona perfiles y configura comisiones granulares
          </p>
        </div>
        
        <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2">
              <Plus className="h-4 w-4" />
              Nuevo Perfil
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Crear Nuevo Perfil de Comisión</DialogTitle>
              <DialogDescription>
                Define un nuevo perfil con sus porcentajes de comisión
              </DialogDescription>
            </DialogHeader>
            <CommissionProfileForm
              onSubmit={handleCreatePerfil}
              onCancel={() => setIsCreateModalOpen(false)}
            />
          </DialogContent>
        </Dialog>
      </div>

      <Tabs defaultValue="perfiles" className="w-full">
        <TabsList>
          <TabsTrigger value="perfiles" onClick={() => {}}>Perfiles de Comisión</TabsTrigger>
          <TabsTrigger value="configuracion" onClick={() => {}}>Configuración Global</TabsTrigger>
        </TabsList>

        {/* Perfiles */}
        <TabsContent value="perfiles" className="space-y-4">
          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Total Perfiles</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{perfiles.length}</div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Perfiles Activos</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">
                  {perfiles.filter(p => p.activo).length}
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Usuarios Asignados</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-blue-600">
                  {perfiles.reduce((total, p) => total + (p._count?.usuarios || 0), 0)}
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Comisión Principal</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-purple-600">
                  {comisionPrincipal}%
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Perfiles Table */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Award className="h-5 w-5" />
                Lista de Perfiles
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nombre</TableHead>
                    <TableHead>Descripción</TableHead>
                    <TableHead>Porcentaje Base</TableHead>
                    <TableHead>Usuarios</TableHead>
                    <TableHead>Estado</TableHead>
                    <TableHead>Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {perfiles.map((perfil) => (
                    <TableRow key={perfil.id}>
                      <TableCell>
                        <div className="font-medium">{perfil.nombre}</div>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm text-muted-foreground max-w-xs truncate">
                          {perfil.descripcion || 'Sin descripción'}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">
                          {perfil.porcentajeTotal}%
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <Users className="h-4 w-4" />
                          <span>{perfil._count?.usuarios || 0}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant={perfil.activo ? 'default' : 'secondary'}>
                          {perfil.activo ? 'Activo' : 'Inactivo'}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              setSelectedPerfil(perfil);
                              setIsGranularModalOpen(true);
                            }}
                            title="Configurar comisiones granulares"
                          >
                            <Settings className="h-4 w-4" />
                          </Button>
                          
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              setSelectedPerfil(perfil);
                              setIsEditModalOpen(true);
                            }}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>

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
                                  Esta acción eliminará el perfil {perfil.nombre}. 
                                  Si tiene usuarios asociados, solo se desactivará.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancelar</AlertDialogCancel>
                                <AlertDialogAction
                                  onClick={() => handleDeletePerfil(perfil.id)}
                                  className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                >
                                  Eliminar
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>

              {perfiles.length === 0 && (
                <div className="text-center py-8 text-muted-foreground">
                  No hay perfiles de comisión creados
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Configuración Global */}
        <TabsContent value="configuracion" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                Comisión Principal del Sistema
              </CardTitle>
              <CardDescription>
                Esta es la comisión base sobre la cual se calculan todas las comisiones de los perfiles
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div>
                    <p className="font-medium">Porcentaje Actual</p>
                    <p className="text-sm text-muted-foreground">
                      Todas las comisiones se calculan sobre este porcentaje
                    </p>
                  </div>
                  <div className="text-right">
                    <div className="text-3xl font-bold text-primary">
                      {comisionPrincipal}%
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setIsEditingComisionPrincipal(true)}
                      className="mt-2"
                    >
                      Modificar
                    </Button>
                  </div>
                </div>

                <div className="p-4 bg-muted rounded-lg">
                  <h4 className="font-medium mb-2">Ejemplo de Cálculo:</h4>
                  <p className="text-sm text-muted-foreground mb-2">
                    Si la comisión principal es <strong>{comisionPrincipal}%</strong> y un perfil tiene <strong>60%</strong>:
                  </p>
                  <p className="text-sm">
                    Comisión real = {comisionPrincipal}% × 60% = <strong>{(comisionPrincipal * 0.6).toFixed(1)}%</strong>
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Jerarquía de Aplicación de Comisiones</CardTitle>
              <CardDescription>
                El sistema aplica las comisiones siguiendo esta jerarquía (de más específica a menos específica)
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center gap-3 p-3 border rounded-lg">
                  <div className="bg-primary text-primary-foreground rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold">
                    1
                  </div>
                  <div>
                    <p className="font-medium">Oferta específica</p>
                    <p className="text-sm text-muted-foreground">
                      Comisión para una oferta y tarifa de acceso exacta
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3 p-3 border rounded-lg">
                  <div className="bg-secondary text-secondary-foreground rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold">
                    2
                  </div>
                  <div>
                    <p className="font-medium">Tarifa de acceso</p>
                    <p className="text-sm text-muted-foreground">
                      Comisión para un tipo de tarifa (2.0TD, 3.0TD, 6.1TD, etc.)
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3 p-3 border rounded-lg">
                  <div className="bg-muted text-muted-foreground rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold">
                    3
                  </div>
                  <div>
                    <p className="font-medium">Comercializadora</p>
                    <p className="text-sm text-muted-foreground">
                      Comisión para todas las ofertas de una comercializadora específica
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3 p-3 border rounded-lg">
                  <div className="bg-muted-foreground text-background rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold">
                    4
                  </div>
                  <div>
                    <p className="font-medium">Comisión base del perfil</p>
                    <p className="text-sm text-muted-foreground">
                      Porcentaje por defecto del perfil si no hay reglas específicas
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Edit Modal */}
      {selectedPerfil && (
        <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Editar Perfil de Comisión</DialogTitle>
              <DialogDescription>
                Modifica los datos de {selectedPerfil.nombre}
              </DialogDescription>
            </DialogHeader>
            <CommissionProfileForm
              perfil={selectedPerfil}
              onSubmit={handleEditPerfil}
              onCancel={() => {
                setIsEditModalOpen(false);
                setSelectedPerfil(null);
              }}
            />
          </DialogContent>
        </Dialog>
      )}

      {/* Granular Commissions Modal */}
      {selectedPerfil && (
        <Dialog open={isGranularModalOpen} onOpenChange={setIsGranularModalOpen}>
          <DialogContent className="max-w-6xl max-h-[90vh] overflow-hidden">
            <DialogHeader>
              <DialogTitle>Comisiones Granulares - {selectedPerfil.nombre}</DialogTitle>
              <DialogDescription>
                Configura comisiones específicas por comercializadora, tarifa u oferta
              </DialogDescription>
            </DialogHeader>
            <GranularCommissionsManager
              perfil={selectedPerfil}
              comisionPrincipal={comisionPrincipal}
              onClose={() => {
                setIsGranularModalOpen(false);
                setSelectedPerfil(null);
              }}
            />
          </DialogContent>
        </Dialog>
      )}

      {/* Edit Main Commission Modal */}
      <Dialog open={isEditingComisionPrincipal} onOpenChange={setIsEditingComisionPrincipal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Modificar Comisión Principal</DialogTitle>
            <DialogDescription>
              Cambiar la comisión principal afectará a todos los cálculos del sistema
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="nuevaComision">Nuevo Porcentaje (%)</Label>
              <Input
                id="nuevaComision"
                type="number"
                min="0"
                max="100"
                step="0.1"
                defaultValue={comisionPrincipal}
                placeholder="Ej: 10.5"
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    const valor = parseFloat((e.target as HTMLInputElement).value);
                    if (valor >= 0 && valor <= 100) {
                      handleUpdateComisionPrincipal(valor);
                    }
                  }
                }}
              />
            </div>
            
            <div className="flex justify-end gap-2">
              <Button 
                variant="outline" 
                onClick={() => setIsEditingComisionPrincipal(false)}
              >
                Cancelar
              </Button>
              <Button
                onClick={() => {
                  const input = document.getElementById('nuevaComision') as HTMLInputElement;
                  const valor = parseFloat(input.value);
                  if (valor >= 0 && valor <= 100) {
                    handleUpdateComisionPrincipal(valor);
                  } else {
                    toast.error('El porcentaje debe estar entre 0 y 100');
                  }
                }}
              >
                Actualizar
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
