import Link from "next/link";

// ── Mini-mockups para cada estilo de template ──────────────

function ClassicPreview() {
  return (
    <div className="h-full bg-white flex flex-col items-center px-4 py-6">
      <div className="w-12 h-12 rounded-full bg-gray-200 mb-3 flex-shrink-0" />
      <div className="h-2 bg-gray-800 rounded-full w-20 mb-1.5" />
      <div className="h-1.5 bg-gray-300 rounded-full w-28 mb-auto" />
      <div className="w-full space-y-2 mt-6">
        <div className="h-9 rounded-xl bg-[#2D1B69]" />
        <div className="h-9 rounded-xl bg-[#FF1654]" />
      </div>
    </div>
  );
}

function BrutalistPreview() {
  return (
    <div
      className="h-full bg-white flex flex-col items-center px-4 py-6"
      style={{ outline: "3px solid #000", outlineOffset: "-3px" }}
    >
      <div className="w-12 h-12 bg-black mb-3 flex-shrink-0" />
      <div className="h-2.5 bg-black w-20 mb-1" />
      <div className="h-1.5 bg-gray-400 w-28 mb-auto" />
      <div className="w-full space-y-2 mt-6">
        <div className="h-9 bg-black" />
        <div className="h-9 bg-white" style={{ border: "3px solid #000" }} />
      </div>
    </div>
  );
}

function MinimalistPreview() {
  return (
    <div className="h-full bg-gray-50 flex flex-col items-center px-4 py-8">
      <div className="w-11 h-11 rounded-full border border-gray-300 mb-4 flex-shrink-0" />
      <div className="h-1.5 bg-gray-900 rounded-full w-16 mb-2" />
      <div className="h-px bg-gray-300 w-24 mb-auto" />
      <div className="w-full mt-6">
        <div className="h-px bg-gray-200 w-full mb-4" />
        <div className="space-y-2">
          <div className="h-8 border border-gray-300" />
          <div className="h-8 border border-gray-200" />
        </div>
      </div>
    </div>
  );
}

function VibrantePreview() {
  return (
    <div className="h-full flex flex-col">
      <div className="flex-none bg-[#FF1654] flex flex-col items-center px-4 pt-6 pb-8">
        <div className="w-12 h-12 rounded-full border-2 border-white/80 mb-3 flex-shrink-0 bg-white/20" />
        <div className="h-2 bg-white rounded-full w-20 mb-1.5" />
        <div className="h-1.5 bg-white/50 rounded-full w-24" />
      </div>
      <div className="flex-1 bg-white px-4 pb-4 rounded-t-2xl -mt-2 space-y-2 pt-4">
        <div className="h-8 rounded-xl bg-[#2D1B69]" />
        <div className="h-8 rounded-xl border-2 border-[#FF1654]" />
      </div>
    </div>
  );
}

function OscuroPreview() {
  return (
    <div className="h-full bg-[#0F0F1A] flex flex-col items-center px-4 py-6">
      <div className="w-12 h-12 rounded-full border-2 border-white/30 mb-3 flex-shrink-0" />
      <div className="h-2 bg-white rounded-full w-20 mb-1.5" />
      <div className="h-1.5 bg-white/30 rounded-full w-28 mb-auto" />
      <div className="w-full space-y-2 mt-6">
        <div className="h-9 rounded-xl bg-[#FF1654]" />
        <div className="h-9 rounded-xl border border-white/20" />
      </div>
    </div>
  );
}

function NeonPreview() {
  return (
    <div className="h-full bg-[#0A0A0F] flex flex-col items-center px-4 py-6">
      <div className="w-12 h-12 rounded-full mb-3 flex-shrink-0" style={{ border: "2px solid #00FFD1" }} />
      <div className="h-2 rounded-full w-20 mb-1.5" style={{ background: "#00FFD1" }} />
      <div className="h-1.5 rounded-full w-28 mb-auto" style={{ background: "#FF00FF40" }} />
      <div className="w-full space-y-2 mt-6">
        <div className="h-9 rounded-xl" style={{ background: "#00FFD1" }} />
        <div className="h-9 rounded-xl border" style={{ borderColor: "#FF00FF" }} />
      </div>
    </div>
  );
}

function TemplateCard({
  preview,
  name,
  description,
  isFree,
  isNew,
}: {
  preview: React.ReactNode;
  name: string;
  description: string;
  isFree: boolean;
  isNew?: boolean;
}) {
  return (
    <div className="rounded-2xl overflow-hidden border border-gray-200 hover:border-primary hover:shadow-md transition-all">
      <div className="aspect-[3/4] overflow-hidden relative">
        {preview}
        {isNew && (
          <div className="absolute top-3 right-3 bg-accent text-white text-xs font-bold px-2 py-0.5 rounded-full">
            Nuevo
          </div>
        )}
      </div>
      <div className="p-4 bg-white border-t border-gray-100">
        <div className="flex items-start justify-between gap-2 mb-1">
          <p className="font-semibold text-gray-900 text-sm">{name}</p>
          <span
            className={`text-xs px-2 py-0.5 rounded-full font-medium flex-shrink-0 ${
              isFree ? "bg-green-50 text-green-700" : "bg-primary/10 text-primary"
            }`}
          >
            {isFree ? "Gratis" : "Pro"}
          </span>
        </div>
        <p className="text-xs text-gray-500 leading-snug">{description}</p>
      </div>
    </div>
  );
}

