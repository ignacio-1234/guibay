"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Check, Loader2, Lock } from "lucide-react";

type TemplateColors = {
  background: string;
  primary: string;
  accent: string;
  text: string;
};

type TemplateConfig = {
  colors: TemplateColors;
  layout: string;
  style?: string;
};

type Template = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  category: string;
  tier: "FREE" | "PRO";
  locked?: boolean;
  config: TemplateConfig;
};

type SlugState =
  | { status: "idle"; message: string }
  | { status: "checking"; message: string }
  | { status: "available"; message: string; slug: string }
  | { status: "unavailable"; message: string };

function toClientSlug(value: string) {
  return value
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 40);
}

// ── Visual mini-preview por template ──────────────────────

function TemplateMiniPreview({ slug, config }: { slug: string; config: TemplateConfig }) {
  const { colors, layout } = config;
  const style = config.style ?? slug;

  // Brutalismo: bordes gruesos y sombras duras.
  if (style === "brutal") {
    return (
      <div
        className="h-full flex flex-col items-center px-4 py-6"
        style={{ background: colors.background, outline: `3px solid ${colors.primary}`, outlineOffset: "-3px" }}
      >
        <div className="w-10 h-10 mb-3 flex-shrink-0" style={{ background: colors.primary }} />
        <div className="h-2.5 w-16 mb-1" style={{ background: colors.primary }} />
        <div className="h-1.5 w-20 mb-auto" style={{ background: `${colors.text}55` }} />
        <div className="w-full space-y-1.5 mt-4">
          <div className="h-8" style={{ background: colors.accent, boxShadow: `3px 3px 0 ${colors.primary}` }} />
          <div className="h-8" style={{ background: colors.background, border: `3px solid ${colors.primary}` }} />
        </div>
      </div>
    );
  }

  // Minimalismo: hairlines, mucho aire.
  if (style === "minimal") {
    return (
      <div className="h-full flex flex-col items-center px-4 py-7" style={{ background: colors.background }}>
        <div className="w-10 h-10 rounded-full mb-4 flex-shrink-0" style={{ border: `1px solid ${colors.text}40` }} />
        <div className="h-1.5 rounded-full w-14 mb-2" style={{ background: colors.primary }} />
        <div className="h-px w-20 mb-auto" style={{ background: `${colors.text}30` }} />
        <div className="w-full mt-4">
          <div className="h-px w-full mb-3" style={{ background: `${colors.text}20` }} />
          <div className="space-y-2">
            <div className="h-px w-full" style={{ background: `${colors.text}30` }} />
            <div className="h-px w-full" style={{ background: `${colors.text}20` }} />
          </div>
        </div>
      </div>
    );
  }

  // Glassmorphism: tarjetas de vidrio sobre degradado.
  if (style === "glass") {
    return (
      <div
        className="h-full flex flex-col items-center px-4 py-6"
        style={{ background: `radial-gradient(60% 50% at 20% 10%, ${colors.primary}55, transparent 70%), radial-gradient(50% 45% at 85% 20%, ${colors.accent}55, transparent 70%), ${colors.background}` }}
      >
        <div className="w-10 h-10 rounded-full mb-3 flex-shrink-0" style={{ background: "rgba(255,255,255,0.45)", border: "1px solid rgba(255,255,255,0.7)" }} />
        <div className="h-2 rounded-full w-14 mb-auto" style={{ background: colors.primary }} />
        <div className="w-full space-y-1.5 mt-4">
          <div className="h-7 rounded-lg" style={{ background: "rgba(255,255,255,0.4)", border: "1px solid rgba(255,255,255,0.7)", backdropFilter: "blur(4px)" }} />
          <div className="h-7 rounded-lg" style={{ background: `${colors.primary}cc` }} />
        </div>
      </div>
    );
  }

  // Claymorphism: formas esponjosas con doble sombra.
  if (style === "clay") {
    return (
      <div className="h-full flex flex-col items-center px-4 py-6" style={{ background: colors.background }}>
        <div className="w-10 h-10 rounded-2xl mb-3 flex-shrink-0" style={{ background: colors.background, boxShadow: `4px 4px 8px ${colors.primary}33, -4px -4px 8px #fff` }} />
        <div className="h-2 rounded-full w-14 mb-auto" style={{ background: colors.primary }} />
        <div className="w-full space-y-2 mt-4">
          <div className="h-7 rounded-2xl" style={{ background: colors.background, boxShadow: `4px 4px 8px ${colors.primary}33, -4px -4px 8px #fff` }} />
          <div className="h-7 rounded-2xl" style={{ background: colors.accent, boxShadow: `4px 4px 8px ${colors.accent}55` }} />
        </div>
      </div>
    );
  }

  // UI Espacial: oscuro con neón.
  if (style === "spatial") {
    return (
      <div
        className="h-full flex flex-col items-center px-4 py-6"
        style={{ background: `radial-gradient(55% 45% at 25% 10%, ${colors.primary}44, transparent 65%), ${colors.background}` }}
      >
        <div className="w-10 h-10 rounded-full mb-3 flex-shrink-0" style={{ background: "transparent", border: `2px solid ${colors.primary}`, boxShadow: `0 0 12px ${colors.accent}` }} />
        <div className="h-2 rounded-full w-14 mb-auto" style={{ background: `linear-gradient(90deg, ${colors.primary}, ${colors.accent})` }} />
        <div className="w-full space-y-1.5 mt-4">
          <div className="h-7 rounded-lg" style={{ background: `linear-gradient(120deg, ${colors.primary}, ${colors.accent})` }} />
          <div className="h-7 rounded-lg" style={{ background: `${colors.primary}22`, border: `1px solid ${colors.primary}55` }} />
        </div>
      </div>
    );
  }

  // Maximalismo: tipografía enorme y bloques de color.
  if (style === "maximal") {
    return (
      <div className="h-full flex flex-col items-center px-4 py-5" style={{ background: colors.background }}>
        <div className="w-full h-6 mb-1" style={{ background: colors.primary }} />
        <div className="w-full h-6 mb-auto" style={{ background: colors.accent }} />
        <div className="w-full space-y-1.5 mt-3">
          <div className="h-7 rounded-lg" style={{ background: colors.accent, border: `3px solid ${colors.primary}`, boxShadow: `4px 4px 0 ${colors.primary}` }} />
          <div className="h-7 rounded-lg" style={{ background: colors.background, border: `3px solid ${colors.primary}`, boxShadow: `4px 4px 0 ${colors.primary}` }} />
        </div>
      </div>
    );
  }

  if (layout === "full-width") {
    return (
      <div className="h-full flex flex-col">
        <div
          className="flex-none h-1/2 flex flex-col items-center px-4 pt-5 pb-6"
          style={{ background: colors.background }}
        >
          <div
            className="w-10 h-10 rounded-full mb-2 flex-shrink-0"
            style={{ background: `${colors.primary}40`, border: `2px solid ${colors.primary}60` }}
          />
          <div className="h-2 rounded-full w-14" style={{ background: colors.primary }} />
        </div>
        <div className="flex-1 bg-white px-4 py-3 space-y-1.5">
          <div className="h-7 rounded-lg" style={{ background: colors.primary }} />
          <div
            className="h-7 rounded-lg border"
            style={{ borderColor: colors.accent, background: "transparent" }}
          />
        </div>
      </div>
    );
  }

  if (layout === "card") {
    return (
      <div
        className="h-full p-3 flex flex-col items-center justify-center"
        style={{ background: colors.background }}
      >
        <div className="w-full bg-white rounded-xl overflow-hidden shadow-sm">
          <div
            className="h-14 flex flex-col items-center justify-center pt-3"
            style={{ background: `linear-gradient(135deg, ${colors.primary}, ${colors.accent})` }}
          >
            <div className="w-8 h-8 rounded-full bg-white/30 mb-1" />
          </div>
          <div className="px-3 py-3 space-y-1.5">
            <div className="h-1.5 rounded-full w-14 mx-auto" style={{ background: colors.primary }} />
            <div className="h-1 rounded-full w-20 mx-auto mb-2" style={{ background: `${colors.text}40` }} />
            <div className="h-6 rounded-lg" style={{ background: colors.primary }} />
            <div className="h-6 rounded-lg" style={{ background: colors.accent }} />
          </div>
        </div>
      </div>
    );
  }

  // Default: centered (clásico, mindfull, oscuro-pro, etc.)
  return (
    <div
      className="h-full flex flex-col items-center px-4 py-6"
      style={{ background: colors.background }}
    >
      <div
        className="w-10 h-10 rounded-full mb-2 flex-shrink-0"
        style={{ background: `${colors.primary}30` }}
      />
      <div className="h-2 rounded-full w-14 mb-1" style={{ background: colors.primary }} />
      <div className="h-1 rounded-full w-20 mb-auto" style={{ background: `${colors.text}40` }} />
      <div className="w-full space-y-1.5 mt-4">
        <div className="h-7 rounded-xl" style={{ background: colors.primary }} />
        <div className="h-7 rounded-xl" style={{ background: colors.accent }} />
      </div>
    </div>
  );
}

// ── Formulario ─────────────────────────────────────────────

export function NewMicrositeForm() {
  const router = useRouter();
  const [templates, setTemplates] = useState<Template[]>([]);
  const [selectedTemplateId, setSelectedTemplateId] = useState("");
  const [title, setTitle] = useState("");
  const [slug, setSlug] = useState("");
  const [slugWasEdited, setSlugWasEdited] = useState(false);
  const [slugState, setSlugState] = useState<SlugState>({
    status: "idle",
    message: "Escribe un nombre para reservar tu URL.",
  });
  const [error, setError] = useState("");
  const [isLoadingTemplates, setIsLoadingTemplates] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const selectedTemplate = useMemo(
    () => templates.find((t) => t.id === selectedTemplateId),
    [templates, selectedTemplateId]
  );

  useEffect(() => {
    let mounted = true;

    async function loadTemplates() {
      setIsLoadingTemplates(true);
      const response = await fetch("/api/templates");

      if (!mounted) return;

      if (!response.ok) {
        setError("No pudimos cargar las plantillas.");
        setIsLoadingTemplates(false);
        return;
      }

      const payload = await response.json();
      const loaded = (payload.data ?? []) as Template[];
      setTemplates(loaded);
      setSelectedTemplateId(
        loaded.find((t) => !t.locked)?.id ?? loaded[0]?.id ?? ""
      );
      setIsLoadingTemplates(false);
    }

    loadTemplates();
    return () => { mounted = false; };
  }, []);

  useEffect(() => {
    if (slugWasEdited) return;
    setSlug(toClientSlug(title));
  }, [title, slugWasEdited]);

  useEffect(() => {
    if (slug.length < 3) {
      setSlugState({ status: "idle", message: "El slug necesita al menos 3 caracteres." });
      return;
    }

    const controller = new AbortController();
    const timeout = window.setTimeout(async () => {
      setSlugState({ status: "checking", message: "Revisando disponibilidad..." });

      try {
        const response = await fetch(
          `/api/microsites/slug-check?slug=${encodeURIComponent(slug)}`,
          { signal: controller.signal }
        );

        if (!response.ok) {
          setSlugState({ status: "unavailable", message: "No pudimos validar el slug." });
          return;
        }

        const payload = await response.json();
        setSlugState(
          payload.available
            ? { status: "available", message: `Disponible: /${payload.slug}`, slug: payload.slug }
            : { status: "unavailable", message: "Ese slug ya está en uso." }
        );
      } catch (err) {
        if ((err as Error).name !== "AbortError") {
          setSlugState({ status: "unavailable", message: "No pudimos validar el slug." });
        }
      }
    }, 350);

    return () => {
      controller.abort();
      window.clearTimeout(timeout);
    };
  }, [slug]);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");

    if (!selectedTemplateId || selectedTemplate?.locked) {
      setError("Elige una plantilla disponible.");
      return;
    }

    if (slugState.status !== "available") {
      setError("Elige un slug disponible antes de continuar.");
      return;
    }

    setIsSubmitting(true);

    const response = await fetch("/api/microsites", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title,
        slug: slugState.slug,
        templateId: selectedTemplateId,
      }),
    });

    const payload = await response.json();
    setIsSubmitting(false);

    if (!response.ok) {
      setError(payload.error ?? "No pudimos crear el micrositio.");
      return;
    }

    router.push(`/editor/${payload.data.id}`);
    router.refresh();
  }

  return (
    <form className="grid gap-6 lg:grid-cols-[1fr_360px]" onSubmit={handleSubmit}>
      <div className="space-y-6">
        {/* Datos base */}
        <section className="bg-white rounded-2xl border border-gray-100 p-6 shadow-card">
          <h2 className="text-lg font-bold text-gray-900">Datos base</h2>
          <div className="mt-5 grid gap-4 sm:grid-cols-2">
            <div>
              <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
                Nombre del negocio
              </label>
              <input
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
                minLength={2}
                maxLength={60}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all"
                placeholder="Cafe Aurora"
              />
            </div>
            <div>
              <label htmlFor="slug" className="block text-sm font-medium text-gray-700 mb-1">
                URL pública
              </label>
              <div className="flex rounded-xl border border-gray-200 focus-within:ring-2 focus-within:ring-primary/30 focus-within:border-primary">
                <span className="px-3 py-3 text-sm text-gray-400">/</span>
                <input
                  id="slug"
                  value={slug}
                  onChange={(e) => {
                    setSlugWasEdited(true);
                    setSlug(toClientSlug(e.target.value));
                  }}
                  required
                  minLength={3}
                  maxLength={40}
                  className="min-w-0 flex-1 rounded-r-xl py-3 pr-4 text-sm outline-none"
                  placeholder="cafe-aurora"
                />
              </div>
              <p
                className={`mt-2 text-xs ${
                  slugState.status === "available"
                    ? "text-green-700"
                    : slugState.status === "unavailable"
                      ? "text-red-600"
                      : "text-gray-500"
                }`}
              >
                {slugState.message}
              </p>
            </div>
          </div>
        </section>

        {/* Plantillas */}
        <section className="bg-white rounded-2xl border border-gray-100 p-6 shadow-card">
          <div className="flex items-center justify-between gap-4 mb-5">
            <h2 className="text-lg font-bold text-gray-900">Elige tu estilo</h2>
            {isLoadingTemplates && (
              <Loader2 className="h-4 w-4 animate-spin text-gray-400" aria-hidden="true" />
            )}
          </div>

          <div className="grid gap-3 grid-cols-2 sm:grid-cols-3">
            {templates.map((template) => {
              const isSelected = selectedTemplateId === template.id;

              return (
                <button
                  key={template.id}
                  type="button"
                  disabled={template.locked}
                  onClick={() => setSelectedTemplateId(template.id)}
                  className={`rounded-2xl border overflow-hidden text-left transition-all disabled:cursor-not-allowed disabled:opacity-50 ${
                    isSelected
                      ? "border-primary ring-2 ring-primary/10"
                      : "border-gray-100 hover:border-primary/40 hover:shadow-sm"
                  }`}
                >
                  {/* Visual preview */}
                  <div className="aspect-[3/4] relative overflow-hidden">
                    <TemplateMiniPreview slug={template.slug} config={template.config} />
                    {template.locked && (
                      <div className="absolute inset-0 bg-white/70 flex items-center justify-center">
                        <Lock className="h-5 w-5 text-gray-400" aria-hidden="true" />
                      </div>
                    )}
                    {isSelected && (
                      <div className="absolute top-2 right-2 w-6 h-6 rounded-full bg-primary flex items-center justify-center shadow-sm">
                        <Check className="h-3.5 w-3.5 text-white" aria-hidden="true" />
                      </div>
                    )}
                  </div>

                  {/* Info */}
                  <div className="p-3 border-t border-gray-100 bg-white">
                    <div className="flex items-start justify-between gap-1.5 mb-0.5">
                      <p className="font-semibold text-gray-900 text-sm leading-snug">
                        {template.name}
                      </p>
                      <span
                        className={`text-xs px-1.5 py-0.5 rounded font-medium flex-shrink-0 ${
                          template.tier === "FREE"
                            ? "bg-green-50 text-green-700"
                            : "bg-primary/10 text-primary"
                        }`}
                      >
                        {template.tier === "FREE" ? "Gratis" : "Pro"}
                      </span>
                    </div>
                    {template.description && (
                      <p className="text-xs text-gray-400 leading-snug">
                        {template.description}
                      </p>
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        </section>
      </div>

      {/* Preview aside */}
      <aside className="bg-white rounded-2xl border border-gray-100 p-6 shadow-card h-fit">
        <h2 className="text-lg font-bold text-gray-900">Vista previa</h2>
        <div className="mt-5 rounded-[28px] border-8 border-gray-900 bg-gray-50 overflow-hidden shadow-card">
          <div className="p-5 text-center">
            <div className="mx-auto h-16 w-16 rounded-full bg-primary/10" />
            <h3 className="mt-4 font-semibold text-gray-900">{title || "Tu negocio"}</h3>
            <p className="mt-2 text-sm text-gray-500">
              Tu bio, redes y botones aparecerán aquí después de editar.
            </p>
            <div className="mt-5 space-y-3">
              <div className="h-11 rounded-xl bg-primary" />
              <div className="h-11 rounded-xl bg-accent" />
            </div>
          </div>
        </div>

        {error && (
          <p className="mt-4 rounded-xl bg-red-50 p-3 text-sm text-red-700">{error}</p>
        )}

        <button
          type="submit"
          disabled={isSubmitting || slugState.status !== "available" || !selectedTemplateId}
          className="mt-5 flex w-full items-center justify-center gap-2 rounded-xl bg-accent px-4 py-3 text-sm font-bold text-white transition-colors hover:bg-accent/90 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isSubmitting && <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />}
          Crear y abrir editor
        </button>
      </aside>
    </form>
  );
}
