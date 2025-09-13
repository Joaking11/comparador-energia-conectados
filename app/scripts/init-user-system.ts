
import { prisma } from '../lib/db';
import bcryptjs from 'bcryptjs';

async function initUserSystem() {
  console.log('🚀 Inicializando sistema de gestión de usuarios y comisiones...');

  try {
    // 1. Crear comisión principal del sistema
    console.log('📊 Creando comisión principal...');
    
    const comisionPrincipal = await prisma.comision_principal.upsert({
      where: {
        id: 'main-commission-id'
      },
      update: {},
      create: {
        id: 'main-commission-id',
        porcentajeBase: 10.0,
        activo: true,
        fechaActivacion: new Date()
      }
    });

    console.log(`✅ Comisión principal creada: ${comisionPrincipal.porcentajeBase}%`);

    // 2. Crear perfiles de comisión
    console.log('👥 Creando perfiles de comisión...');

    const perfiles = [
      {
        id: 'perfil-admin',
        nombre: 'Administrador',
        descripcion: 'Perfil para administradores del sistema',
        porcentajeTotal: 0.0
      },
      {
        id: 'perfil-senior',
        nombre: 'Agente Senior',
        descripcion: 'Agente comercial con experiencia y mejores comisiones',
        porcentajeTotal: 75.0
      },
      {
        id: 'perfil-junior',
        nombre: 'Agente Junior',
        descripcion: 'Agente comercial en formación con comisiones básicas',
        porcentajeTotal: 50.0
      },
      {
        id: 'perfil-colaborador',
        nombre: 'Colaborador Externo',
        descripcion: 'Colaborador externo sin acceso al sistema',
        porcentajeTotal: 30.0
      }
    ];

    for (const perfilData of perfiles) {
      await prisma.perfiles_comision.upsert({
        where: { id: perfilData.id },
        update: {},
        create: perfilData
      });
      console.log(`✅ Perfil creado: ${perfilData.nombre} (${perfilData.porcentajeTotal}%)`);
    }

    // 3. Crear usuarios de ejemplo
    console.log('👤 Creando usuarios de ejemplo...');

    const usuarios = [
      {
        id: 'admin-user',
        name: 'Administrador Principal',
        email: 'admin@conectadosconsulting.es',
        username: 'admin',
        password: await bcryptjs.hash('admin123', 12),
        tipoUsuario: 'admin',
        perfilComisionId: 'perfil-admin',
        telefono: '+34 600 000 001'
      },
      {
        id: 'agente-senior-1',
        name: 'María García López',
        email: 'maria.garcia@conectadosconsulting.es',
        username: 'maria.garcia',
        password: await bcryptjs.hash('maria123', 12),
        tipoUsuario: 'agente_con_login',
        perfilComisionId: 'perfil-senior',
        telefono: '+34 600 000 002'
      },
      {
        id: 'agente-junior-1',
        name: 'Carlos Rodríguez Martín',
        email: 'carlos.rodriguez@conectadosconsulting.es',
        username: 'carlos.rodriguez',
        password: await bcryptjs.hash('carlos123', 12),
        tipoUsuario: 'agente_con_login',
        perfilComisionId: 'perfil-junior',
        telefono: '+34 600 000 003'
      },
      {
        id: 'colaborador-externo-1',
        name: 'Ana Fernández Silva',
        email: 'ana.fernandez@colaborador.com',
        tipoUsuario: 'agente_sin_login',
        perfilComisionId: 'perfil-colaborador',
        telefono: '+34 600 000 004',
        observaciones: 'Colaborador externo que no necesita acceso al sistema'
      },
      {
        id: 'demo-user',
        name: 'Usuario Demo',
        email: 'demo@example.com',
        username: 'demo',
        password: await bcryptjs.hash('demo123', 12),
        tipoUsuario: 'regular',
        perfilComisionId: null
      }
    ];

    for (const usuarioData of usuarios) {
      await prisma.users.upsert({
        where: { id: usuarioData.id },
        update: {},
        create: usuarioData
      });
      console.log(`✅ Usuario creado: ${usuarioData.name} (${usuarioData.tipoUsuario})`);
    }

    // 4. Crear algunas comisiones granulares de ejemplo
    console.log('🎯 Creando comisiones granulares de ejemplo...');

    // Obtener algunas comercializadoras para el ejemplo
    const comercializadoras = await prisma.comercializadoras.findMany({
      take: 3,
      where: { activa: true }
    });

    if (comercializadoras.length > 0) {
      // Comisión específica para Endesa para agentes senior
      await prisma.comisiones_comercializadora.upsert({
        where: {
          perfilComisionId_comercializadoraId: {
            perfilComisionId: 'perfil-senior',
            comercializadoraId: comercializadoras[0].id
          }
        },
        update: {},
        create: {
          perfilComisionId: 'perfil-senior',
          comercializadoraId: comercializadoras[0].id,
          porcentaje: 85.0
        }
      });
      console.log(`✅ Comisión granular creada para ${comercializadoras[0].nombre} (85%)`);

      // Comisión específica por tarifa para agentes senior
      await prisma.comisiones_tarifa.upsert({
        where: {
          perfilComisionId_tarifaAcceso: {
            perfilComisionId: 'perfil-senior',
            tarifaAcceso: '3.0TD'
          }
        },
        update: {},
        create: {
          perfilComisionId: 'perfil-senior',
          tarifaAcceso: '3.0TD',
          porcentaje: 80.0
        }
      });
      console.log(`✅ Comisión granular creada para tarifa 3.0TD (80%)`);

      // Obtener una oferta específica para ejemplo
      const tarifa = await prisma.tarifas.findFirst({
        where: {
          activa: true,
          comercializadoraId: comercializadoras[0].id
        }
      });

      if (tarifa) {
        await prisma.comisiones_oferta.upsert({
          where: {
            perfilComisionId_comercializadoraId_nombreOferta_tarifaAcceso: {
              perfilComisionId: 'perfil-senior',
              comercializadoraId: tarifa.comercializadoraId,
              nombreOferta: tarifa.nombreOferta,
              tarifaAcceso: '2.0TD'
            }
          },
          update: {},
          create: {
            perfilComisionId: 'perfil-senior',
            comercializadoraId: tarifa.comercializadoraId,
            nombreOferta: tarifa.nombreOferta,
            tarifaAcceso: '2.0TD',
            porcentaje: 90.0
          }
        });
        console.log(`✅ Comisión granular creada para oferta ${tarifa.nombreOferta} + 2.0TD (90%)`);
      }
    }

    console.log('\n🎉 Sistema de usuarios y comisiones inicializado correctamente!');
    console.log('\n📋 Usuarios creados:');
    console.log('   👨‍💼 admin@conectadosconsulting.es / admin123 (Administrador)');
    console.log('   🏆 maria.garcia@conectadosconsulting.es / maria123 (Agente Senior)');
    console.log('   📚 carlos.rodriguez@conectadosconsulting.es / carlos123 (Agente Junior)');
    console.log('   🤝 ana.fernandez@colaborador.com (Sin login)');
    console.log('   🧪 demo@example.com / demo123 (Demo)');
    console.log('\n💰 Comisión principal: 10%');
    console.log('📊 Perfiles de comisión: 4 perfiles creados');
    console.log('🎯 Comisiones granulares: Ejemplos configurados');

  } catch (error) {
    console.error('❌ Error inicializando sistema:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Ejecutar solo si se llama directamente
if (require.main === module) {
  initUserSystem()
    .then(() => {
      console.log('✅ Inicialización completada');
      process.exit(0);
    })
    .catch((error) => {
      console.error('❌ Error en inicialización:', error);
      process.exit(1);
    });
}

export { initUserSystem };
