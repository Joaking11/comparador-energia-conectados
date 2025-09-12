
import { prisma } from './db';
import { ComisionCalculationResult } from '@/types/users';

export interface ComisionInput {
  usuarioId: string;
  comercializadoraId: string;
  nombreOferta: string;
  tarifaAcceso: string;
  importeAnual: number;
}

export class ComissionCalculator {
  
  /**
   * Calcula la comisión para un usuario específico siguiendo la jerarquía:
   * 1. Oferta específica
   * 2. Tarifa de acceso
   * 3. Comercializadora
   * 4. Total (por defecto)
   */
  static async calculateCommission(input: ComisionInput): Promise<ComisionCalculationResult> {
    const { usuarioId, comercializadoraId, nombreOferta, tarifaAcceso, importeAnual } = input;

    // 1. Obtener el perfil de comisión del usuario
    const usuario = await prisma.users.findUnique({
      where: { id: usuarioId },
      include: {
        perfilComision: {
          include: {
            comisiones_oferta: {
              where: { activo: true }
            },
            comisiones_tarifa: {
              where: { activo: true }
            },
            comisiones_comercializadora: {
              where: { activo: true }
            }
          }
        }
      }
    });

    if (!usuario || !usuario.perfilComision) {
      throw new Error('Usuario no encontrado o sin perfil de comisión asignado');
    }

    const perfil = usuario.perfilComision;

    // 2. Obtener la comisión principal del sistema
    const comisionPrincipal = await prisma.comision_principal.findFirst({
      where: { activo: true },
      orderBy: { fechaActivacion: 'desc' }
    });

    if (!comisionPrincipal) {
      throw new Error('No hay comisión principal configurada en el sistema');
    }

    // 3. Buscar comisión específica por oferta (más específica)
    const comisionOferta = perfil.comisiones_oferta.find(co => 
      co.comercializadoraId === comercializadoraId && 
      co.nombreOferta === nombreOferta &&
      (co.tarifaAcceso === tarifaAcceso || co.tarifaAcceso === null)
    );

    if (comisionOferta) {
      const porcentajeFinal = (comisionPrincipal.porcentajeBase / 100) * (comisionOferta.porcentaje / 100);
      return {
        porcentaje: comisionOferta.porcentaje,
        importeComision: importeAnual * porcentajeFinal,
        tipoComision: 'oferta',
        detalleRegla: `Oferta específica: ${nombreOferta} (${comisionOferta.porcentaje}% del ${comisionPrincipal.porcentajeBase}% principal)`
      };
    }

    // 4. Buscar comisión por tarifa de acceso
    const comisionTarifa = perfil.comisiones_tarifa.find(ct => 
      ct.tarifaAcceso === tarifaAcceso
    );

    if (comisionTarifa) {
      const porcentajeFinal = (comisionPrincipal.porcentajeBase / 100) * (comisionTarifa.porcentaje / 100);
      return {
        porcentaje: comisionTarifa.porcentaje,
        importeComision: importeAnual * porcentajeFinal,
        tipoComision: 'tarifa',
        detalleRegla: `Tarifa específica: ${tarifaAcceso} (${comisionTarifa.porcentaje}% del ${comisionPrincipal.porcentajeBase}% principal)`
      };
    }

    // 5. Buscar comisión por comercializadora
    const comisionComercializadora = perfil.comisiones_comercializadora.find(cc => 
      cc.comercializadoraId === comercializadoraId
    );

    if (comisionComercializadora) {
      const porcentajeFinal = (comisionPrincipal.porcentajeBase / 100) * (comisionComercializadora.porcentaje / 100);
      return {
        porcentaje: comisionComercializadora.porcentaje,
        importeComision: importeAnual * porcentajeFinal,
        tipoComision: 'comercializadora',
        detalleRegla: `Comercializadora específica (${comisionComercializadora.porcentaje}% del ${comisionPrincipal.porcentajeBase}% principal)`
      };
    }

    // 6. Usar comisión total por defecto
    const porcentajeFinal = (comisionPrincipal.porcentajeBase / 100) * (perfil.porcentajeTotal / 100);
    return {
      porcentaje: perfil.porcentajeTotal,
      importeComision: importeAnual * porcentajeFinal,
      tipoComision: 'total',
      detalleRegla: `Comisión por defecto del perfil (${perfil.porcentajeTotal}% del ${comisionPrincipal.porcentajeBase}% principal)`
    };
  }

