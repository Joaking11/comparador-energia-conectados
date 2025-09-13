
import { Calculator, Settings } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';

export function Header() {
  return (
    <header className="sticky top-0 z-50 w-full border-b bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/60">
      <div className="container flex h-16 items-center justify-between max-w-6xl mx-auto px-4">
        <Link href="/" className="flex items-center space-x-3">
          <div className="h-10 w-auto">
            <Image
              src="/conectados-logo.png"
              alt="Conectados Consulting"
              width={120}
              height={40}
              className="h-10 w-auto object-contain"
            />
          </div>
          <div className="border-l border-gray-300 pl-3">
            <h1 className="text-lg font-bold text-gray-900">Comparativas Energía</h1>
            <p className="text-xs text-gray-600">Conectados Consulting</p>
          </div>
        </Link>
        
        <nav className="flex items-center space-x-6">
          <Link 
            href="/nueva-comparativa"
            className="flex items-center space-x-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors"
          >
            <Calculator className="h-4 w-4" />
            <span>Nueva Comparativa</span>
          </Link>
          <Link 
            href="/historial"
            className="text-gray-600 hover:text-primary transition-colors"
          >
            Historial
          </Link>
          <Link 
            href="/comercializadoras"
            className="text-gray-600 hover:text-primary transition-colors"
          >
            Comercializadoras
          </Link>
          <Link 
            href="/admin"
            className="flex items-center space-x-2 px-4 py-2 bg-amber-500 text-white rounded-lg hover:bg-amber-600 transition-colors"
          >
            <Settings className="h-4 w-4" />
            <span>Admin</span>
          </Link>
        </nav>
      </div>
    </header>
  );
}
