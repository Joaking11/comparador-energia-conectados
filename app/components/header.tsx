
import { Calculator, Zap } from 'lucide-react';
import Link from 'next/link';

export function Header() {
  return (
    <header className="sticky top-0 z-50 w-full border-b bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/60">
      <div className="container flex h-16 items-center justify-between max-w-6xl mx-auto px-4">
        <Link href="/" className="flex items-center space-x-2">
          <div className="flex items-center justify-center w-8 h-8 bg-blue-600 rounded-lg">
            <Zap className="h-5 w-5 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-gray-900">Comparativas Energía</h1>
            <p className="text-sm text-gray-500">Consultor Energético</p>
          </div>
        </Link>
        
        <nav className="flex items-center space-x-6">
          <Link 
            href="/nueva-comparativa"
            className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Calculator className="h-4 w-4" />
            <span>Nueva Comparativa</span>
          </Link>
          <Link 
            href="/historial"
            className="text-gray-600 hover:text-gray-900 transition-colors"
          >
            Historial
          </Link>
        </nav>
      </div>
    </header>
  );
}
