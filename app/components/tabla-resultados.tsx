
'use client';

import { useState } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ArrowUpDown, ArrowUp, ArrowDown, TrendingUp, TrendingDown } from 'lucide-react';

interface OfertaResultado {
  id: string;
  importeCalculado: number;
  ahorroAnual: number;
  comisionGanada: number;
  oferta: {
    id: string;
    nombre: string;
    tipo: string;
    precioEnergia: number;
    precioTermino: number;
    comercializadora: {
      nombre: string;
    };
  };
}

interface TablaResultadosProps {
  ofertas: OfertaResultado[];
  importeActual: number;
}

type SortField = 'comercializadora' | 'oferta' | 'tipo' | 'importe' | 'ahorro' | 'comision';
type SortDirection = 'asc' | 'desc';

export function TablaResultados({ ofertas, importeActual }: TablaResultadosProps) {
  const [sortField, setSortField] = useState<SortField>('ahorro');
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('desc');
    }
  };

  const sortedOfertas = [...ofertas].sort((a, b) => {
    let aValue: any, bValue: any;
    
    switch (sortField) {
      case 'comercializadora':
        aValue = a.oferta.comercializadora.nombre;
        bValue = b.oferta.comercializadora.nombre;
        break;
      case 'oferta':
        aValue = a.oferta.nombre;
        bValue = b.oferta.nombre;
        break;
      case 'tipo':
        aValue = a.oferta.tipo;
        bValue = b.oferta.tipo;
        break;
      case 'importe':
        aValue = a.importeCalculado;
        bValue = b.importeCalculado;
        break;
      case 'ahorro':
        aValue = a.ahorroAnual;
        bValue = b.ahorroAnual;
        break;
      case 'comision':
        aValue = a.comisionGanada;
        bValue = b.comisionGanada;
        break;
      default:
        return 0;
    }
    
    if (typeof aValue === 'string' && typeof bValue === 'string') {
      return sortDirection === 'asc' 
        ? aValue.localeCompare(bValue)
        : bValue.localeCompare(aValue);
    }
    
    return sortDirection === 'asc' 
      ? aValue - bValue
      : bValue - aValue;
  });

  const SortButton = ({ field, children }: { field: SortField, children: React.ReactNode }) => (
    <Button
      variant="ghost"
      size="sm"
      className="h-auto p-0 font-semibold text-left justify-start"
      onClick={() => handleSort(field)}
    >
      {children}
      {sortField === field ? (
        sortDirection === 'asc' ? (
          <ArrowUp className="ml-2 h-4 w-4" />
        ) : (
          <ArrowDown className="ml-2 h-4 w-4" />
        )
      ) : (
        <ArrowUpDown className="ml-2 h-4 w-4 opacity-50" />
      )}
    </Button>
  );

  return (
    <div className="space-y-4">
      {ofertas.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-500">No hay ofertas que coincidan con los filtros seleccionados</p>
        </div>
      ) : (
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[180px]">
                  <SortButton field="comercializadora">Comercializadora</SortButton>
                </TableHead>
                <TableHead className="min-w-[200px]">
                  <SortButton field="oferta">Oferta</SortButton>
                </TableHead>
                <TableHead className="w-[120px]">
                  <SortButton field="tipo">Tipo</SortButton>
                </TableHead>
                <TableHead className="w-[130px] text-right">
                  <SortButton field="importe">Importe Anual</SortButton>
                </TableHead>
                <TableHead className="w-[130px] text-right">
                  <SortButton field="ahorro">Ahorro</SortButton>
                </TableHead>
                <TableHead className="w-[130px] text-right">
                  <SortButton field="comision">Comisión</SortButton>
                </TableHead>
                <TableHead className="w-[100px] text-center">Valoración</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sortedOfertas.map((resultado, index) => {
                const ahorroPercentaje = importeActual > 0 ? (resultado.ahorroAnual / importeActual) * 100 : 0;
                const esTopOferta = index < 3 && resultado.ahorroAnual > 0;
                
                return (
                  <TableRow key={resultado.id} className={esTopOferta ? 'bg-green-50 border-green-200' : ''}>
                    <TableCell className="font-medium">
                      {resultado.oferta.comercializadora.nombre}
                      {index === 0 && resultado.ahorroAnual > 0 && (
                        <Badge variant="default" className="ml-2 bg-green-600">
                          MEJOR
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell>
                      <div>
                        <div className="font-medium">{resultado.oferta.nombre}</div>
                        <div className="text-sm text-gray-500">
                          {resultado.oferta.precioEnergia.toFixed(4)}€/kWh • 
                          {resultado.oferta.precioTermino.toFixed(2)}€/kW·mes
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant={resultado.oferta.tipo === 'Fija' ? 'default' : 'secondary'}>
                        {resultado.oferta.tipo}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right font-mono">
                      {resultado.importeCalculado.toFixed(0)}€
                      <div className="text-sm text-gray-500">
                        {resultado.importeCalculado < importeActual ? (
                          <span className="text-green-600">↓ Menor</span>
                        ) : (
                          <span className="text-red-600">↑ Mayor</span>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className={`font-mono font-semibold ${
                        resultado.ahorroAnual > 0 ? 'text-green-600' : 'text-gray-400'
                      }`}>
                        {resultado.ahorroAnual > 0 ? '+' : ''}{resultado.ahorroAnual.toFixed(0)}€
                      </div>
                      <div className="text-sm text-gray-500">
                        {ahorroPercentaje > 0 ? `${ahorroPercentaje.toFixed(1)}%` : '0%'}
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className={`font-mono font-semibold ${
                        resultado.comisionGanada > 0 ? 'text-blue-600' : 'text-gray-400'
                      }`}>
                        {resultado.comisionGanada > 0 ? '+' : ''}{resultado.comisionGanada.toFixed(0)}€
                      </div>
                    </TableCell>
                    <TableCell className="text-center">
                      {resultado.ahorroAnual > 0 && resultado.comisionGanada > 0 ? (
                        <div title="Excelente: Ahorro + Comisión">
                          <TrendingUp className="h-5 w-5 text-green-600 mx-auto" />
                        </div>
                      ) : resultado.ahorroAnual > 0 ? (
                        <div title="Bueno: Solo ahorro">
                          <TrendingUp className="h-5 w-5 text-blue-600 mx-auto" />
                        </div>
                      ) : resultado.comisionGanada > 0 ? (
                        <div title="Regular: Solo comisión">
                          <TrendingDown className="h-5 w-5 text-orange-600 mx-auto" />
                        </div>
                      ) : (
                        <div className="text-gray-400">--</div>
                      )}
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      )}
      
      <div className="flex justify-between items-center text-sm text-gray-500">
        <p>Mostrando {sortedOfertas.length} ofertas</p>
        <p>Ordenado por: {
          sortField === 'comercializadora' ? 'Comercializadora' :
          sortField === 'oferta' ? 'Oferta' :
          sortField === 'tipo' ? 'Tipo' :
          sortField === 'importe' ? 'Importe' :
          sortField === 'ahorro' ? 'Ahorro' :
          'Comisión'
        } ({sortDirection === 'asc' ? 'A-Z' : 'Z-A'})</p>
      </div>
    </div>
  );
}
