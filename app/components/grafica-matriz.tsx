
'use client';

import { ScatterChart, Scatter, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';

interface OfertaResultado {
  id: string;
  importeCalculado: number;
  ahorroAnual: number;
  comisionGanada: number;
  oferta: {
    id: string;
    nombre: string;
    tipo: string;
    comercializadora: {
      nombre: string;
    };
  };
}

interface GraficaMatrizProps {
  ofertas: OfertaResultado[];
}

export function GraficaMatriz({ ofertas }: GraficaMatrizProps) {
  // Preparar datos para la gráfica
  const data = ofertas.map(resultado => ({
    ahorro: resultado.ahorroAnual,
    comision: resultado.comisionGanada,
    comercializadora: resultado.oferta.comercializadora.nombre,
    oferta: resultado.oferta.nombre,
    tipo: resultado.oferta.tipo,
  })).filter(item => item.ahorro >= 0 || item.comision > 0);

  // Colores según tipo de oferta
  const getColor = (tipo: string) => {
    switch (tipo.toLowerCase()) {
      case 'fija': return '#3B82F6'; // Blue
      case 'indexada': return '#10B981'; // Green
      default: return '#6B7280'; // Gray
    }
  };

  // Tooltip personalizado
  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-white p-3 border border-gray-200 rounded-lg shadow-lg">
          <p className="font-semibold text-gray-900">{data.comercializadora}</p>
          <p className="text-sm text-gray-600 mb-2">{data.oferta}</p>
          <div className="space-y-1">
            <p className="text-sm">
              <span className="font-medium">Ahorro:</span> {data.ahorro.toFixed(0)}€
            </p>
            <p className="text-sm">
              <span className="font-medium">Comisión:</span> {data.comision.toFixed(0)}€
            </p>
            <p className="text-sm">
              <span className="font-medium">Tipo:</span> {data.tipo}
            </p>
          </div>
        </div>
      );
    }
    return null;
  };

  if (data.length === 0) {
    return (
      <div className="h-96 flex items-center justify-center text-gray-500">
        <p>No hay datos para mostrar en la gráfica</p>
      </div>
    );
  }

  const maxAhorro = Math.max(...data.map(d => d.ahorro), 0);
  const maxComision = Math.max(...data.map(d => d.comision), 0);

  return (
    <div className="space-y-4">
      <div className="h-96">
        <ResponsiveContainer width="100%" height="100%">
          <ScatterChart
            margin={{ top: 20, right: 20, bottom: 60, left: 60 }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
            <XAxis 
              type="number" 
              dataKey="ahorro"
              domain={[0, maxAhorro * 1.1]}
              tickLine={false}
              tick={{ fontSize: 10 }}
              label={{ 
                value: 'Ahorro Anual (€)', 
                position: 'insideBottom', 
                offset: -15,
                style: { textAnchor: 'middle', fontSize: 11 }
              }}
            />
            <YAxis 
              type="number" 
              dataKey="comision"
              domain={[0, maxComision * 1.1]}
              tickLine={false}
              tick={{ fontSize: 10 }}
              label={{ 
                value: 'Comisión (€)', 
                angle: -90, 
                position: 'insideLeft',
                style: { textAnchor: 'middle', fontSize: 11 }
              }}
            />
            <Tooltip content={<CustomTooltip />} />
            <Scatter data={data} fill="#3B82F6">
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={getColor(entry.tipo)} />
              ))}
            </Scatter>
          </ScatterChart>
        </ResponsiveContainer>
      </div>

      {/* Leyenda */}
      <div className="flex flex-wrap gap-4 justify-center">
        <div className="flex items-center space-x-2">
          <div className="w-4 h-4 bg-blue-500 rounded-full"></div>
          <span className="text-sm text-gray-600">Tarifa Fija</span>
        </div>
        <div className="flex items-center space-x-2">
          <div className="w-4 h-4 bg-green-500 rounded-full"></div>
          <span className="text-sm text-gray-600">Tarifa Indexada</span>
        </div>
      </div>

      {/* Interpretación */}
      <div className="bg-blue-50 rounded-lg p-4 mt-4">
        <h4 className="font-semibold text-blue-900 mb-2">Interpretación de la Matriz</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-blue-800">
          <div>
            <strong>Zona Superior Derecha (Ideal):</strong> Ofertas con alto ahorro para el cliente y alta comisión para el consultor
          </div>
          <div>
            <strong>Zona Superior Izquierda:</strong> Ofertas con alta comisión pero poco ahorro al cliente
          </div>
          <div>
            <strong>Zona Inferior Derecha:</strong> Ofertas con buen ahorro al cliente pero baja comisión
          </div>
          <div>
            <strong>Zona Inferior Izquierda:</strong> Ofertas poco atractivas (bajo ahorro y baja comisión)
          </div>
        </div>
      </div>
    </div>
  );
}
