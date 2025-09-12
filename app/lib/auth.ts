
import type { NextAuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import { prisma } from './db';
import bcryptjs from 'bcryptjs';

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null;
        }

        try {
          console.log('🔍 Intentando autenticar:', credentials.email);
          
          // Permitir login demo para pruebas
          if (credentials.email === 'demo@example.com' && credentials.password === 'demo123') {
            console.log('✅ Login demo exitoso');
            return {
              id: 'demo-user-id',
              email: 'demo@example.com',
              name: 'Usuario Demo'
            };
          }
          
          const user = await prisma.users.findUnique({
            where: {
              email: credentials.email
            }
          });

          if (!user) {
            console.log('❌ Usuario no encontrado:', credentials.email);
            return null;
          }

          if (!user.password) {
            console.log('❌ Usuario sin contraseña:', credentials.email);
            return null;
          }

          const isPasswordValid = await bcryptjs.compare(
            credentials.password,
            user.password
          );

          if (!isPasswordValid) {
            console.log('❌ Contraseña inválida para:', credentials.email);
            return null;
          }

          console.log('✅ Autenticación exitosa:', credentials.email);
          
          return {
            id: user.id,
            email: user.email,
            name: user.name,
          };
        } catch (error) {
          console.error('❌ Error de autenticación:', error);
          return null;
        }
      }
    })
  ],
  session: {
    strategy: 'jwt',
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  cookies: {
    sessionToken: {
      name: `next-auth.session-token`,
      options: {
        httpOnly: true,
        sameSite: 'lax',
        path: '/',
        secure: process.env.NODE_ENV === 'production' ? true : false,
        domain: process.env.NODE_ENV === 'production' ? undefined : 'localhost'
      }
    }
  },
  pages: {
    signIn: '/login'
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.email = user.email;
        token.name = user.name;
      }
      return token;
    },
    async session({ session, token }) {
      if (token && session.user) {
        (session.user as any).id = token.id as string;
        session.user.email = token.email as string;
        session.user.name = token.name as string;
      }
      return session;
    }
  },
  secret: process.env.NEXTAUTH_SECRET
};
