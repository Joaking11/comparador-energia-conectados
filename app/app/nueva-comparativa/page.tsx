
import { Header } from '@/components/header';
import { FormularioConOCR } from '@/components/formulario-con-ocr';

export default function NuevaComparativaPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <Header />
      <div className="container max-w-4xl mx-auto py-8 px-4">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Nueva Comparativa Energética
          </h1>
          <p className="text-gray-600">
            Introduce los datos del cliente y su consumo para calcular las mejores ofertas
          </p>
        </div>
        
        <FormularioConOCR />
      </div>
    </div>
  );
}
