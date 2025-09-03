
// Tipos para la aplicación de comparativas de energía

export interface Comercializadora {
  id: string;
  nombre: string;
  activa: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface Oferta {
  id: string;
  comercializadoraId: string;
  nombre: string;
  tarifa: string;
  tipo: string;
  precioEnergia: number;
  precioTermino: number;
  descripcion?: string | null;
  activa: boolean;
  
  // Reglas de comisión
  comisionTipo: string;
  comisionMinimo: number;
  comisionMaximo?: number | null;
  comisionValor: number;
  
  createdAt: Date;
  updatedAt: Date;
  
  comercializadora?: Comercializadora;
}

export interface Cliente {
  id: string;
  nombre: string;
  cif?: string;
  direccion?: string;
  telefono?: string;
  email?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Comparativa {
  id: string;
  clienteId: string;
  consumoAnual: number;
  potenciaContratada: number;
  tarifaActual: string;
  importeActual: number;
  titulo?: string;
  notas?: string;
  createdAt: Date;
  updatedAt: Date;
  
  cliente?: Cliente;
  ofertas?: ComparativaOferta[];
}

export interface ComparativaOferta {
  id: string;
  comparativaId: string;
  ofertaId: string;
  importeCalculado: number;
  ahorroAnual: number;
  comisionGanada: number;
  createdAt: Date;
  
  oferta?: Oferta;
}

// Tipos para formularios
export interface DatosEntrada {
  cliente: {
    nombre: string;
    cif?: string;
    direccion?: string;
    telefono?: string;
    email?: string;
  };
  consumo: {
    consumoAnual: number;
    potenciaContratada: number;
    tarifaActual: string;
    importeActual: number;
  };
  titulo?: string;
  notas?: string;
}

// Tipo para resultado de comparativa
export interface ResultadoComparativa extends ComparativaOferta {
  comercializadora: string;
  nombreOferta: string;
  tipoOferta: string;
  ahorroPercentaje: number;
}
