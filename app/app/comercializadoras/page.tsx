
import { Header } from '@/components/header';
import { ListadoComercializadoras } from '@/components/listado-comercializadoras';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Home } from 'lucide-react';
import Link from 'next/link';

export default function ComercializadorasPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 to-accent/10">
      <Header />
      <div className="container max-w-6xl mx-auto py-8 px-4">
        {/* Navegación superior */}
        <div className="flex items-center gap-4 mb-6">
          <Link href="/">
            <Button variant="outline" className="flex items-center gap-2">
              <ArrowLeft className="h-4 w-4" />
              Volver al Inicio
            </Button>
          </Link>
          <Link href="/nueva-comparativa">
            <Button variant="ghost" className="flex items-center gap-2">
              Nueva Comparativa
            </Button>
          </Link>
          <div className="h-4 border-l border-gray-300"></div>
          <p className="text-sm text-gray-600">Comercializadoras</p>
        </div>

        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Comercializadoras y Ofertas
          </h1>
          <p className="text-gray-600">
            Explora todas las comercializadoras y sus ofertas disponibles
          </p>
        </div>
        
        <ListadoComercializadoras />
      </div>
    </div>
  );
}
