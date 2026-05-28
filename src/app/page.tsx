import Link from "next/link";

export default function LandingPage() {
  return (
    <main className="min-h-screen bg-white">
      {/* Navbar */}
      <nav className="fixed top-0 w-full z-50 bg-white/90 backdrop-blur-sm border-b border-gray-100">
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
              className="bg-accent text-white text-sm font-medium px-4 py-2 rounded-full hover:bg-accent/90 transition-colors"
            >
              Crear gratis →
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="pt-32 pb-20 px-4 text-center max-w-4xl mx-auto">
        <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6 text-balance">
          Tu negocio,{" "}
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-accent">
            un solo enlace
          </span>
        </h1>
        <p className="text-xl text-gray-500 mb-10 max-w-2xl mx-auto text-balance">
          Crea tu micrositio web en minutos, sin saber programar. Ideal para negocios,
          emprendedores y creadores de contenido en Latinoamérica.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link
            href="/register"
            className="bg-accent text-white font-semibold px-8 py-4 rounded-full hover:bg-accent/90 transition-all hover:scale-105 text-lg"
          >
            Crear mi sitio gratis
          </Link>
          <Link
            href="#ejemplos"
            className="border-2 border-gray-200 text-gray-700 font-semibold px-8 py-4 rounded-full hover:border-primary hover:text-primary transition-all text-lg"
          >
            Ver ejemplo
          </Link>
        </div>
      </section>

      {/* TODO: Secciones de features, templates, precios */}
      <section className="py-16 bg-surface-muted text-center">
        <p className="text-gray-400 text-sm">
          Próximamente: features, plantillas y precios aquí
        </p>
      </section>
    </main>
  );
}
