import Link from "next/link";
import type { Metadata } from "next";
import { LoginForm } from "./login-form";

export const metadata: Metadata = {
  title: "Iniciar sesion",
};

interface Props {
  searchParams: Promise<{ callbackUrl?: string }>;
}

function safeCallbackUrl(value: string | undefined) {
  if (!value || !value.startsWith("/") || value.startsWith("//")) return "/dashboard";
  return value;
}

export default async function LoginPage({ searchParams }: Props) {
  const params = await searchParams;
  const callbackUrl = safeCallbackUrl(params.callbackUrl);

  return (
    <div className="min-h-screen bg-surface-muted flex items-center justify-center p-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <Link href="/" className="text-2xl font-bold text-primary">
            Guibay
          </Link>
          <h1 className="mt-4 text-xl font-semibold text-gray-900">
            Bienvenido de vuelta
          </h1>
          <p className="mt-1 text-sm text-gray-500">Inicia sesion en tu cuenta</p>
        </div>

        <LoginForm callbackUrl={callbackUrl} />

        <p className="text-center text-sm text-gray-500 mt-6">
          No tienes cuenta?{" "}
          <Link href="/register" className="text-primary font-medium hover:underline">
            Crear cuenta gratis
          </Link>
        </p>
      </div>
    </div>
  );
}
