
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Iniciando seed de la base de datos...');

  // Limpiar datos existentes
  await prisma.comparativaOferta.deleteMany();
  await prisma.comparativa.deleteMany();
  await prisma.cliente.deleteMany();
  await prisma.tarifa.deleteMany();
  await prisma.comercializadora.deleteMany();

  // Crear comercializadoras
  const comercializadoras = await Promise.all([
    prisma.comercializadora.create({
      data: {
        nombre: 'Iberdrola',
        activa: true,
      }
    }),
    prisma.comercializadora.create({
      data: {
        nombre: 'Endesa',
        activa: true,
      }
    }),
    prisma.comercializadora.create({
      data: {
        nombre: 'Naturgy',
        activa: true,
      }
    }),
    prisma.comercializadora.create({
      data: {
        nombre: 'Repsol',
        activa: true,
      }
    }),
    prisma.comercializadora.create({
      data: {
        nombre: 'TotalEnergies',
        activa: true,
      }
    }),
    prisma.comercializadora.create({
      data: {
        nombre: 'EDP',
        activa: true,
      }
    }),
    prisma.comercializadora.create({
      data: {
        nombre: 'Viesgo',
        activa: true,
      }
    }),
    prisma.comercializadora.create({
      data: {
        nombre: 'Holaluz',
        activa: true,
      }
    })
  ]);

  console.log('✅ Comercializadoras creadas');

  // Crear tarifas básicas de ejemplo
  const tarifasData = [
    {
      comercializadoraId: comercializadoras[0].id, // Iberdrola
      nombreOferta: 'Tarifa Fija',
      tarifa: '2.0TD',
      tipoOferta: 'Fijo',
      zona: 'PENINSULA',
      rango: 'E',
      rangoDesde: 0,
      rangoHasta: 10000,
      energiaP1: 0.18,
      potenciaP1: 3.45,
      activa: true
    },
    {
      comercializadoraId: comercializadoras[1].id, // Endesa
      nombreOferta: 'Tempo Happy',
      tarifa: '2.0TD',
      tipoOferta: 'Fijo',
      zona: 'PENINSULA',
      rango: 'E',
      rangoDesde: 0,
      rangoHasta: 8000,
      energiaP1: 0.17,
      potenciaP1: 3.35,
      activa: true
    },
    
  ];

  // Insertar todas las tarifas
  for (const tarifaData of tarifasData) {
    await prisma.tarifa.create({
      data: tarifaData
    });
  }

  console.log('✅ Ofertas creadas');

  // Crear cliente de ejemplo
  const clienteEjemplo = await prisma.cliente.create({
    data: {
      razonSocial: 'Juan Pérez García',
      cif: '12345678Z',
      direccion: 'Calle Ejemplo 123',
      localidad: 'Madrid',
      provincia: 'Madrid',
      codigoPostal: '28001',
      telefono: '666123456',
      email: 'juan.perez@email.com'
    }
  });

  console.log('✅ Cliente de ejemplo creado');

  // Crear usuario demo para autenticación
  const bcryptjs = require('bcryptjs');
  const hashedPassword = await bcryptjs.hash('demo123', 12);
  
  const userDemo = await prisma.user.create({
    data: {
      email: 'demo@energia.com',
      name: 'Usuario Demo',
      password: hashedPassword
    }
  });

  console.log('✅ Usuario demo creado');
  console.log('🎉 Seed completado exitosamente!');
  console.log(`📊 Comercializadoras: ${comercializadoras.length}`);
  console.log(`📋 Tarifas: ${tarifasData.length}`);
  console.log(`👤 Clientes: 1`);
  console.log(`🔐 Usuario demo: demo@energia.com / demo123`);
}

main()
  .catch((e) => {
    console.error('❌ Error en seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
