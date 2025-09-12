
export interface User {
  id: string;
  name?: string | null;
  email: string;
  emailVerified?: Date | null;
  image?: string | null;
  password?: string | null;
  username?: string | null;
  tipoUsuario: 'regular' | 'agente_con_login' | 'agente_sin_login' | 'admin';
  perfilComisionId?: string | null;
  activo: boolean;
  telefono?: string | null;
  observaciones?: string | null;
  fechaAlta: Date;
  ultimoAcceso?: Date | null;
  createdAt: Date;
  updatedAt: Date;
  perfilComision?: PerfilComision | null;
}

export interface PerfilComision {
  id: string;
  nombre: string;
  descripcion?: string | null;
  porcentajeTotal: number;
  activo: boolean;
  createdAt: Date;
  updatedAt: Date;
  usuarios?: User[];
  comisiones_comercializadora?: ComisionComercializadora[];
  comisiones_tarifa?: ComisionTarifa[];
  comisiones_oferta?: ComisionOferta[];
  _count?: {
    usuarios: number;
    comisiones_comercializadora: number;
    comisiones_tarifa: number;
    comisiones_oferta: number;
  };
}

export interface ComisionPrincipal {
  id: string;
  porcentajeBase: number;
  activo: boolean;
  fechaActivacion: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface ComisionComercializadora {
  id: string;
  perfilComisionId: string;
  comercializadoraId: string;
  porcentaje: number;
  activo: boolean;
  createdAt: Date;
  updatedAt: Date;
  perfilComision?: PerfilComision;
  comercializadora?: any; // Referencia a comercializadora
}

export interface ComisionTarifa {
  id: string;
  perfilComisionId: string;
  tarifaAcceso: string;
  porcentaje: number;
  activo: boolean;
  createdAt: Date;
  updatedAt: Date;
  perfilComision?: PerfilComision;
}

export interface ComisionOferta {
  id: string;
  perfilComisionId: string;
  comercializadoraId: string;
  nombreOferta: string;
  tarifaAcceso?: string | null;
  porcentaje: number;
  activo: boolean;
  createdAt: Date;
  updatedAt: Date;
  perfilComision?: PerfilComision;
  comercializadora?: any;
}

export interface Venta {
  id: string;
  comparativaId: string;
  usuarioId: string;
  clienteId: string;
  tarifaSeleccionadaId: string;
  importeAnual: number;
  comisionCalculada: number;
  porcentajeAplicado: number;
  tipoComision: 'total' | 'comercializadora' | 'tarifa' | 'oferta';
  fechaVenta: Date;
  estadoVenta: 'pendiente' | 'confirmada' | 'cancelada';
  observaciones?: string | null;
  createdAt: Date;
  updatedAt: Date;
  usuario?: User;
  comparativa?: any;
  tarifaSeleccionada?: any;
  comisiones_detalle?: ComisionVenta[];
}

export interface ComisionVenta {
  id: string;
  ventaId: string;
  usuarioId: string;
  importeComision: number;
  porcentaje: number;
  fechaPago?: Date | null;
  estadoPago: 'pendiente' | 'pagado' | 'cancelado';
  observaciones?: string | null;
  createdAt: Date;
  updatedAt: Date;
  venta?: Venta;
  usuario?: User;
}

// DTOs para las API
export interface CreateUserDTO {
  name?: string;
  email: string;
  username?: string;
  password?: string;
  tipoUsuario: 'regular' | 'agente_con_login' | 'agente_sin_login' | 'admin';
  perfilComisionId?: string;
  telefono?: string;
  observaciones?: string;
}

export interface UpdateUserDTO {
  name?: string;
  email?: string;
  username?: string;
  password?: string;
  tipoUsuario?: 'regular' | 'agente_con_login' | 'agente_sin_login' | 'admin';
  perfilComisionId?: string;
  activo?: boolean;
  telefono?: string;
  observaciones?: string;
}

export interface CreatePerfilComisionDTO {
  nombre: string;
  descripcion?: string;
  porcentajeTotal: number;
}

export interface UpdatePerfilComisionDTO {
  nombre?: string;
  descripcion?: string;
  porcentajeTotal?: number;
  activo?: boolean;
}

export interface ComisionCalculationResult {
  porcentaje: number;
  importeComision: number;
  tipoComision: 'total' | 'comercializadora' | 'tarifa' | 'oferta';
  detalleRegla: string;
}

export interface UserWithComisiones extends User {
  ventasRealizadas: number;
  comisionesTotales: number;
  comisionesPendientes: number;
  ultimaVenta?: Date;
}
