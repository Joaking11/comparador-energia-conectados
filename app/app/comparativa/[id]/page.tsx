
import { Header } from '@/components/header';
import { ResultadosComparativa } from '@/components/resultados-comparativa';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Home } from 'lucide-react';
import Link from 'next/link';

export default function ComparativaPage({ params }: { params: { id: string } }) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 to-accent/10">
      <Header />
      <div className="container max-w-7xl mx-auto py-8 px-4">
        {/* Navegación superior */}
        <div className="flex items-center gap-4 mb-6">
          <Link href="/historial">
            <Button variant="outline" className="flex items-center gap-2">
              <ArrowLeft className="h-4 w-4" />
              Volver al Historial
            </Button>
          </Link>
          <Link href="/">
            <Button variant="ghost" className="flex items-center gap-2">
              <Home className="h-4 w-4" />
              Inicio
            </Button>
          </Link>
          <div className="h-4 border-l border-gray-300"></div>
          <p className="text-sm text-gray-600">Resultados de Comparativa</p>
        </div>
        
        <ResultadosComparativa comparativaId={params.id} />
      </div>
    </div>
  );
}
