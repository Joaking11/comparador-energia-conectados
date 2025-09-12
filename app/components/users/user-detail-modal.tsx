
'use client';

import { useState, useEffect } from 'react';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle 
} from '@/components/ui/dialog';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  User as UserIcon, 
  Mail, 
  Phone, 
  Calendar, 
  TrendingUp, 
  Euro,
  Award
} from 'lucide-react';
import { User } from '@/types/users';

interface UserDetailModalProps {
  user: User;
  isOpen: boolean;
  onClose: () => void;
}

interface CommissionSummary {
  resumen: {
    totalComisiones: number;
    comisionesPendientes: number;
    comisionesPagadas: number;
    totalVentas: number;
    ventasPorComercializadora: Record<string, number>;
    ventasPorTipoComision: Record<string, number>;
  };
  detalleComisiones: any[];
}

export function UserDetailModal({ user, isOpen, onClose }: UserDetailModalProps) {
  const [commissionSummary, setCommissionSummary] = useState<CommissionSummary | null>(null);
  const [loadingCommissions, setLoadingCommissions] = useState(false);

  useEffect(() => {
    if (isOpen && user) {
      fetchCommissionSummary();
    }
  }, [isOpen, user]);

  const fetchCommissionSummary = async () => {
    if (!user?.id) return;
    
    setLoadingCommissions(true);
    try {
      const response = await fetch(`/api/reportes/comisiones?usuarioId=${user.id}`);
      if (response.ok) {
        const data = await response.json();
        setCommissionSummary(data.reporte);
      }
    } catch (error) {
      console.error('Error fetching commission summary:', error);
    } finally {
      setLoadingCommissions(false);
    }
  };

  const getTipoUsuarioInfo = (tipo: string) => {
    const info: Record<string, { label: string; description: string; variant: 'default' | 'secondary' | 'destructive' | 'outline' }> = {
      'admin': { 
        label: 'Administrador', 
        description: 'Acceso completo al sistema',
        variant: 'destructive' 
      },
      'regular': { 
        label: 'Usuario Regular', 
        description: 'Acceso básico al sistema',
        variant: 'default' 
      },
      'agente_con_login': { 
        label: 'Agente con Login', 
        description: 'Puede acceder al sistema y ver comisiones',
        variant: 'secondary' 
      },
      'agente_sin_login': { 
        label: 'Agente sin Login', 
        description: 'Solo aparece en reportes',
        variant: 'outline' 
      }
    };

    return info[tipo] || { label: tipo, description: 'Tipo desconocido', variant: 'default' };
  };

  const tipoInfo = getTipoUsuarioInfo(user.tipoUsuario);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <UserIcon className="h-5 w-5" />
            Detalles del Usuario
          </DialogTitle>
        </DialogHeader>

        <Tabs defaultValue="general" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="general">Información General</TabsTrigger>
            <TabsTrigger value="comisiones">Comisiones</TabsTrigger>
            <TabsTrigger value="perfil">Perfil de Comisión</TabsTrigger>
          </TabsList>

          {/* Información General */}
          <TabsContent value="general" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Datos Básicos */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Datos Básicos</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center gap-2">
                    <UserIcon className="h-4 w-4 text-muted-foreground" />
                    <span className="font-medium">{user.name || 'Sin nombre'}</span>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <Mail className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">{user.email}</span>
                  </div>

                  {user.username && (
                    <div className="flex items-center gap-2">
                      <span className="text-sm">@{user.username}</span>
                    </div>
                  )}

                  {user.telefono && (
                    <div className="flex items-center gap-2">
                      <Phone className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm">{user.telefono}</span>
                    </div>
                  )}

                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">
                      Registrado: {new Date(user.fechaAlta).toLocaleDateString()}
                    </span>
                  </div>

                  {user.ultimoAcceso && (
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm">
                        Último acceso: {new Date(user.ultimoAcceso).toLocaleDateString()}
                      </span>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Configuración */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Configuración</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div>
                    <span className="text-sm text-muted-foreground">Tipo de Usuario</span>
                    <div className="mt-1">
                      <Badge variant={tipoInfo.variant}>{tipoInfo.label}</Badge>
                      <p className="text-xs text-muted-foreground mt-1">{tipoInfo.description}</p>
                    </div>
                  </div>

                  <div>
                    <span className="text-sm text-muted-foreground">Estado</span>
                    <div className="mt-1">
                      <Badge variant={user.activo ? 'default' : 'secondary'}>
                        {user.activo ? 'Activo' : 'Inactivo'}
                      </Badge>
                    </div>
                  </div>

                  <div>
                    <span className="text-sm text-muted-foreground">Perfil de Comisión</span>
                    <div className="mt-1">
                      {user.perfilComision ? (
                        <div>
                          <Badge variant="outline">{user.perfilComision.nombre}</Badge>
                          <p className="text-xs text-muted-foreground mt-1">
                            {user.perfilComision.porcentajeTotal}% de comisión base
                          </p>
                        </div>
                      ) : (
                        <span className="text-sm text-muted-foreground">Sin perfil asignado</span>
                      )}
                    </div>
                  </div>

                  {user.observaciones && (
                    <div>
                      <span className="text-sm text-muted-foreground">Observaciones</span>
                      <p className="text-sm mt-1 p-2 bg-muted rounded text-muted-foreground">
                        {user.observaciones}
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Comisiones */}
          <TabsContent value="comisiones" className="space-y-4">
            {loadingCommissions ? (
              <div className="flex justify-center items-center h-32">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
              </div>
            ) : commissionSummary ? (
              <div className="space-y-4">
                {/* Resumen de Comisiones */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm font-medium flex items-center gap-1">
                        <Euro className="h-4 w-4" />
                        Total Comisiones
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">
                        {commissionSummary.resumen.totalComisiones.toFixed(2)}€
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm font-medium flex items-center gap-1">
                        <TrendingUp className="h-4 w-4" />
                        Total Ventas
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold text-blue-600">
                        {commissionSummary.resumen.totalVentas}
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm font-medium">Pendientes</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold text-orange-600">
                        {commissionSummary.resumen.comisionesPendientes.toFixed(2)}€
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm font-medium">Pagadas</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold text-green-600">
                        {commissionSummary.resumen.comisionesPagadas.toFixed(2)}€
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Ventas por Comercializadora */}
                {Object.keys(commissionSummary.resumen.ventasPorComercializadora).length > 0 && (
                  <Card>
                    <CardHeader>
                      <CardTitle>Ventas por Comercializadora</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        {Object.entries(commissionSummary.resumen.ventasPorComercializadora).map(([comercializadora, ventas]) => (
                          <div key={comercializadora} className="flex justify-between items-center p-2 bg-muted rounded">
                            <span className="font-medium">{comercializadora}</span>
                            <Badge variant="secondary">{ventas} ventas</Badge>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* Ventas por Tipo de Comisión */}
                {Object.keys(commissionSummary.resumen.ventasPorTipoComision).length > 0 && (
                  <Card>
                    <CardHeader>
                      <CardTitle>Ventas por Tipo de Comisión</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        {Object.entries(commissionSummary.resumen.ventasPorTipoComision).map(([tipo, ventas]) => {
                          const tipoLabels: Record<string, string> = {
                            'total': 'Comisión General',
                            'comercializadora': 'Comisión por Comercializadora',
                            'tarifa': 'Comisión por Tarifa',
                            'oferta': 'Comisión por Oferta Específica'
                          };
                          
                          return (
                            <div key={tipo} className="flex justify-between items-center p-2 bg-muted rounded">
                              <span className="font-medium">{tipoLabels[tipo] || tipo}</span>
                              <Badge variant="outline">{ventas} ventas</Badge>
                            </div>
                          );
                        })}
                      </div>
                    </CardContent>
                  </Card>
                )}
              </div>
            ) : (
              <Card>
                <CardContent className="flex flex-col items-center justify-center h-32">
                  <Award className="h-8 w-8 text-muted-foreground mb-2" />
                  <p className="text-muted-foreground">No hay datos de comisiones disponibles</p>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* Perfil de Comisión */}
          <TabsContent value="perfil" className="space-y-4">
            {user.perfilComision ? (
              <div className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle>{user.perfilComision.nombre}</CardTitle>
                    <CardDescription>
                      {user.perfilComision.descripcion || 'Sin descripción'}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="text-sm">Porcentaje Base:</span>
                        <Badge variant="outline">{user.perfilComision.porcentajeTotal}%</Badge>
                      </div>
                      
                      <div className="flex justify-between items-center">
                        <span className="text-sm">Estado:</span>
                        <Badge variant={user.perfilComision.activo ? 'default' : 'secondary'}>
                          {user.perfilComision.activo ? 'Activo' : 'Inactivo'}
                        </Badge>
                      </div>

                      <div className="flex justify-between items-center">
                        <span className="text-sm">Creado:</span>
                        <span className="text-sm text-muted-foreground">
                          {new Date(user.perfilComision.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Información sobre Comisiones Granulares</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-sm text-muted-foreground space-y-2">
                      <p>Este perfil puede tener configuradas comisiones específicas que se aplicarán siguiendo esta jerarquía:</p>
                      <ol className="list-decimal list-inside space-y-1 ml-2">
                        <li><strong>Oferta específica:</strong> Comisión para una oferta y tarifa exacta</li>
                        <li><strong>Tarifa de acceso:</strong> Comisión para un tipo de tarifa (2.0TD, 3.0TD, etc.)</li>
                        <li><strong>Comercializadora:</strong> Comisión para todas las ofertas de una comercializadora</li>
                        <li><strong>Comisión base:</strong> Porcentaje por defecto ({user.perfilComision.porcentajeTotal}%)</li>
                      </ol>
                      <p className="mt-3 p-2 bg-muted rounded">
                        <strong>Nota:</strong> Todas las comisiones se calculan sobre la comisión principal del sistema.
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </div>
            ) : (
              <Card>
                <CardContent className="flex flex-col items-center justify-center h-32">
                  <Award className="h-8 w-8 text-muted-foreground mb-2" />
                  <p className="text-muted-foreground">Este usuario no tiene perfil de comisión asignado</p>
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
