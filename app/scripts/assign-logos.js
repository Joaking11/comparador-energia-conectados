
require('dotenv').config();
const { PrismaClient } = require('@prisma/client');

const LOGOS_CDN = {
  'Endesa': 'https://cdn.abacus.ai/images/267b0410-b505-429a-aee7-ac2ab801cece.png',
  'IBERDROLA': 'https://cdn.abacus.ai/images/f18f6db2-4149-4378-a85a-eed3b36e9e58.png', 
  'Naturgy': 'https://cdn.abacus.ai/images/fe4a0234-8895-46eb-a206-a24d3a0a486d.png',
  'REPSOL': 'https://cdn.abacus.ai/images/b6d8fd3d-3801-42e5-a077-d545325980fe.png',
  'AUDAX': 'https://cdn.abacus.ai/images/d04b4970-711a-4fd1-8c9f-2ea879ac8940.png',
  'AXPO': 'https://cdn.abacus.ai/images/e672a28f-de60-49f8-9c46-e9b3a2e06101.png',
  'AC ENERGIA': 'https://cdn.abacus.ai/images/b03c909e-6de8-488d-aadc-6c798c597c83.png',
  'ACCIONA': 'https://cdn.abacus.ai/images/2941b64c-2903-472a-9299-43490ac454e8.png'
};

async function assignLogos() {
  const prisma = new PrismaClient();

  try {
    console.log('🖼️  Asignando logos a las comercializadoras...');
    
    const comercializadoras = await prisma.comercializadora.findMany();
    console.log(`📊 Encontradas ${comercializadoras.length} comercializadoras`);

    let logosAsignados = 0;
    let comercializadorasActualizadas = [];

    for (const comercializadora of comercializadoras) {
      const logoUrl = LOGOS_CDN[comercializadora.nombre];
      
      if (logoUrl) {
        await prisma.comercializadora.update({
          where: { id: comercializadora.id },
          data: { logoUrl: logoUrl }
        });

        console.log(`✅ ${comercializadora.nombre} -> Logo asignado`);
        logosAsignados++;
        comercializadorasActualizadas.push(comercializadora.nombre);
      } else {
        console.log(`⚠️  ${comercializadora.nombre} -> Sin logo disponible`);
      }
    }

    console.log('\n🎯 ¡Logos asignados exitosamente!');
    console.log(`📊 Estadísticas:`);
    console.log(`   - Total comercializadoras: ${comercializadoras.length}`);
    console.log(`   - Logos asignados: ${logosAsignados}`);
    console.log(`   - Sin logo: ${comercializadoras.length - logosAsignados}`);

    if (comercializadorasActualizadas.length > 0) {
      console.log('\n✨ Comercializadoras con logos:');
      comercializadorasActualizadas.forEach(nombre => {
        console.log(`   - ${nombre}`);
      });
    }

  } catch (error) {
    console.error('❌ Error asignando logos:', error);
  } finally {
    await prisma.$disconnect();
  }
}

assignLogos();
