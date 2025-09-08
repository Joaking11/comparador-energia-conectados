
require('dotenv').config();
const { PrismaClient } = require('@prisma/client');

const NUEVOS_LOGOS_CDN = {
  'GREENING': 'https://cdn.abacus.ai/images/baffbad3-acfc-45aa-8288-993c45051850.png',
  'LOGOS ENERGIA': 'https://cdn.abacus.ai/images/95652398-c5fa-4bb5-8dfe-329265473bd1.png', 
  'CANALUZ': 'https://cdn.abacus.ai/images/8d7105ec-77de-4016-bb6b-4f978be4592b.png',
  'VM ENERGYA': 'https://cdn.abacus.ai/images/2dd67fc2-ec4a-4c54-97cf-3e3c953786e1.png',
  'PLENITUDE': 'https://cdn.abacus.ai/images/df984462-d41c-440f-bd2f-e76201166db5.png',
  'GALP': 'https://cdn.abacus.ai/images/ede2fe70-b7c9-448f-84d6-06f514507ab4.png',
  'VOLTIO': 'https://cdn.abacus.ai/images/02b3204c-6390-43ad-8b7a-6603e0ce9ad8.png',
  'WEKIWI': 'https://cdn.abacus.ai/images/853486c9-5c7b-4330-81ae-4e56662baabe.png'
};

async function assignAdditionalLogos() {
  const prisma = new PrismaClient();

  try {
    console.log('🖼️  Asignando logos adicionales...');
    
    const comercializadoras = await prisma.comercializadora.findMany();
    console.log(`📊 Encontradas ${comercializadoras.length} comercializadoras`);

    let logosAsignados = 0;
    let comercializadorasActualizadas = [];

    for (const comercializadora of comercializadoras) {
      const logoUrl = NUEVOS_LOGOS_CDN[comercializadora.nombre];
      
      if (logoUrl) {
        await prisma.comercializadora.update({
          where: { id: comercializadora.id },
          data: { logoUrl: logoUrl }
        });

        console.log(`✅ ${comercializadora.nombre} -> Logo adicional asignado`);
        logosAsignados++;
        comercializadorasActualizadas.push(comercializadora.nombre);
      }
    }

    if (logosAsignados > 0) {
      console.log('\n🎯 ¡Logos adicionales asignados exitosamente!');
      console.log(`📊 Nuevos logos asignados: ${logosAsignados}`);
      
      console.log('\n✨ Comercializadoras con nuevos logos:');
      comercializadorasActualizadas.forEach(nombre => {
        console.log(`   - ${nombre}`);
      });
    } else {
      console.log('⚠️  No se encontraron comercializadoras para los nuevos logos');
    }

    // Mostrar estadísticas finales
    const totalConLogos = await prisma.comercializadora.count({
      where: { logoUrl: { not: null } }
    });
    const totalComercializadoras = await prisma.comercializadora.count();

    console.log('\n📊 Estadísticas finales:');
    console.log(`   - Total comercializadoras: ${totalComercializadoras}`);
    console.log(`   - Con logos: ${totalConLogos}`);
    console.log(`   - Sin logos: ${totalComercializadoras - totalConLogos}`);
    console.log(`   - Cobertura: ${((totalConLogos / totalComercializadoras) * 100).toFixed(1)}%`);

  } catch (error) {
    console.error('❌ Error asignando logos adicionales:', error);
  } finally {
    await prisma.$disconnect();
  }
}

assignAdditionalLogos();
