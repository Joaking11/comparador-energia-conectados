
import { withAuth } from 'next-auth/middleware';

export default withAuth({
  pages: {
    signIn: '/login',
  },
});

// Configurar qué rutas requieren autenticación
export const config = {
  matcher: [
    // Proteger solo rutas administrativas, no las principales
    '/admin/:path*',
    '/configuracion/:path*',
  ]
};
