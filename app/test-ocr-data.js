
// Datos de prueba para simular OCR
const datosOCRPrueba = {
  cliente: {
    razonSocial: "EMPRESA EJEMPLO SL",
    cif: "B12345678",
    direccion: "Calle Mayor 123",
    localidad: "Madrid",
    provincia: "Madrid",
    codigoPostal: "28001",
    telefono: "666123456",
    email: "empresa@ejemplo.com"
  },
  electricidad: {
    contrataElectricidad: true,
    tarifaAccesoElectricidad: "2.0TD",
    cupsElectricidad: "ES1234567890123456AB",
    consumoAnualElectricidad: 5000,
    comercializadoraActual: "Iberdrola",
    distribuidoraElectrica: "Iberdrola"
  },
  potencias: {
    potenciaP1: 4.6,
    potenciaP2: 2.3,
    potenciaP3: null,
    potenciaP4: null,
    potenciaP5: null,
    potenciaP6: null
  },
  consumos: {
    consumoP1: 3000,
    consumoP2: 2000,
    consumoP3: null,
    consumoP4: null,
    consumoP5: null,
    consumoP6: null
  },
  facturaElectricidad: {
    terminoFijo: 42.50,
    terminoVariable: 78.30,
    excesoPotencia: 0,
    impuesto: 6.15,
    iva: 25.40,
    total: 152.35
  },
  gas: {
    contrataGas: false
  },
  facturaGas: null,
  confianza: 95
};

console.log('Datos OCR de prueba:', JSON.stringify(datosOCRPrueba, null, 2));

// Verificar mapeo
const mapearDatosOCR = (datosOCR) => {
  return {
    cliente: {
      razonSocial: datosOCR.cliente?.razonSocial || '',
      cif: datosOCR.cliente?.cif || '',
      direccion: datosOCR.cliente?.direccion || '',
      localidad: datosOCR.cliente?.localidad || '',
      provincia: datosOCR.cliente?.provincia || '',
      codigoPostal: datosOCR.cliente?.codigoPostal || '',
      nombreFirmante: datosOCR.cliente?.nombreFirmante || '',
      nifFirmante: datosOCR.cliente?.nifFirmante || '',
      telefono: datosOCR.cliente?.telefono || '',
      email: datosOCR.cliente?.email || ''
    },
    facturaElectricidad: {
      terminoFijo: datosOCR.facturaElectricidad?.terminoFijo || '',
      terminoVariable: datosOCR.facturaElectricidad?.terminoVariable || '',
      excesoPotencia: datosOCR.facturaElectricidad?.excesoPotencia || 0,
      impuesto: datosOCR.facturaElectricidad?.impuesto || '',
      iva: datosOCR.facturaElectricidad?.iva || '',
      total: datosOCR.facturaElectricidad?.total || ''
    }
  };
};

console.log('Datos mapeados:', JSON.stringify(mapearDatosOCR(datosOCRPrueba), null, 2));