// ── Página principal ───────────────────────────────────────

export default function LandingPage() {
  return (
    <main className="min-h-screen bg-white">
      {/* Navbar */}
      <nav className="fixed top-0 w-full z-50 bg-white/95 backdrop-blur-sm border-b border-gray-100">
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
          <span className="text-xl font-bold text-primary">Guibay</span>
          <div className="flex items-center gap-3">
            <Link
              href="/login"
              className="text-sm text-gray-600 hover:text-gray-900 transition-colors"
            >
              Iniciar sesión
            </Link>
            <Link
              href="/register"
              className="bg-primary text-white text-sm font-semibold px-4 py-2 rounded-xl hover:bg-primary/90 transition-colors"
            >
              Crear gratis →
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="pt-28 pb-16 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">
            {/* Text */}
            <div>
              <h1 className="text-5xl lg:text-[3.5rem] font-black text-gray-900 leading-[1.08] text-balance">
                Tu micrositio,{" "}
                <span className="text-accent">listo</span>{" "}
                en minutos.
              </h1>
              <p className="mt-6 text-lg text-gray-600 leading-relaxed max-w-md text-balance">
                Una sola URL para tu perfil, servicios, redes y contacto. Sin código ni
                diseñador. Hecho para negocios y emprendedores en Latinoamérica.
              </p>
              <div className="mt-8 flex flex-col sm:flex-row gap-3">
                <Link
                  href="/register"
                  className="bg-accent text-white font-bold px-8 py-4 rounded-2xl hover:bg-accent/90 transition-colors text-center"
                >
                  Crear mi sitio — gratis
                </Link>
                <Link
                  href="#plantillas"
                  className="border-2 border-primary/30 text-primary font-semibold px-8 py-4 rounded-2xl hover:border-primary hover:bg-primary/[0.04] transition-colors text-center"
                >
                  Ver estilos ↓
                </Link>
              </div>
              <p className="mt-4 text-sm text-gray-400">
                Sin tarjeta de crédito · Listo en 3 minutos
              </p>
            </div>

            {/* Template gallery */}
            <div className="hidden lg:grid grid-cols-2 gap-4">
              {(
                [
                  { label: "Clásico", preview: <ClassicPreview /> },
                  { label: "Brutalista", preview: <BrutalistPreview /> },
                  { label: "Minimalista", preview: <MinimalistPreview /> },
                  { label: "Vibrante", preview: <VibrantePreview /> },
                ] as { label: string; preview: React.ReactNode }[]
              ).map(({ label, preview }) => (
                <div key={label} className="rounded-xl overflow-hidden border border-gray-200 shadow-sm">
                  <div className="aspect-[9/14]">{preview}</div>
                  <div className="bg-white px-3 py-2 border-t border-gray-100">
                    <p className="text-xs font-semibold text-gray-700">{label}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Social proof strip */}
      <div className="border-y border-primary/[0.09] py-4 bg-primary/[0.04]">
        <div className="max-w-6xl mx-auto px-4">
          <p className="text-center text-sm text-gray-500">
            Para{" "}
            <span className="font-semibold text-primary">
              restaurantes, fotógrafos, coaches, diseñadores, músicos, tiendas y freelancers
            </span>
          </p>
        </div>
      </div>

      {/* How it works */}
      <section className="py-20 px-4">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-3xl font-black text-gray-900 text-center mb-14 text-balance">
            De cero a online en 3 pasos
          </h2>
          <div className="grid md:grid-cols-3 gap-10 md:gap-8">
            {[
              {
                num: "01",
                title: "Elige tu estilo",
                desc: "Clásico, brutalista, minimalista o vibrante. Cada plantilla tiene personalidad propia.",
              },
              {
                num: "02",
                title: "Personaliza en minutos",
                desc: "Agrega tu nombre, bio, redes sociales, servicios y datos de contacto. Sin código.",
              },
              {
                num: "03",
                title: "Comparte tu enlace",
                desc: "guibay.com/tu-negocio funciona en Instagram, WhatsApp, Google y donde sea.",
              },
            ].map((step) => (
              <div key={step.num}>
                <p className="text-6xl font-black text-primary-100 mb-3 leading-none select-none">
                  {step.num}
                </p>
                <h3 className="text-lg font-bold text-gray-900 mb-2">{step.title}</h3>
                <p className="text-gray-500 leading-relaxed text-pretty">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Templates section */}
      <section id="plantillas" className="py-20 px-4 bg-gray-50">
        <div className="max-w-6xl mx-auto">
          <div className="mb-12 text-center">
            <h2 className="text-3xl font-black text-gray-900 mb-3 text-balance">
              Elige el estilo de tu página
            </h2>
            <p className="text-gray-500 max-w-xl mx-auto text-pretty">
              Cada plantilla tiene una personalidad propia. Encuentra la que habla por tu negocio.
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 lg:gap-5">
            <TemplateCard
              preview={<ClassicPreview />}
              name="Clásico"
              description="Simple, limpio y profesional para cualquier rubro."
              isFree={true}
            />
            <TemplateCard
              preview={<VibrantePreview />}
              name="Vibrante"
              description="Energía y color para negocios creativos y emprendedores."
              isFree={true}
            />
            <TemplateCard
              preview={<MinimalistPreview />}
              name="Minimalista"
              description="Espacio y calma. El contenido habla solo."
              isFree={false}
              isNew={true}
            />
            <TemplateCard
              preview={<BrutalistPreview />}
              name="Brutalista"
              description="Crudo, directo y sin adornos. Para los que no siguen modas."
              isFree={false}
              isNew={true}
            />
            <TemplateCard
              preview={<OscuroPreview />}
              name="Oscuro Pro"
              description="Dark mode elegante para marcas premium."
              isFree={false}
            />
            <TemplateCard
              preview={<NeonPreview />}
              name="Neon City"
              description="Estética urbana y futurista para creadores y artistas."
              isFree={false}
            />
          </div>
        </div>
      </section>

      {/* Pricing — drenched in primary */}
      <section className="py-20 px-4 bg-primary text-white">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-black text-center mb-3 text-balance">
            Precio simple, sin sorpresas
          </h2>
          <p className="text-center text-white/60 mb-14">
            Empieza gratis y crece cuando lo necesites.
          </p>

          <div className="grid md:grid-cols-2 gap-5 max-w-2xl mx-auto">
            {/* Free */}
            <div className="bg-white/[0.08] border border-white/20 rounded-2xl p-7">
              <p className="text-sm font-semibold text-white/50 mb-1">Free</p>
              <p className="text-4xl font-black text-white mb-1">$0</p>
              <p className="text-sm text-white/40 mb-6">Para siempre</p>
              <ul className="space-y-2.5 mb-8">
                {[
                  "1 micrositio",
                  "Plantillas básicas",
                  "Redes sociales ilimitadas",
                  "guibay.com/tu-negocio",
                  "Analíticas básicas",
                ].map((f) => (
                  <li key={f} className="flex items-center gap-2.5 text-sm text-white/80">
                    <span className="text-accent font-bold">✓</span> {f}
                  </li>
                ))}
              </ul>
              <Link
                href="/register"
                className="block w-full text-center bg-white text-primary font-bold py-3 rounded-xl hover:bg-white/90 transition-colors"
              >
                Empezar gratis
              </Link>
            </div>

            {/* Pro */}
            <div className="bg-white rounded-2xl p-7 relative">
              <div className="absolute -top-3 right-6 bg-accent text-white text-xs font-bold px-3 py-1 rounded-full">
                Más popular
              </div>
              <p className="text-sm font-semibold text-gray-400 mb-1">Pro</p>
              <p className="text-4xl font-black text-gray-900 mb-1">
                $5<span className="text-xl font-semibold text-gray-400">/mes</span>
              </p>
              <p className="text-sm text-gray-400 mb-6">o $48/año — 2 meses gratis</p>
              <ul className="space-y-2.5 mb-8">
                {[
                  "Todo lo de Free",
                  "Micrositios ilimitados",
                  "Todas las plantillas",
                  "Dominio personalizado",
                  "Analíticas avanzadas",
                  "Sin marca Guibay",
                ].map((f) => (
                  <li key={f} className="flex items-center gap-2.5 text-sm text-gray-700">
                    <span className="text-primary font-bold">✓</span> {f}
                  </li>
                ))}
              </ul>
              <Link
                href="/register"
                className="block w-full text-center bg-primary text-white font-bold py-3 rounded-xl hover:bg-primary/90 transition-colors"
              >
                Empezar con Pro
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-20 px-4 text-center bg-primary/[0.04]">
        <div className="max-w-xl mx-auto">
          <h2 className="text-3xl font-black text-gray-900 mb-4 text-balance">
            Tu negocio merece estar online.
          </h2>
          <p className="text-gray-500 mb-8 text-pretty">
            Crea tu micrositio gratis hoy. Sin tarjeta de crédito.
          </p>
          <Link
            href="/register"
            className="inline-block bg-accent text-white font-bold px-10 py-4 rounded-2xl hover:bg-accent/90 transition-colors text-lg"
          >
            Crear mi sitio gratis →
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-10 px-4">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
          <span className="text-lg font-black text-white">Guibay</span>
          <div className="flex flex-wrap items-center justify-center gap-6 text-sm text-gray-400">
            <Link href="/login" className="hover:text-white transition-colors">
              Iniciar sesión
            </Link>
            <Link href="/register" className="hover:text-white transition-colors">
              Crear cuenta
            </Link>
            <Link href="/terms" className="hover:text-white transition-colors">
              Términos
            </Link>
            <Link href="/privacy" className="hover:text-white transition-colors">
              Privacidad
            </Link>
          </div>
          <p className="text-sm text-gray-600">© 2026 Guibay</p>
        </div>
      </footer>
    </main>
  );
}
