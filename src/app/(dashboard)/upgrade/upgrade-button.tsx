"use client";

import { useState } from "react";
import { Loader2, Sparkles } from "lucide-react";
import { formatCLP } from "@/lib/utils";

/**
 * Tarjeta de checkout del plan Pro: selector mensual/anual, precio dinámico
 * y botón que inicia el pago de MercadoPago. Degrada con un mensaje claro si
 * los pagos aún no están configurados.
 */
export function ProCheckout({ monthly, annual }: { monthly: number; annual: number }) {
  const [billing, setBilling] = useState<"monthly" | "annual">("monthly");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const price = billing === "annual" ? annual : monthly;

  async function startCheckout() {
    setLoading(true);
    setMessage("");
    try {
      const res = await fetch("/api/checkout/mercadopago", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ billing }),
      });
      if (res.ok) {
        const { url } = await res.json();
        if (url) {
          window.location.href = url;
          return;
        }
      }
      setMessage("Estamos habilitando los pagos. Vuelve pronto 🙌");
    } catch {
      setMessage("No se pudo iniciar el pago. Intenta de nuevo.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div>
      {/* Selector mensual / anual */}
      <div className="mb-4 inline-flex rounded-xl bg-gray-100 p-1 text-sm">
        <button
          type="button"
          onClick={() => setBilling("monthly")}
          className={`rounded-lg px-3 py-1.5 font-semibold transition ${billing === "monthly" ? "bg-white text-gray-900 shadow-sm" : "text-gray-500"}`}
        >
          Mensual
        </button>
        <button
          type="button"
          onClick={() => setBilling("annual")}
          className={`rounded-lg px-3 py-1.5 font-semibold transition ${billing === "annual" ? "bg-white text-gray-900 shadow-sm" : "text-gray-500"}`}
        >
          Anual <span className="text-accent">−2 meses</span>
        </button>
      </div>

      <p className="text-3xl font-black text-gray-900">
        {formatCLP(price)}
        <span className="text-base font-medium text-gray-400">
          {billing === "annual" ? " /año" : " /mes"}
        </span>
      </p>

      <button
        type="button"
        onClick={startCheckout}
        disabled={loading}
        className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-accent px-5 py-3 text-sm font-bold text-white transition-colors hover:bg-accent/90 disabled:opacity-60"
      >
        {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
        Mejorar a Pro
      </button>
      {message && <p className="mt-2 text-center text-xs text-gray-500">{message}</p>}
    </div>
  );
}
