
import { Header } from '@/components/header';
import { ListadoComercializadoras } from '@/components/listado-comercializadoras';

export default function ComercializadorasPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 to-accent/10">
      <Header />
      <div className="container max-w-6xl mx-auto py-8 px-4">
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
