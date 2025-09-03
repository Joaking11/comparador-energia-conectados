
import { Header } from '@/components/header';
import { ResultadosComparativa } from '@/components/resultados-comparativa';

export default function ComparativaPage({ params }: { params: { id: string } }) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <Header />
      <div className="container max-w-7xl mx-auto py-8 px-4">
        <ResultadosComparativa comparativaId={params.id} />
      </div>
    </div>
  );
}
