import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { getEntitlements } from "@/lib/plan";
import Link from "next/link";
import { redirect } from "next/navigation";
import { Eye, Plus, ArrowUpRight, Lock, Sparkles } from "lucide-react";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Dashboard",
};

export default async function DashboardPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");
  const user = session.user;

  const [microsites, entitlements] = await Promise.all([
    db.microsite.findMany({
      where: { userId: user.id },
      include: {
        template: true,
        _count: { select: { analytics: true } },
      },
      orderBy: { updatedAt: "desc" },
    }),
    getEntitlements(user.id),
  ]);

  const atLimit = microsites.length >= entitlements.maxMicrosites;
  const firstName = user.name?.split(" ")[0] ?? "ahí";

  return (
    <div className="p-6 lg:p-8 max-w-5xl mx-auto">
      {/* Header */}
      <div className="mb-8 flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-black text-gray-900">Hola, {firstName}</h1>
          <p className="text-gray-500 mt-1">Aquí están tus micrositios</p>
        </div>
        <span className="inline-flex items-center gap-2 rounded-full border border-gray-200 bg-white px-3 py-1.5 text-xs font-medium text-gray-600">
          <span className={`h-1.5 w-1.5 rounded-full ${entitlements.plan === "PRO" ? "bg-accent" : "bg-gray-400"}`} />
          Plan {entitlements.plan === "PRO" ? "Pro" : "Free"} · {microsites.length}/{entitlements.maxMicrosites} sitios
        </span>
      </div>

      {/* Grid de micrositios */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {microsites.map((site) => (
          <div
            key={site.id}
            className="bg-white rounded-2xl border border-gray-100 shadow-card p-5 flex flex-col gap-4"
          >
            <div className="flex items-start justify-between">
              <div className="min-w-0">
                <h2 className="font-semibold text-gray-900 truncate">{site.title}</h2>
                <p className="text-xs text-gray-400 font-mono mt-0.5 truncate">
                  guibay.com/{site.slug}
                </p>
              </div>
              <span
                className={`text-xs px-2 py-1 rounded-full font-medium flex-shrink-0 ml-2 ${
                  site.published
                    ? "bg-green-50 text-green-700"
                    : "bg-gray-100 text-gray-500"
                }`}
              >
                {site.published ? "Publicado" : "Borrador"}
              </span>
            </div>

            <div className="flex items-center gap-1.5 text-sm text-gray-400">
              <Eye className="h-3.5 w-3.5" aria-hidden="true" />
              <span>{site._count.analytics} visitas</span>
            </div>

            <div className="flex gap-2">
              <Link
                href={`/editor/${site.id}`}
                className="flex-1 text-center text-sm font-semibold bg-primary text-white rounded-xl py-2.5 hover:bg-primary/90 transition-colors"
              >
                Editar
              </Link>
              {site.published && (
                <a
                  href={`/${site.slug}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 flex items-center justify-center gap-1.5 text-sm font-semibold border border-gray-200 text-gray-700 rounded-xl py-2.5 hover:border-primary hover:text-primary transition-colors"
                >
                  Ver sitio
                  <ArrowUpRight className="h-3.5 w-3.5" aria-hidden="true" />
                </a>
              )}
            </div>
          </div>
        ))}

        {/* Card: Crear nuevo — o CTA de upgrade si llegó al límite */}
        {atLimit ? (
          <Link
            href="/upgrade"
            className="bg-primary/[0.03] rounded-2xl border-2 border-dashed border-accent/30 p-5 flex flex-col items-center justify-center gap-2 min-h-[160px] hover:border-accent hover:bg-accent/[0.04] transition-colors group text-center"
          >
            <div className="w-10 h-10 rounded-full bg-accent/10 group-hover:bg-accent/15 flex items-center justify-center transition-colors">
              <Lock className="h-5 w-5 text-accent" aria-hidden="true" />
            </div>
            <span className="text-sm font-semibold text-gray-700">Llegaste al límite del plan Free</span>
            <span className="inline-flex items-center gap-1 text-xs font-semibold text-accent">
              <Sparkles className="h-3.5 w-3.5" aria-hidden="true" /> Mejora a Pro para crear más
            </span>
          </Link>
        ) : (
          <Link
            href="/dashboard/new"
            className="bg-white rounded-2xl border-2 border-dashed border-primary/20 p-5 flex flex-col items-center justify-center gap-2 min-h-[160px] hover:border-primary hover:bg-primary/[0.02] transition-colors group"
          >
            <div className="w-10 h-10 rounded-full bg-primary-50 group-hover:bg-primary/15 flex items-center justify-center transition-colors">
              <Plus className="h-5 w-5 text-primary/60 group-hover:text-primary transition-colors" aria-hidden="true" />
            </div>
            <span className="text-sm font-semibold text-primary/60 group-hover:text-primary transition-colors">
              Crear nuevo micrositio
            </span>
          </Link>
        )}
      </div>

      {/* Banner upgrade */}
      <div className="mt-8 bg-primary rounded-2xl p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 text-white">
        <div>
          <p className="font-bold text-lg">Desbloquea más con Pro</p>
          <p className="text-sm text-white/70 mt-0.5">
            Dominio propio, plantillas premium, analíticas avanzadas
          </p>
        </div>
        <Link
          href="/upgrade"
          className="bg-accent text-white text-sm font-bold px-5 py-2.5 rounded-xl hover:bg-accent/90 transition-colors whitespace-nowrap flex-shrink-0"
        >
          Ver planes →
        </Link>
      </div>
    </div>
  );
}
