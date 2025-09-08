
require('dotenv').config();
const { PrismaClient } = require('@prisma/client');

const COLORS_PALETTE = [
  '#3B82F6', // Azul
  '#EF4444', // Rojo
  '#10B981', // Verde
  '#F59E0B', // Amarillo
  '#8B5CF6', // Violeta
  '#EC4899', // Rosa
  '#F97316', // Naranja
  '#06B6D4', // Cian
  '#84CC16', // Lima
  '#6366F1', // Índigo
  '#F43F5E', // Rose
  '#8B5A2B', // Marrón
  '#6B7280', // Gris
  '#14B8A6', // Teal
  '#A855F7', // Púrpura
  '#DC2626', // Rojo oscuro
  '#059669', // Verde esmeralda
  '#D97706', // Ámbar
  '#7C3AED', // Violeta oscuro
  '#BE185D', // Rosa oscuro
  '#EA580C', // Naranja oscuro
  '#0891B2', // Cian oscuro
  '#65A30D', // Lima oscuro
  '#4F46E5', // Índigo oscuro
  '#E11D48', // Rose oscuro
];

// Nombres que parecen ser instrucciones o no comercializadoras reales
const NOMBRES_A_EXCLUIR = [
  '(El cuadro de nombre está en la esquina superior izquierda de Excel, encima de la columna A)',
  '1. Inserte el logo de su empresa usando Insertar > Imágenes',
  '2. Coloque el logo en la celda D2 (o en otra celda cercana)',
  '3. Seleccione el logo insertado y cámbiele el nombre a \'logo_empresa\' en el cuadro de nombre',
  '4. Para cada comercializadora:',
  'COMERCIALIZADORAS ENCONTRADAS:',
  'EJEMPLOS:',
  'a) Inserte su logo usando Insertar > Imágenes y colóquelo en la columna D',
  'b) Nómbrelo como \'logo_nombrecomercializadora\' (todo en minúsculas)',
  'c) En la columna B, puede definir un color de fondo para la comercializadora',
];

// Nombres que empiezan con 'logo_'
const esNombreLogo = (nombre) => nombre.toLowerCase().startsWith('logo_');

async function limpiarComercializadoras() {
  const prisma = new PrismaClient();

  try {
    console.log('🧹 Limpiando comercializadoras...');
    
    // Obtener todas las comercializadoras
    const todasComercializadoras = await prisma.comercializadora.findMany({
      include: {
        tarifas: true,
        comisiones: true
      }
    });

    console.log(`📊 Total comercializadoras: ${todasComercializadoras.length}`);

    // Identificar comercializadoras a eliminar
    const comercializadorasAEliminar = todasComercializadoras.filter(c => 
      NOMBRES_A_EXCLUIR.includes(c.nombre) ||
      esNombreLogo(c.nombre) ||
      (c.tarifas.length === 0 && c.comisiones.length === 0)
    );

    // Identificar comercializadoras reales
    const comercializadorasReales = todasComercializadoras.filter(c => 
      !NOMBRES_A_EXCLUIR.includes(c.nombre) &&
      !esNombreLogo(c.nombre) &&
      (c.tarifas.length > 0 || c.comisiones.length > 0)
    );

    console.log(`❌ A eliminar: ${comercializadorasAEliminar.length}`);
    console.log(`✅ Reales: ${comercializadorasReales.length}`);

    // Mostrar las que se van a eliminar
    if (comercializadorasAEliminar.length > 0) {
      console.log('\n🗑️ Comercializadoras a eliminar:');
      comercializadorasAEliminar.forEach(c => {
        console.log(`   - "${c.nombre}" (Tarifas: ${c.tarifas.length}, Comisiones: ${c.comisiones.length})`);
      });
    }

    // Mostrar las reales
    console.log('\n✨ Comercializadoras reales:');
    comercializadorasReales.forEach(c => {
      console.log(`   - "${c.nombre}" (Tarifas: ${c.tarifas.length}, Comisiones: ${c.comisiones.length})`);
    });

    // Eliminar las comercializadoras no reales
    for (const comercializadora of comercializadorasAEliminar) {
      await prisma.comercializadora.delete({
        where: { id: comercializadora.id }
      });
      console.log(`🗑️ Eliminada: "${comercializadora.nombre}"`);
    }

    // Asignar colores a las comercializadoras reales
    console.log('\n🎨 Asignando colores únicos...');
    for (let i = 0; i < comercializadorasReales.length; i++) {
      const color = COLORS_PALETTE[i % COLORS_PALETTE.length];
      
      await prisma.comercializadora.update({
        where: { id: comercializadorasReales[i].id },
        data: { color: color }
      });

      console.log(`🎯 "${comercializadorasReales[i].nombre}" -> ${color}`);
    }

    console.log('\n✅ ¡Limpieza y asignación de colores completada!');
    console.log(`📊 Comercializadoras finales: ${comercializadorasReales.length}`);
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

limpiarComercializadoras();
