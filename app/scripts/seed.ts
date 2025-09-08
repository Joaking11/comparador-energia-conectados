
import { PrismaClient } from '@prisma/client';
import { v4 as uuidv4 } from 'uuid';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Iniciando seed de la base de datos...');

  // Limpiar datos existentes
  await prisma.comparativa_ofertas.deleteMany();
  await prisma.comparativas.deleteMany();
  await prisma.clientes.deleteMany();
  await prisma.tarifas.deleteMany();
  await prisma.comercializadoras.deleteMany();
  await prisma.users.deleteMany();

  console.log('✅ Datos existentes eliminados');

  // Crear comercializadoras
  const comercializadorasData = [
    'Iberdrola', 'Endesa', 'Naturgy', 'Repsol', 'TotalEnergies', 'Holaluz', 'Lucera', 'Axpo'
  ];

  const comercializadoras = [];
  for (const nombre of comercializadorasData) {
    const comercializadora = await prisma.comercializadoras.create({
      data: {
        id: uuidv4(),
        nombre,
        activa: true,
        updatedAt: new Date()
      }
    });
    comercializadoras.push(comercializadora);
  }

  console.log(`✅ Creadas ${comercializadoras.length} comercializadoras`);

  // Crear una tarifa de ejemplo para cada comercializadora
  const tarifas = [];
  for (let i = 0; i < comercializadoras.length; i++) {
    const comercializadora = comercializadoras[i];
    const tarifa = await prisma.tarifas.create({
      data: {
        id: uuidv4(),
        comercializadoraId: comercializadora.id,
        nombreOferta: `Oferta Básica ${comercializadora.nombre}`,
        tarifa: '2.0TD',
        tipoOferta: 'Estándar',
        zona: 'Peninsula',
        rango: 'Anual',
        rangoDesde: 3000,
        rangoHasta: 15000,
        energiaP1: 0.12 + (i * 0.005), // Precios ligeramente diferentes
        potenciaP1: 30.65 + (i * 0.5),
        activa: true,
        updatedAt: new Date()
      }
    });
    tarifas.push(tarifa);
  }

  console.log(`✅ Creadas ${tarifas.length} tarifas`);

  // Crear un cliente de ejemplo
  const clienteEjemplo = await prisma.clientes.create({
    data: {
      id: uuidv4(),
      razonSocial: 'Empresa Ejemplo S.L.',
      cif: 'B12345678',
      direccion: 'Calle Ejemplo 123',
      localidad: 'Madrid',
      provincia: 'Madrid',
      codigoPostal: '28001',
      telefono: '912345678',
      email: 'contacto@empresaejemplo.com',
      updatedAt: new Date()
    }
  });

  console.log('✅ Creado cliente de ejemplo');

  // Crear usuario demo
  const hashedPassword = await bcrypt.hash('admin123', 12);
  const userDemo = await prisma.users.create({
    data: {
      id: uuidv4(),
      email: 'demo@conectados.energy',
      name: 'Usuario Demo',
      password: hashedPassword
    }
  });

  console.log('✅ Creado usuario demo (email: demo@conectados.energy, password: admin123)');
  console.log('🎉 Seed completado exitosamente!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect()
  });
