
import { NextRequest, NextResponse } from 'next/server';
import { uploadFile } from '@/lib/s3';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;
    
    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    // Subir archivo a S3
    const buffer = Buffer.from(await file.arrayBuffer());
    const cloud_storage_path = await uploadFile(buffer, file.name);

    // Preparar archivo para procesamiento IA
    const base64String = buffer.toString('base64');
    let dataUri: string;
    
    if (file.type === 'application/pdf') {
      dataUri = `data:application/pdf;base64,${base64String}`;
    } else {
      dataUri = `data:${file.type};base64,${base64String}`;
    }

    // Prompt específico para extracción de facturas energéticas
    const prompt = `
Analiza esta factura de electricidad/gas española y extrae TODOS los datos siguientes con precisión:

ESTRUCTURA JSON REQUERIDA:
{
  "cliente": {
    "razonSocial": "Nombre o razón social del cliente",
    "cif": "CIF/NIF del cliente",
    "direccion": "Dirección completa",
    "localidad": "Ciudad/localidad",
    "provincia": "Provincia",
    "codigoPostal": "Código postal",
    "telefono": "Teléfono (si aparece)",
    "email": "Email (si aparece)"
  },
  "electricidad": {
    "contrataElectricidad": true,
    "tarifaAccesoElectricidad": "2.0TD|3.0TD|6.1TD|6.2TD",
    "cupsElectricidad": "Código CUPS completo",
    "consumoAnualElectricidad": "Consumo anual en kWh (número)",
    "comercializadoraActual": "Nombre de la comercializadora",
    "distribuidoraElectrica": "Distribuidora eléctrica (si aparece)"
  },
  "potencias": {
    "potenciaP1": "Potencia período 1 en kW (número)",
    "potenciaP2": "Potencia período 2 en kW o null",
    "potenciaP3": "Potencia período 3 en kW o null",
    "potenciaP4": "Potencia período 4 en kW o null", 
    "potenciaP5": "Potencia período 5 en kW o null",
    "potenciaP6": "Potencia período 6 en kW o null"
  },
  "consumos": {
    "consumoP1": "Consumo período 1 en kWh (número)",
    "consumoP2": "Consumo período 2 en kWh o null",
    "consumoP3": "Consumo período 3 en kWh o null",
    "consumoP4": "Consumo período 4 en kWh o null",
    "consumoP5": "Consumo período 5 en kWh o null", 
    "consumoP6": "Consumo período 6 en kWh o null"
  },
  "facturaElectricidad": {
    "terminoFijo": "Término fijo en € (número)",
    "terminoVariable": "Término variable en € (número)",
    "excesoPotencia": "Exceso potencia en € o 0",
    "impuesto": "Impuesto electricidad en € (número)",
    "iva": "IVA en € (número)",
    "total": "Total factura en € (número)"
  },
  "gas": {
    "contrataGas": "true si hay datos de gas, false si no",
    "cupsGas": "CUPS gas si existe o null",
    "consumoAnualGas": "Consumo gas anual o null"
  },
  "facturaGas": {
    "terminoFijo": "Término fijo gas en € o null",
    "terminoVariable": "Término variable gas en € o null", 
    "impuesto": "Impuesto gas en € o null",
    "iva": "IVA gas en € o null",
    "total": "Total factura gas en € o null"
  },
  "confianza": "Número 0-100 indicando confianza en la extracción"
}

INSTRUCCIONES ESPECÍFICAS:
1. Busca TODOS los períodos de potencia y consumo (P1, P2, P3, P4, P5, P6)
2. Extrae términos fijo y variable por separado
3. Identifica correctamente impuestos de electricidad vs IVA
4. Si es factura dual (luz+gas), extrae ambos
5. Si hay datos que no encuentras, usa null
6. Sé muy preciso con los números, incluye decimales
7. La confianza debe ser realista basada en calidad del texto

Responde únicamente con JSON limpio, sin markdown ni explicaciones.
`;

    // Configurar mensaje para la API
    const messages = [];
    
    if (file.type === 'application/pdf') {
      messages.push({
        role: 'user',
        content: [
          {
            type: 'file',
            file: {
              filename: file.name,
              file_data: dataUri
            }
          },
          {
            type: 'text',
            text: prompt
          }
        ]
      });
    } else {
      messages.push({
        role: 'user',
        content: [
          {
            type: 'text',
            text: prompt
          },
          {
            type: 'image_url',
            image_url: {
              url: dataUri
            }
          }
        ]
      });
    }

    // Llamar a la API de LLM con streaming
    const response = await fetch('https://apps.abacus.ai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.ABACUSAI_API_KEY}`
      },
      body: JSON.stringify({
        model: 'gpt-4.1-mini',
        messages: messages,
        stream: true,
        max_tokens: 2000,
        response_format: { type: "json_object" },
        temperature: 0.1
      }),
    });

    if (!response.ok) {
      throw new Error(`Error LLM API: ${response.status}`);
    }

    // Stream de respuesta al cliente
    const stream = new ReadableStream({
      async start(controller) {
        const reader = response.body?.getReader();
        if (!reader) {
          controller.error(new Error('No reader available'));
          return;
        }

        const decoder = new TextDecoder();
        const encoder = new TextEncoder();
        let buffer = '';
        let partialRead = '';

        try {
          while (true) {
            const { done, value } = await reader.read();
            if (done) break;

            partialRead += decoder.decode(value, { stream: true });
            let lines = partialRead.split('\n');
            partialRead = lines.pop() || '';

            for (const line of lines) {
              if (line.startsWith('data: ')) {
                const data = line.slice(6);
                if (data === '[DONE]') {
                  // Procesar buffer final y enviar resultado
                  try {
                    const finalResult = JSON.parse(buffer);
                    
                    // Validaciones básicas
                    if (!finalResult.cliente || !finalResult.electricidad) {
                      throw new Error('Datos incompletos extraídos');
                    }

                    const finalData = JSON.stringify({
                      status: 'completed',
                      result: finalResult,
                      cloud_storage_path: cloud_storage_path
                    });
                    
                    controller.enqueue(encoder.encode(`data: ${finalData}\n\n`));
                    controller.close();
                    return;
                  } catch (error) {
                    const errorData = JSON.stringify({
                      status: 'error',
                      message: 'Error parsing extracted data'
                    });
                    controller.enqueue(encoder.encode(`data: ${errorData}\n\n`));
                    controller.error(error);
                    return;
                  }
                }
                try {
                  const parsed = JSON.parse(data);
                  buffer += parsed.choices?.[0]?.delta?.content || '';
                  
                  // Enviar progreso
                  const progressData = JSON.stringify({
                    status: 'processing',
                    message: 'Extrayendo datos...'
                  });
                  controller.enqueue(encoder.encode(`data: ${progressData}\n\n`));
                } catch (e) {
                  // Skip invalid JSON
                }
              }
            }
          }
        } catch (error) {
          console.error('Stream error:', error);
          const errorData = JSON.stringify({
            status: 'error',
            message: 'Error processing document'
          });
          controller.enqueue(encoder.encode(`data: ${errorData}\n\n`));
          controller.error(error);
        }
      },
    });

    return new Response(stream, {
      headers: {
        'Content-Type': 'text/plain; charset=utf-8',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
      },
    });

  } catch (error) {
    console.error('Error in OCR API:', error);
    return NextResponse.json(
      { 
        error: 'Error processing invoice',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
