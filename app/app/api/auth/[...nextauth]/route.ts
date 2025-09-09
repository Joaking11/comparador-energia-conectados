
import NextAuth from 'next-auth';
import { authOptions } from '@/lib/auth';

// Configurar runtime antes de crear el handler
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };
