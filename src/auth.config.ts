import type { NextAuthConfig } from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { loginSchema } from "@/lib/validations/auth";

// Configuración ligera sin adapter ni Prisma — compatible con Edge runtime (middleware)
export const authConfig: NextAuthConfig = {
  trustHost: true,
  session: {
    strategy: "jwt",
  },
  pages: {
    signIn: "/login",
    error: "/login",
  },
  providers: [
    Credentials({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      // authorize vacío aquí — la validación real ocurre en auth.ts
      async authorize() {
        return null;
      },
    }),
  ],
  callbacks: {
    authorized({ auth }) {
      return !!auth;
    },
  },
};
