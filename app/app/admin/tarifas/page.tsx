

'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function TarifasRedirectPage() {
  const router = useRouter();
  
  useEffect(() => {
    // Redirigir inmediatamente a /admin/manage con el tab de tarifas activo
    router.replace('/admin/manage?tab=tarifas');
  }, [router]);

  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
        <p className="mt-4 text-gray-600">Redirigiendo a la gestión unificada...</p>
      </div>
    </div>
  );
}
