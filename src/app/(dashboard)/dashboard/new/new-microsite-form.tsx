"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Check, Loader2, Lock, Sparkles } from "lucide-react";

type Template = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  category: string;
  tier: "FREE" | "PRO";
  locked?: boolean;
};

type SlugState =
  | { status: "idle"; message: string }
  | { status: "checking"; message: string }
  | { status: "available"; message: string; slug: string }
  | { status: "unavailable"; message: string };

function toClientSlug(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 40);
}

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
    () => templates.find((template) => template.id === selectedTemplateId),
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
      const loadedTemplates = (payload.data ?? []) as Template[];
      setTemplates(loadedTemplates);
      setSelectedTemplateId(
        loadedTemplates.find((template) => !template.locked)?.id ?? loadedTemplates[0]?.id ?? ""
      );
      setIsLoadingTemplates(false);
    }

    loadTemplates();

    return () => {
      mounted = false;
    };
  }, []);

  useEffect(() => {
    if (slugWasEdited) return;
    setSlug(toClientSlug(title));
  }, [title, slugWasEdited]);

  useEffect(() => {
    if (slug.length < 3) {
      setSlugState({
        status: "idle",
        message: "El slug necesita al menos 3 caracteres.",
      });
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
            ? {
                status: "available",
                message: `Disponible: /${payload.slug}`,
                slug: payload.slug,
              }
            : { status: "unavailable", message: "Ese slug ya esta en uso." }
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
        <section className="bg-white rounded-2xl border border-gray-100 p-6 shadow-card">
          <h2 className="text-lg font-semibold text-gray-900">Datos base</h2>
          <div className="mt-5 grid gap-4 sm:grid-cols-2">
            <div>
              <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
                Nombre del negocio
              </label>
              <input
                id="title"
                value={title}
                onChange={(event) => setTitle(event.target.value)}
                required
                minLength={2}
                maxLength={60}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                placeholder="Cafe Aurora"
              />
            </div>
            <div>
              <label htmlFor="slug" className="block text-sm font-medium text-gray-700 mb-1">
                URL publica
              </label>
              <div className="flex rounded-xl border border-gray-200 focus-within:ring-2 focus-within:ring-primary/20 focus-within:border-primary">
                <span className="px-3 py-3 text-sm text-gray-400">/</span>
                <input
                  id="slug"
                  value={slug}
                  onChange={(event) => {
                    setSlugWasEdited(true);
                    setSlug(toClientSlug(event.target.value));
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

        <section className="bg-white rounded-2xl border border-gray-100 p-6 shadow-card">
          <div className="flex items-center justify-between gap-4">
            <h2 className="text-lg font-semibold text-gray-900">Plantilla</h2>
            {isLoadingTemplates && <Loader2 className="h-4 w-4 animate-spin text-gray-400" />}
          </div>

          <div className="mt-5 grid gap-3 sm:grid-cols-2">
            {templates.map((template) => {
              const isSelected = selectedTemplateId === template.id;

              return (
                <button
                  key={template.id}
                  type="button"
                  disabled={template.locked}
                  onClick={() => setSelectedTemplateId(template.id)}
                  className={`min-h-[132px] rounded-2xl border p-4 text-left transition-all disabled:cursor-not-allowed disabled:opacity-60 ${
                    isSelected
                      ? "border-primary bg-primary/5 ring-2 ring-primary/10"
                      : "border-gray-100 bg-white hover:border-primary/40"
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="font-semibold text-gray-900">{template.name}</p>
                      <p className="mt-1 text-xs uppercase tracking-wide text-gray-400">
                        {template.category}
                      </p>
                    </div>
                    {template.locked ? (
                      <Lock className="h-4 w-4 text-gray-400" />
                    ) : isSelected ? (
                      <Check className="h-4 w-4 text-primary" />
                    ) : (
                      <Sparkles className="h-4 w-4 text-gray-300" />
                    )}
                  </div>
                  <p className="mt-3 text-sm text-gray-500">
                    {template.description ?? "Plantilla lista para personalizar."}
                  </p>
                  <span className="mt-4 inline-flex rounded-full bg-surface px-2.5 py-1 text-xs font-medium text-gray-600">
                    {template.tier}
                  </span>
                </button>
              );
            })}
          </div>
        </section>
      </div>

      <aside className="bg-white rounded-2xl border border-gray-100 p-6 shadow-card h-fit">
        <h2 className="text-lg font-semibold text-gray-900">Vista previa</h2>
        <div className="mt-5 rounded-[28px] border-8 border-gray-900 bg-gray-50 p-5 text-center shadow-card">
          <div className="mx-auto h-16 w-16 rounded-full bg-primary/10" />
          <h3 className="mt-4 font-semibold text-gray-900">{title || "Tu negocio"}</h3>
          <p className="mt-2 text-sm text-gray-500">
            Tu bio, redes y botones apareceran aqui despues de editar.
          </p>
          <div className="mt-5 space-y-3">
            <div className="h-11 rounded-xl bg-primary" />
            <div className="h-11 rounded-xl bg-accent" />
          </div>
        </div>

        {error && <p className="mt-4 rounded-xl bg-red-50 p-3 text-sm text-red-700">{error}</p>}

        <button
          type="submit"
          disabled={isSubmitting || slugState.status !== "available" || !selectedTemplateId}
          className="mt-5 flex w-full items-center justify-center gap-2 rounded-xl bg-accent px-4 py-3 text-sm font-semibold text-white transition-colors hover:bg-accent/90 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isSubmitting && <Loader2 className="h-4 w-4 animate-spin" />}
          Crear y abrir editor
        </button>
      </aside>
    </form>
  );
}
