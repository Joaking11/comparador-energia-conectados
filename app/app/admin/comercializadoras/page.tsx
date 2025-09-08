
import AdminComercializadorasCompleto from '@/components/admin-comercializadoras-completo';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Home } from 'lucide-react';
import Link from 'next/link';

export default function AdminComercializadorasPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-6">
        {/* Navegación superior */}
        <div className="flex items-center gap-4 mb-6">
          <Link href="/admin">
            <Button variant="outline" className="flex items-center gap-2">
              <ArrowLeft className="h-4 w-4" />
              Volver a Admin
            </Button>
          </Link>
          <Link href="/">
            <Button variant="ghost" className="flex items-center gap-2">
              <Home className="h-4 w-4" />
              Inicio
            </Button>
          </Link>
          <div className="h-4 border-l border-gray-300"></div>
          <p className="text-sm text-gray-600">Gestión de Comercializadoras</p>
        </div>
        
        <AdminComercializadorasCompleto />
      </div>
    </div>
  );
}
