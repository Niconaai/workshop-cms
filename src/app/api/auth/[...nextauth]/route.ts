import NextAuth from 'next-auth';
import type { AuthConfig } from '@auth/core/types';
import CredentialsProvider from 'next-auth/providers/credentials';
import { PrismaAdapter } from '@auth/prisma-adapter';
import { PrismaClient, UserRole } from '@prisma/client'; // Import UserRole here
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

export const authOptions: AuthConfig = {
    adapter: PrismaAdapter(prisma) as any,
    providers: [
        CredentialsProvider({
            name: 'Credentials',
            credentials: {
                email: { label: "Email", type: "email", placeholder: "jsmith@garages.co.za" },
                password: { label: "Password", type: "password" }
            },
            async authorize(credentials): Promise<any | null> { 
                if (!credentials?.email || !credentials.password) {
                    return null;
                }
                const email = credentials.email as string;
                const password = credentials.password as string;

                const user = await prisma.user.findUnique({
                    where: { email: email }
                });

                if (!user || !user.hashedPassword || !user.isActive) {
                    return null;
                }

                const isValidPassword = await bcrypt.compare(
                    password,
                    user.hashedPassword
                );

                if (!isValidPassword) {
                    return null;
                }

                return {
                    id: user.id,
                    email: user.email,
                    name: user.name,
                    role: user.role,
                    organizationId: user.organizationId,
                };
            }
        })
    ],
    session: {
        strategy: "jwt",
    },
    callbacks: {
        async jwt({ token, user }) {
            if (user) {
                token.id = (user as any).id;
                token.role = (user as any).role;
                token.organizationId = (user as any).organizationId;
            }
            return token;
        },
        async session({ session, token }) {
             if (session.user && token.id && token.role && token.organizationId) {
                 (session.user as any).id = token.id as string;
                 (session.user as any).role = token.role as UserRole; 
                 (session.user as any).organizationId = token.organizationId as string;
            }
            return session;
        }
    },
    pages: {
        signIn: '/login',
    },
    secret: process.env.NEXTAUTH_SECRET,
    debug: process.env.NODE_ENV === 'development',
};

const handler = NextAuth(authOptions as any);

export { handler as GET, handler as POST };