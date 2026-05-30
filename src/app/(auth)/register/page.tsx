import Link from "next/link";
import type { Metadata } from "next";
import { RegisterForm } from "./register-form";

export const metadata: Metadata = {
  title: "Crear cuenta",
};

export default function RegisterPage() {
  return (
    <div className="min-h-screen bg-surface-muted flex items-center justify-center p-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <Link href="/" className="text-2xl font-bold text-primary">
            Guibay
          </Link>
          <h1 className="mt-4 text-xl font-semibold text-gray-900">
            Crea tu cuenta gratis
          </h1>
          <p className="mt-1 text-sm text-gray-500">Sin tarjeta de credito requerida</p>
        </div>

        <RegisterForm />

        <p className="text-center text-sm text-gray-500 mt-6">
          Ya tienes cuenta?{" "}
          <Link href="/login" className="text-primary font-medium hover:underline">
            Iniciar sesion
          </Link>
        </p>
      </div>
    </div>
  );
}
