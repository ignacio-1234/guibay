import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { Check } from "lucide-react";
import { auth } from "@/lib/auth";
import { getEntitlements, PRO_PRICING } from "@/lib/plan";
import { ProCheckout } from "./upgrade-button";

export const metadata: Metadata = {
  title: "Planes",
};

const FREE_FEATURES = [
  "1 micrositio",
  "1 estilo de diseño",
  "Redes sociales ilimitadas",
  "Dominio guibay.com/tu-marca",
  "Analíticas básicas",
];

const PRO_FEATURES = [
  "Hasta 10 micrositios",
  "Los 6 estilos de diseño",
  "Sin marca Guibay",
  "Analíticas avanzadas",
  "Dominio personalizado",
  "Soporte prioritario",
];

export default async function UpgradePage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>;
}) {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");
  const { plan } = await getEntitlements(session.user.id);
  const isPro = plan === "PRO";
  const { status } = await searchParams;

  return (
    <div className="p-6 lg:p-8 max-w-4xl mx-auto">
      {status === "success" && (
        <div className="mb-6 rounded-2xl bg-green-50 px-4 py-3 text-sm text-green-800">
          ¡Pago recibido! Tu plan Pro se activa en cuanto MercadoPago confirme el pago (unos segundos).
        </div>
      )}
      {status === "pending" && (
        <div className="mb-6 rounded-2xl bg-amber-50 px-4 py-3 text-sm text-amber-800">
          Tu pago está pendiente de confirmación. Te activaremos Pro apenas se acredite.
        </div>
      )}
      {status === "failure" && (
        <div className="mb-6 rounded-2xl bg-red-50 px-4 py-3 text-sm text-red-700">
          El pago no se completó. Puedes intentarlo de nuevo cuando quieras.
        </div>
      )}
      <div className="mb-8 text-center">
        <h1 className="text-2xl font-black text-gray-900">Elige tu plan</h1>
        <p className="text-gray-500 mt-1">Empieza gratis y mejora cuando lo necesites.</p>
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        {/* Free */}
        <div className="rounded-2xl border border-gray-200 bg-white p-6 flex flex-col">
          <h2 className="text-lg font-bold text-gray-900">Free</h2>
          <p className="mt-2 text-3xl font-black text-gray-900">$0</p>
          <p className="text-sm text-gray-400">para siempre</p>
          <ul className="mt-5 space-y-2.5 flex-1">
            {FREE_FEATURES.map((f) => (
              <li key={f} className="flex items-start gap-2 text-sm text-gray-600">
                <Check className="h-4 w-4 text-gray-400 flex-shrink-0 mt-0.5" aria-hidden="true" />
                {f}
              </li>
            ))}
          </ul>
          <div className="mt-6">
            {!isPro ? (
              <span className="block rounded-xl border border-gray-200 py-3 text-center text-sm font-semibold text-gray-500">
                Tu plan actual
              </span>
            ) : (
              <span className="block py-3 text-center text-sm text-gray-400">Plan básico</span>
            )}
          </div>
        </div>

        {/* Pro */}
        <div className="relative rounded-2xl border-2 border-accent bg-white p-6 flex flex-col shadow-card">
          <span className="absolute -top-3 left-6 rounded-full bg-accent px-3 py-1 text-xs font-bold text-white">
            Recomendado
          </span>
          <h2 className="text-lg font-bold text-gray-900">Pro</h2>
          <ul className="mt-4 space-y-2.5 flex-1">
            {PRO_FEATURES.map((f) => (
              <li key={f} className="flex items-start gap-2 text-sm text-gray-700">
                <Check className="h-4 w-4 text-accent flex-shrink-0 mt-0.5" aria-hidden="true" />
                {f}
              </li>
            ))}
          </ul>
          <div className="mt-6">
            {isPro ? (
              <span className="block rounded-xl border border-accent/30 bg-accent/5 py-3 text-center text-sm font-semibold text-accent">
                Tu plan actual
              </span>
            ) : (
              <ProCheckout monthly={PRO_PRICING.monthly} annual={PRO_PRICING.annual} />
            )}
          </div>
        </div>
      </div>

      <p className="mt-6 text-center text-xs text-gray-400">
        Puedes cancelar cuando quieras. Los precios están en pesos chilenos (CLP).
      </p>
    </div>
  );
}
