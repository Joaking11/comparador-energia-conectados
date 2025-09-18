
const https = require('https');
const http = require('http');

// Test del endpoint de comparativas
async function testComparativaEndpoint() {
  console.log('🔍 Testing comparativa calculation endpoint...');
  
  try {
    // Primero obtener una comparativa existente
    const comparativas = await fetch('http://localhost:3000/api/comparativas');
    const data = await comparativas.json();
    
    if (data.length === 0) {
      console.log('❌ No hay comparativas en la base de datos');
      return;
    }
    
    const primeraComparativa = data[0];
    console.log('✅ Comparativa encontrada:', primeraComparativa.id);
    
    // Intentar calcular
    const response = await fetch(`http://localhost:3000/api/comparativas/${primeraComparativa.id}/calculate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({})
    });
    
    const result = await response.text();
    
    if (response.ok) {
      console.log('✅ Cálculo exitoso:', result);
    } else {
      console.log('❌ Error en cálculo:', response.status, result);
    }
    
  } catch (error) {
    console.log('❌ Error de conexión:', error.message);
  }
}

// Función para verificar el estado del servidor
async function checkServerStatus() {
  try {
    const response = await fetch('http://localhost:3000/api/health');
    const data = await response.json();
    console.log('🏥 Estado del servidor:', data);
  } catch (error) {
    console.log('❌ Servidor no disponible:', error.message);
  }
}

// Ejecutar tests
(async () => {
  await checkServerStatus();
  await testComparativaEndpoint();
})();
