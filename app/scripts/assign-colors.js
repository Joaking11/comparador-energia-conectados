
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
  '#78716C', // Piedra
  '#0F766E', // Teal oscuro
  '#9333EA', // Púrpura oscuro
  '#B91C1C', // Rojo más oscuro
  '#047857', // Verde muy oscuro
  '#92400E', // Ámbar oscuro
  '#6D28D9', // Violeta muy oscuro
  '#BE1259', // Rosa muy oscuro
  '#C2410C', // Naranja muy oscuro
  '#0E7490', // Cian muy oscuro
  '#4D7C0F', // Lima muy oscuro
  '#3730A3', // Índigo muy oscuro
  '#BE123C', // Rose muy oscuro
  '#57534E', // Piedra oscuro
  '#134E4A', // Teal muy oscuro
];

async function assignColors() {
  const prisma = new PrismaClient();

  try {
    console.log('🎨 Asignando colores únicos a las comercializadoras...');
    
    const comercializadoras = await prisma.comercializadora.findMany({
      orderBy: { nombre: 'asc' }
    });

    console.log(`📊 Encontradas ${comercializadoras.length} comercializadoras`);

    for (let i = 0; i < comercializadoras.length; i++) {
      const color = COLORS_PALETTE[i % COLORS_PALETTE.length];
      
      await prisma.comercializadora.update({
        where: { id: comercializadoras[i].id },
        data: { color: color }
      });

      console.log(`✅ ${comercializadoras[i].nombre} -> ${color}`);
    }

    console.log('🎯 ¡Colores asignados exitosamente!');
    
  } catch (error) {
    console.error('❌ Error asignando colores:', error);
  } finally {
    await prisma.$disconnect();
  }
}

assignColors();
