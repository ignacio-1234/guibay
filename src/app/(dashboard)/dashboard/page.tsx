import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Dashboard",
};

export default async function DashboardPage() {
  const session = await auth();
  const user = session!.user;

  const microsites = await db.microsite.findMany({
    where: { userId: user.id! },
    include: {
      template: true,
      _count: { select: { analytics: true } },
    },
    orderBy: { updatedAt: "desc" },
  });

  const firstName = user.name?.split(" ")[0] ?? "ahí";

  return (
    <div className="p-8 max-w-5xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Hola, {firstName} 👋</h1>
        <p className="text-gray-500 mt-1">Aquí están tus micrositios</p>
      </div>

      {/* Grid de micrositios */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {microsites.map((site) => (
          <div
            key={site.id}
            className="bg-white rounded-2xl border border-gray-100 shadow-card p-5 flex flex-col gap-4"
          >
            <div className="flex items-start justify-between">
              <div>
                <h2 className="font-semibold text-gray-900">{site.title}</h2>
                <p className="text-xs text-gray-400 font-mono mt-0.5">
                  guibay.com/{site.slug}
                </p>
              </div>
              <span
                className={`text-xs px-2 py-1 rounded-full font-medium ${
                  site.published
                    ? "bg-green-50 text-green-700"
                    : "bg-gray-100 text-gray-500"
                }`}
              >
                {site.published ? "Publicado" : "Borrador"}
              </span>
            </div>

            <p className="text-sm text-gray-500">
              👁 {site._count.analytics} visitas
            </p>

            <div className="flex gap-2">
              <Link
                href={`/editor/${site.id}`}
                className="flex-1 text-center text-sm font-medium bg-primary text-white rounded-xl py-2 hover:bg-primary/90 transition-colors"
              >
                Editar
              </Link>
              {site.published && (
                <a
                  href={`/${site.slug}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 text-center text-sm font-medium border border-gray-200 text-gray-700 rounded-xl py-2 hover:border-primary hover:text-primary transition-colors"
                >
                  Ver sitio ↗
                </a>
              )}
            </div>
          </div>
        ))}

        {/* Card: Crear nuevo */}
        <Link
          href="/dashboard/new"
          className="bg-white rounded-2xl border-2 border-dashed border-gray-200 p-5 flex flex-col items-center justify-center gap-2 min-h-[160px] hover:border-primary hover:text-primary transition-colors group"
        >
          <span className="text-3xl">+</span>
          <span className="text-sm font-medium text-gray-500 group-hover:text-primary transition-colors">
            Crear nuevo micrositio
          </span>
        </Link>
      </div>

      {/* Banner upgrade (solo plan Free) */}
      <div className="mt-8 bg-gradient-to-r from-primary to-primary/80 rounded-2xl p-6 flex items-center justify-between text-white">
        <div>
          <p className="font-semibold">Desbloquea más con Pro</p>
          <p className="text-sm text-white/70 mt-0.5">
            Dominio propio, plantillas premium, analíticas avanzadas
          </p>
        </div>
        <Link
          href="/upgrade"
          className="bg-accent text-white text-sm font-semibold px-5 py-2.5 rounded-full hover:bg-accent/90 transition-colors whitespace-nowrap"
        >
          Ver planes →
        </Link>
      </div>
    </div>
  );
}