  /**
   * Registra una venta y calcula automáticamente las comisiones
   */
  static async registerSale(
    comparativaId: string,
    usuarioId: string,
    clienteId: string,
    tarifaSeleccionadaId: string
  ) {
    // Obtener información de la tarifa seleccionada
    const tarifa = await prisma.tarifas.findUnique({
      where: { id: tarifaSeleccionadaId },
      include: {
        comercializadoras: true
      }
    });

    if (!tarifa) {
      throw new Error('Tarifa seleccionada no encontrada');
    }

    // Obtener información de la comparativa para el importe
    const comparativa = await prisma.comparativas.findUnique({
      where: { id: comparativaId }
    });

    if (!comparativa) {
      throw new Error('Comparativa no encontrada');
    }

    // Calcular la comisión
    const comisionResult = await this.calculateCommission({
      usuarioId,
      comercializadoraId: tarifa.comercializadoraId,
      nombreOferta: tarifa.nombreOferta,
      tarifaAcceso: comparativa.tarifaAccesoElectricidad,
      importeAnual: comparativa.totalFacturaElectricidad * 12 // Asumiendo factura mensual
    });

    // Registrar la venta
    const venta = await prisma.ventas.create({
      data: {
        comparativaId,
        usuarioId,
        clienteId,
        tarifaSeleccionadaId,
        importeAnual: comparativa.totalFacturaElectricidad * 12,
        comisionCalculada: comisionResult.importeComision,
        porcentajeAplicado: comisionResult.porcentaje,
        tipoComision: comisionResult.tipoComision,
        observaciones: comisionResult.detalleRegla
      }
    });

    // Registrar el detalle de comisión
    await prisma.comision_ventas.create({
      data: {
        ventaId: venta.id,
        usuarioId,
        importeComision: comisionResult.importeComision,
        porcentaje: comisionResult.porcentaje,
        observaciones: comisionResult.detalleRegla
      }
    });

    return venta;
  }

  /**
   * Obtiene un resumen de comisiones para un usuario
   */
  static async getUserCommissionSummary(usuarioId: string, fechaDesde?: Date, fechaHasta?: Date) {
    const whereClause: any = {
      usuarioId
    };

    if (fechaDesde || fechaHasta) {
      whereClause.createdAt = {};
      if (fechaDesde) whereClause.createdAt.gte = fechaDesde;
      if (fechaHasta) whereClause.createdAt.lte = fechaHasta;
    }

    const comisiones = await prisma.comision_ventas.findMany({
      where: whereClause,
      include: {
        venta: {
          include: {
            comparativa: {
              include: {
                clientes: true
              }
            },
            tarifaSeleccionada: {
              include: {
                comercializadoras: true
              }
            }
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    const resumen = {
      totalComisiones: comisiones.reduce((sum, c) => sum + c.importeComision, 0),
      comisionesPendientes: comisiones.filter(c => c.estadoPago === 'pendiente').reduce((sum, c) => sum + c.importeComision, 0),
      comisionesPagadas: comisiones.filter(c => c.estadoPago === 'pagado').reduce((sum, c) => sum + c.importeComision, 0),
      totalVentas: comisiones.length,
      ventasPorComercializadora: {} as Record<string, number>,
      ventasPorTipoComision: {} as Record<string, number>
    };

    // Agrupar por comercializadora y tipo de comisión
    comisiones.forEach(comision => {
      const comercializadora = comision.venta?.tarifaSeleccionada?.comercializadoras?.nombre || 'Desconocida';
      const tipoComision = comision.venta?.tipoComision || 'total';

      resumen.ventasPorComercializadora[comercializadora] = (resumen.ventasPorComercializadora[comercializadora] || 0) + 1;
      resumen.ventasPorTipoComision[tipoComision] = (resumen.ventasPorTipoComision[tipoComision] || 0) + 1;
    });

    return {
      resumen,
      detalleComisiones: comisiones
    };
  }
}
