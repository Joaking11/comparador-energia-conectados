
import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import * as XLSX from 'xlsx';

export const dynamic = 'force-dynamic';

const prisma = new PrismaClient();

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;
    
    if (!file) {
      return NextResponse.json(
        { error: 'No se encontró el archivo' },
        { status: 400 }
      );
    }

    // Leer el archivo Excel
    const arrayBuffer = await file.arrayBuffer();
    const workbook = XLSX.read(arrayBuffer, { type: 'buffer' });
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    const jsonData = XLSX.utils.sheet_to_json(worksheet);

    console.log('Datos del Excel:', jsonData.slice(0, 3)); // Mostrar primeras 3 filas para debug

    let procesadas = 0;
    let errores = [];

    for (const row of jsonData as any[]) {
      try {
        // Mapear columnas (flexibilidad para diferentes formatos)
        const nombreComercializadora = 
          row['Comercializadora'] || 
          row['comercializadora'] || 
          row['COMERCIALIZADORA'] ||
          row['Nombre'] || 
          row['nombre'];
          
        const nombreOferta = 
          row['Oferta'] || 
          row['oferta'] || 
          row['OFERTA'] ||
          row['Nombre Oferta'] || 
          row['nombre_oferta'];
          
        const tarifa = 
          row['Tarifa'] || 
          row['tarifa'] || 
          row['TARIFA'] || 
          '2.0TD';
          
        const tipo = 
          row['Tipo'] || 
          row['tipo'] || 
          row['TIPO'] || 
          'Fija';
          
        const precioEnergia = 
          parseFloat(row['Precio Energía (€/kWh)'] || 
          row['precio_energia'] || 
          row['Precio Energia'] ||
          row['precioEnergia'] || 
          0);
          
        const precioTermino = 
          parseFloat(row['Término Potencia (€/kW mes)'] || 
          row['termino_potencia'] || 
          row['Termino Potencia'] ||
          row['precioTermino'] || 
          0);
          
        const descripcion = 
          row['Descripción'] || 
          row['descripcion'] || 
          row['DESCRIPCION'] ||
          row['Descripcion'] || 
          '';
          
        const comisionTipo = 
          row['Comisión Tipo'] || 
          row['comision_tipo'] || 
          row['ComisionTipo'] ||
          row['tipo_comision'] || 
          'E';
          
        const comisionValor = 
          parseFloat(row['Comisión Valor'] || 
          row['comision_valor'] || 
          row['ComisionValor'] ||
          row['valor_comision'] || 
          0);
          
        const comisionMinimo = 
          parseFloat(row['Comisión Mínimo'] || 
          row['comision_minimo'] || 
          row['ComisionMinimo'] ||
          row['minimo_comision'] || 
          0);
          
        const comisionMaximo = 
          parseFloat(row['Comisión Máximo'] || 
          row['comision_maximo'] || 
          row['ComisionMaximo'] ||
          row['maximo_comision'] || 
          0) || null;

        // Validaciones básicas
        if (!nombreComercializadora || !nombreOferta) {
          errores.push(`Fila ${procesadas + 1}: Faltan datos obligatorios (Comercializadora o Oferta)`);
          continue;
        }

        if (precioEnergia <= 0 || precioTermino <= 0) {
          errores.push(`Fila ${procesadas + 1}: Precios deben ser mayores que 0`);
          continue;
        }

        // Buscar o crear comercializadora
        let comercializadora = await prisma.comercializadora.findUnique({
          where: { nombre: nombreComercializadora.toString().trim() }
        });

        if (!comercializadora) {
          comercializadora = await prisma.comercializadora.create({
            data: {
              nombre: nombreComercializadora.toString().trim(),
              activa: true
            }
          });
        }

        // Verificar si la oferta ya existe
        const tarifaExistente = await prisma.tarifa.findFirst({
          where: {
            comercializadoraId: comercializadora.id,
            nombre: nombreOferta.toString().trim()
          }
        });

        if (tarifaExistente) {
          // Actualizar tarifa existente
          await prisma.tarifa.update({
            where: { id: tarifaExistente.id },
            data: {
              tarifa: tarifa.toString(),
              tipo: tipo.toString(),
              precioEnergia,
              precioTermino,
              descripcion: descripcion.toString() || null,
              comisionTipo: comisionTipo.toString() === 'P' ? 'P' : 'E',
              comisionValor,
              comisionMinimo,
              comisionMaximo
            }
          });
        } else {
          // Crear nueva tarifa
          await prisma.tarifa.create({
            data: {
              comercializadoraId: comercializadora.id,
              nombre: nombreOferta.toString().trim(),
              tarifa: tarifa.toString(),
              tipo: tipo.toString(),
              precioEnergia,
              precioTermino,
              descripcion: descripcion.toString() || null,
              activa: true,
              comisionTipo: comisionTipo.toString() === 'P' ? 'P' : 'E',
              comisionValor,
              comisionMinimo,
              comisionMaximo
            }
          });
        }

        procesadas++;
      } catch (error: any) {
        console.error(`Error procesando fila ${procesadas + 1}:`, error);
        errores.push(`Fila ${procesadas + 1}: ${error.message || 'Error desconocido'}`);
      }
    }

    return NextResponse.json({
      success: true,
      processed: procesadas,
      total: jsonData.length,
      errors: errores.slice(0, 10) // Solo primeros 10 errores
    });

  } catch (error: any) {
    console.error('Error importando Excel:', error);
    return NextResponse.json(
      { error: 'Error procesando el archivo Excel', details: error.message || 'Error desconocido' },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}
