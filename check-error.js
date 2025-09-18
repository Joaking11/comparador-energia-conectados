
// Script simple para verificar el error específico
const http = require('http');

function makeRequest(path, method = 'GET', data = null) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'localhost',
      port: 3000,
      path: path,
      method: method,
      headers: {
        'Content-Type': 'application/json',
      }
    };

    const req = http.request(options, (res) => {
      let body = '';
      res.on('data', (chunk) => {
        body += chunk;
      });
      res.on('end', () => {
        resolve({
          statusCode: res.statusCode,
          body: body,
          headers: res.headers
        });
      });
    });

    req.on('error', (error) => {
      reject(error);
    });

    if (data) {
      req.write(data);
    }
    req.end();
  });
}

async function checkAPI() {
  console.log('🔍 Verificando APIs...\n');
  
  try {
    // 1. Health check
    console.log('1️⃣ Health Check');
    const health = await makeRequest('/api/health');
    console.log(`Status: ${health.statusCode}`);
    console.log(`Body: ${health.body}\n`);
    
    // 2. Listar comparativas
    console.log('2️⃣ Lista de Comparativas');
    const comparativas = await makeRequest('/api/comparativas');
    console.log(`Status: ${comparativas.statusCode}`);
    
    if (comparativas.statusCode === 200) {
      const data = JSON.parse(comparativas.body);
      console.log(`Comparativas encontradas: ${data.length}`);
      
      if (data.length > 0) {
        const primera = data[0];
        console.log(`Primera comparativa ID: ${primera.id}\n`);
        
        // 3. Intentar cálculo
        console.log('3️⃣ Intentar Cálculo');
        const calculo = await makeRequest(`/api/comparativas/${primera.id}/calculate`, 'POST', JSON.stringify({}));
        console.log(`Status: ${calculo.statusCode}`);
        console.log(`Body: ${calculo.body}`);
      } else {
        console.log('❌ No hay comparativas para probar\n');
      }
    } else {
      console.log(`❌ Error obteniendo comparativas: ${comparativas.body}\n`);
    }
    
  } catch (error) {
    console.log('❌ Error:', error.message);
  }
}

checkAPI();
