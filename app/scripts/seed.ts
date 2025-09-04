
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Iniciando seed de la base de datos...');

  // Limpiar datos existentes
  await prisma.comparativaOferta.deleteMany();
  await prisma.comparativa.deleteMany();
  await prisma.cliente.deleteMany();
  await prisma.oferta.deleteMany();
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

  // Crear ofertas con datos realistas del mercado español
  const ofertas = [
    // IBERDROLA
    {
      comercializadoraId: comercializadoras[0].id, // Iberdrola
      nombre: 'Tarifa Fija 12 meses',
      tarifa: '2.0TD',
      tipo: 'Fija',
      precioEnergia: 0.18,
      precioTermino: 3.45,
      descripcion: 'Precio fijo durante 12 meses, ideal para pequeños consumidores',
      comisionTipo: 'E',
      comisionMinimo: 2000,
      comisionMaximo: 15000,
      comisionValor: 25,
    },
    {
      comercializadoraId: comercializadoras[0].id,
      nombre: 'Tarifa Verde Indexada',
      tarifa: '2.0TD',
      tipo: 'Indexada',
      precioEnergia: 0.15,
      precioTermino: 3.25,
      descripcion: '100% energía renovable, precio según mercado diario',
      comisionTipo: 'E',
      comisionMinimo: 3000,
      comisionMaximo: 20000,
      comisionValor: 30,
    },
    
    // ENDESA
    {
      comercializadoraId: comercializadoras[1].id, // Endesa
      nombre: 'Tempo Happy',
      tarifa: '2.0TD',
      tipo: 'Fija',
      precioEnergia: 0.17,
      precioTermino: 3.35,
      descripcion: 'Tarifa con descuentos por consumo en horario valle',
      comisionTipo: 'E',
      comisionMinimo: 2500,
      comisionMaximo: 12000,
      comisionValor: 22,
    },
    {
      comercializadoraId: comercializadoras[1].id,
      nombre: 'Tempo Indexado',
      tarifa: '3.0TD',
      tipo: 'Indexada',
      precioEnergia: 0.14,
      precioTermino: 4.20,
      descripcion: 'Para empresas medianas, precio según pool',
      comisionTipo: 'P',
      comisionMinimo: 15,
      comisionMaximo: 100,
      comisionValor: 45,
    },

    // NATURGY
    {
      comercializadoraId: comercializadoras[2].id, // Naturgy
      nombre: 'Tarifa Plana',
      tarifa: '2.0TD',
      tipo: 'Fija',
      precioEnergia: 0.19,
      precioTermino: 3.55,
      descripcion: 'Precio fijo garantizado, sin sorpresas',
      comisionTipo: 'E',
      comisionMinimo: 1800,
      comisionMaximo: 18000,
      comisionValor: 28,
    },
    {
      comercializadoraId: comercializadoras[2].id,
      nombre: 'Tarifa Digital',
      tarifa: '2.0TD',
      tipo: 'Indexada',
      precioEnergia: 0.16,
      precioTermino: 3.15,
      descripcion: 'Gestión 100% digital con descuentos',
      comisionTipo: 'E',
      comisionMinimo: 2200,
      comisionMaximo: 14000,
      comisionValor: 26,
    },

    // REPSOL
    {
      comercializadoraId: comercializadoras[3].id, // Repsol
      nombre: 'Repsol Precio Fijo',
      tarifa: '2.0TD',
      tipo: 'Fija',
      precioEnergia: 0.175,
      precioTermino: 3.40,
      descripcion: 'Precio fijo con descuentos en combustible',
      comisionTipo: 'E',
      comisionMinimo: 2000,
      comisionMaximo: 16000,
      comisionValor: 24,
    },
    {
      comercializadoraId: comercializadoras[3].id,
      nombre: 'Repsol Flexible',
      tarifa: '3.0TD',
      tipo: 'Indexada',
      precioEnergia: 0.13,
      precioTermino: 4.10,
      descripcion: 'Ideal para empresas con alto consumo',
      comisionTipo: 'P',
      comisionMinimo: 20,
      comisionMaximo: 150,
      comisionValor: 50,
    },

    // TOTALENERGIES
    {
      comercializadoraId: comercializadoras[4].id, // TotalEnergies
      nombre: 'Esencial Fija',
      tarifa: '2.0TD',
      tipo: 'Fija',
      precioEnergia: 0.16,
      precioTermino: 3.30,
      descripcion: 'Tarifa básica con precio competitivo',
      comisionTipo: 'E',
      comisionMinimo: 2400,
      comisionMaximo: 13000,
      comisionValor: 27,
    },
    {
      comercializadoraId: comercializadoras[4].id,
      nombre: 'Online Indexada',
      tarifa: '2.0TD',
      tipo: 'Indexada',
      precioEnergia: 0.145,
      precioTermino: 3.10,
      descripcion: 'Gestión online, precio variable según mercado',
      comisionTipo: 'E',
      comisionMinimo: 2800,
      comisionMaximo: 17000,
      comisionValor: 29,
    },

    // EDP
    {
      comercializadoraId: comercializadoras[5].id, // EDP
      nombre: 'EDP Solar',
      tarifa: '2.0TD',
      tipo: 'Fija',
      precioEnergia: 0.17,
      precioTermino: 3.38,
      descripcion: 'Tarifa con opción autoconsumo solar',
      comisionTipo: 'E',
      comisionMinimo: 2100,
      comisionMaximo: 15000,
      comisionValor: 26,
    },
    
    // VIESGO
    {
      comercializadoraId: comercializadoras[6].id, // Viesgo
      nombre: 'Viesgo Fácil',
      tarifa: '2.0TD',
      tipo: 'Fija',
      precioEnergia: 0.185,
      precioTermino: 3.50,
      descripcion: 'Tarifa sencilla para hogar',
      comisionTipo: 'E',
      comisionMinimo: 1900,
      comisionMaximo: 14500,
      comisionValor: 23,
    },

    // HOLALUZ
    {
      comercializadoraId: comercializadoras[7].id, // Holaluz
      nombre: 'Holaluz Flat',
      tarifa: '2.0TD',
      tipo: 'Fija',
      precioEnergia: 0.165,
      precioTermino: 3.25,
      descripcion: 'Tarifa plana 100% verde',
      comisionTipo: 'E',
      comisionMinimo: 2600,
      comisionMaximo: 16500,
      comisionValor: 31,
    },
    {
      comercializadoraId: comercializadoras[7].id,
      nombre: 'Holaluz Flex',
      tarifa: '2.0TD',
      tipo: 'Indexada',
      precioEnergia: 0.14,
      precioTermino: 3.05,
      descripcion: 'Precio variable optimizado por IA',
      comisionTipo: 'E',
      comisionMinimo: 3000,
      comisionMaximo: 18000,
      comisionValor: 33,
    }
  ];

  // Insertar todas las ofertas
  for (const oferta of ofertas) {
    await prisma.oferta.create({
      data: oferta
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

  console.log('🎉 Seed completado exitosamente!');
  console.log(`📊 Comercializadoras: ${comercializadoras.length}`);
  console.log(`📋 Ofertas: ${ofertas.length}`);
  console.log(`👤 Clientes: 1`);
}

main()
  .catch((e) => {
    console.error('❌ Error en seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
