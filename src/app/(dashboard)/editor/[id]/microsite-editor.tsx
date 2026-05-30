"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import {
  Eye,
  Globe2,
  Loader2,
  Plus,
  Save,
  Trash2,
} from "lucide-react";

type ProfileData = {
  name: string;
  bio: string;
  avatarUrl: string | null;
  heroUrl: string | null;
};

type SocialNetwork = {
  id: string;
  network: string;
  url: string;
  label?: string;
};

type LinkButton = {
  id: string;
  label: string;
  url: string;
  color?: string;
};

type InitialMicrosite = {
  id: string;
  title: string;
  slug: string;
  published: boolean;
  templateName: string;
  sections: {
    id: string;
    type: string;
    data: unknown;
  }[];
};

function newId() {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }

  return Math.random().toString(36).slice(2);
}

function readSectionData<T>(sections: InitialMicrosite["sections"], type: string, fallback: T): T {
  const section = sections.find((item) => item.type === type);
  if (!section || typeof section.data !== "object" || section.data === null) return fallback;
  return { ...fallback, ...(section.data as Partial<T>) };
}

function cleanSocials(networks: SocialNetwork[]) {
  return networks
    .map((network) => ({
      ...network,
      network: network.network.trim(),
      url: network.url.trim(),
      label: network.label?.trim(),
    }))
    .filter((network) => network.network && network.url);
}

function cleanButtons(buttons: LinkButton[]) {
  return buttons
    .map((button) => ({
      ...button,
      label: button.label.trim(),
      url: button.url.trim(),
      color: button.color || "#2D1B69",
    }))
    .filter((button) => button.label && button.url);
}

export function MicrositeEditor({ initialMicrosite }: { initialMicrosite: InitialMicrosite }) {
  const initialProfile = useMemo(
    () =>
      readSectionData<ProfileData>(initialMicrosite.sections, "PROFILE", {
        name: initialMicrosite.title,
        bio: "",
        avatarUrl: null,
        heroUrl: null,
      }),
    [initialMicrosite]
  );
  const initialSocial = useMemo(
    () =>
      readSectionData<{ networks: SocialNetwork[] }>(initialMicrosite.sections, "SOCIAL", {
        networks: [],
      }),
    [initialMicrosite]
  );
  const initialLinks = useMemo(
    () =>
      readSectionData<{ buttons: LinkButton[] }>(initialMicrosite.sections, "LINKS", {
        buttons: [],
      }),
    [initialMicrosite]
  );

  const [title, setTitle] = useState(initialMicrosite.title);
  const [profile, setProfile] = useState<ProfileData>(initialProfile);
  const [networks, setNetworks] = useState<SocialNetwork[]>(initialSocial.networks ?? []);
  const [buttons, setButtons] = useState<LinkButton[]>(initialLinks.buttons ?? []);
  const [published, setPublished] = useState(initialMicrosite.published);
  const [status, setStatus] = useState("");
  const [error, setError] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [isPublishing, setIsPublishing] = useState(false);

  async function saveChanges() {
    setError("");
    setStatus("");
    setIsSaving(true);

    const micrositeResponse = await fetch(`/api/microsites/${initialMicrosite.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title }),
    });

    if (!micrositeResponse.ok) {
      const payload = await micrositeResponse.json();
      setIsSaving(false);
      setError(payload.error ?? "No pudimos guardar el titulo.");
      return false;
    }

    const sectionsResponse = await fetch(`/api/microsites/${initialMicrosite.id}/sections`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        profile,
        social: { networks: cleanSocials(networks) },
        links: { buttons: cleanButtons(buttons) },
      }),
    });

    setIsSaving(false);

    if (!sectionsResponse.ok) {
      const payload = await sectionsResponse.json();
      setError(payload.error ?? "No pudimos guardar el contenido.");
      return false;
    }

    setStatus("Cambios guardados.");
    return true;
  }

  async function publish(nextPublished: boolean) {
    setIsPublishing(true);
    const saved = await saveChanges();

    if (!saved) {
      setIsPublishing(false);
      return;
    }

    const response = await fetch(`/api/microsites/${initialMicrosite.id}/publish`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ published: nextPublished }),
    });

    setIsPublishing(false);

    if (!response.ok) {
      const payload = await response.json();
      setError(payload.error ?? "No pudimos cambiar el estado de publicacion.");
      return;
    }

    setPublished(nextPublished);
    setStatus(nextPublished ? "Micrositio publicado." : "Micrositio despublicado.");
  }

  return (
    <div className="p-8 max-w-7xl mx-auto">
      <div className="mb-8 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <p className="text-sm font-medium text-accent">{initialMicrosite.templateName}</p>
          <h1 className="text-2xl font-bold text-gray-900">Editor de micrositio</h1>
          <p className="mt-1 text-gray-500">
            guibay.com/{initialMicrosite.slug} · {published ? "Publicado" : "Borrador"}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          {published && (
            <Link
              href={`/${initialMicrosite.slug}`}
              target="_blank"
              className="inline-flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm font-medium text-gray-700 hover:border-primary hover:text-primary"
            >
              <Eye className="h-4 w-4" />
              Ver sitio
            </Link>
          )}
          <button
            type="button"
            onClick={saveChanges}
            disabled={isSaving || isPublishing}
            className="inline-flex items-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-sm font-semibold text-white hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
            Guardar
          </button>
          <button
            type="button"
            onClick={() => publish(!published)}
            disabled={isSaving || isPublishing}
            className="inline-flex items-center gap-2 rounded-xl bg-accent px-4 py-2.5 text-sm font-semibold text-white hover:bg-accent/90 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isPublishing ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Globe2 className="h-4 w-4" />
            )}
            {published ? "Despublicar" : "Publicar"}
          </button>
        </div>
      </div>

      {(status || error) && (
        <div
          className={`mb-6 rounded-2xl px-4 py-3 text-sm ${
            error ? "bg-red-50 text-red-700" : "bg-green-50 text-green-700"
          }`}
        >
          {error || status}
        </div>
      )}

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_380px]">
        <div className="space-y-6">
          <section className="bg-white rounded-2xl border border-gray-100 p-6 shadow-card">
            <h2 className="text-lg font-semibold text-gray-900">Perfil</h2>
            <div className="mt-5 grid gap-4 sm:grid-cols-2">
              <div>
                <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
                  Nombre interno
                </label>
                <input
                  id="title"
                  value={title}
                  onChange={(event) => {
                    setTitle(event.target.value);
                    setProfile((current) => ({ ...current, name: event.target.value }));
                  }}
                  minLength={2}
                  maxLength={60}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                />
              </div>
              <div>
                <label htmlFor="profile-name" className="block text-sm font-medium text-gray-700 mb-1">
                  Nombre publico
                </label>
                <input
                  id="profile-name"
                  value={profile.name}
                  onChange={(event) =>
                    setProfile((current) => ({ ...current, name: event.target.value }))
                  }
                  maxLength={80}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                />
              </div>
              <div className="sm:col-span-2">
                <label htmlFor="bio" className="block text-sm font-medium text-gray-700 mb-1">
                  Bio
                </label>
                <textarea
                  id="bio"
                  value={profile.bio}
                  onChange={(event) =>
                    setProfile((current) => ({ ...current, bio: event.target.value }))
                  }
                  maxLength={240}
                  rows={4}
                  className="w-full resize-none px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                  placeholder="Cuenta que haces y por que deberian contactarte."
                />
              </div>
              <div>
                <label htmlFor="avatar" className="block text-sm font-medium text-gray-700 mb-1">
                  URL de avatar
                </label>
                <input
                  id="avatar"
                  type="url"
                  value={profile.avatarUrl ?? ""}
                  onChange={(event) =>
                    setProfile((current) => ({ ...current, avatarUrl: event.target.value }))
                  }
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                  placeholder="https://..."
                />
              </div>
              <div>
                <label htmlFor="hero" className="block text-sm font-medium text-gray-700 mb-1">
                  URL de portada
                </label>
                <input
                  id="hero"
                  type="url"
                  value={profile.heroUrl ?? ""}
                  onChange={(event) =>
                    setProfile((current) => ({ ...current, heroUrl: event.target.value }))
                  }
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                  placeholder="https://..."
                />
              </div>
            </div>
          </section>

          <section className="bg-white rounded-2xl border border-gray-100 p-6 shadow-card">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-900">Redes</h2>
              <button
                type="button"
                onClick={() =>
                  setNetworks((current) => [
                    ...current,
                    { id: newId(), network: "instagram", url: "", label: "Instagram" },
                  ])
                }
                className="inline-flex items-center gap-2 rounded-xl border border-gray-200 px-3 py-2 text-sm font-medium text-gray-700 hover:border-primary hover:text-primary"
              >
                <Plus className="h-4 w-4" />
                Agregar
              </button>
            </div>
            <div className="mt-5 space-y-3">
              {networks.map((network, index) => (
                <div key={network.id} className="grid gap-3 rounded-2xl bg-surface-muted p-3 sm:grid-cols-[140px_1fr_auto]">
                  <input
                    value={network.network}
                    onChange={(event) =>
                      setNetworks((current) =>
                        current.map((item, itemIndex) =>
                          itemIndex === index ? { ...item, network: event.target.value } : item
                        )
                      )
                    }
                    className="px-3 py-2 border border-gray-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-primary/20"
                    placeholder="instagram"
                  />
                  <input
                    type="url"
                    value={network.url}
                    onChange={(event) =>
                      setNetworks((current) =>
                        current.map((item, itemIndex) =>
                          itemIndex === index ? { ...item, url: event.target.value } : item
                        )
                      )
                    }
                    className="px-3 py-2 border border-gray-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-primary/20"
                    placeholder="https://instagram.com/tu-cuenta"
                  />
                  <button
                    type="button"
                    onClick={() =>
                      setNetworks((current) => current.filter((item) => item.id !== network.id))
                    }
                    className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-gray-200 text-gray-500 hover:border-red-200 hover:text-red-600"
                    aria-label="Eliminar red"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              ))}
              {networks.length === 0 && (
                <p className="rounded-2xl bg-surface-muted p-4 text-sm text-gray-500">
                  Todavia no hay redes agregadas.
                </p>
              )}
            </div>
          </section>

          <section className="bg-white rounded-2xl border border-gray-100 p-6 shadow-card">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-900">Botones</h2>
              <button
                type="button"
                onClick={() =>
                  setButtons((current) => [
                    ...current,
                    { id: newId(), label: "Visitar tienda", url: "", color: "#2D1B69" },
                  ])
                }
                className="inline-flex items-center gap-2 rounded-xl border border-gray-200 px-3 py-2 text-sm font-medium text-gray-700 hover:border-primary hover:text-primary"
              >
                <Plus className="h-4 w-4" />
                Agregar
              </button>
            </div>
            <div className="mt-5 space-y-3">
              {buttons.map((button, index) => (
                <div key={button.id} className="grid gap-3 rounded-2xl bg-surface-muted p-3 sm:grid-cols-[1fr_1.4fr_64px_auto]">
                  <input
                    value={button.label}
                    onChange={(event) =>
                      setButtons((current) =>
                        current.map((item, itemIndex) =>
                          itemIndex === index ? { ...item, label: event.target.value } : item
                        )
                      )
                    }
                    className="px-3 py-2 border border-gray-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-primary/20"
                    placeholder="Texto del boton"
                  />
                  <input
                    type="url"
                    value={button.url}
                    onChange={(event) =>
                      setButtons((current) =>
                        current.map((item, itemIndex) =>
                          itemIndex === index ? { ...item, url: event.target.value } : item
                        )
                      )
                    }
                    className="px-3 py-2 border border-gray-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-primary/20"
                    placeholder="https://..."
                  />
                  <input
                    type="color"
                    value={button.color ?? "#2D1B69"}
                    onChange={(event) =>
                      setButtons((current) =>
                        current.map((item, itemIndex) =>
                          itemIndex === index ? { ...item, color: event.target.value } : item
                        )
                      )
                    }
                    className="h-10 w-full rounded-xl border border-gray-200 bg-white p-1"
                    aria-label="Color del boton"
                  />
                  <button
                    type="button"
                    onClick={() =>
                      setButtons((current) => current.filter((item) => item.id !== button.id))
                    }
                    className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-gray-200 text-gray-500 hover:border-red-200 hover:text-red-600"
                    aria-label="Eliminar boton"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              ))}
              {buttons.length === 0 && (
                <p className="rounded-2xl bg-surface-muted p-4 text-sm text-gray-500">
                  Todavia no hay botones agregados.
                </p>
              )}
            </div>
          </section>
        </div>

        <aside className="h-fit rounded-2xl border border-gray-100 bg-white p-6 shadow-card xl:sticky xl:top-6">
          <h2 className="text-lg font-semibold text-gray-900">Preview</h2>
          <div className="mt-5 overflow-hidden rounded-[28px] border-8 border-gray-900 bg-gray-50 shadow-card">
            {profile.heroUrl && (
              <div
                className="h-32 bg-cover bg-center"
                style={{ backgroundImage: `url(${profile.heroUrl})` }}
              />
            )}
            <div className="px-5 py-6 text-center">
              {profile.avatarUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={profile.avatarUrl}
                  alt={profile.name}
                  className="mx-auto h-20 w-20 rounded-full border-4 border-white object-cover shadow-md"
                />
              ) : (
                <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-primary/10 text-lg font-bold text-primary">
                  {profile.name?.[0]?.toUpperCase() ?? "G"}
                </div>
              )}
              <h3 className="mt-4 text-xl font-bold text-gray-900">{profile.name || title}</h3>
              {profile.bio && <p className="mt-2 text-sm text-gray-500">{profile.bio}</p>}

              {cleanSocials(networks).length > 0 && (
                <div className="mt-5 flex flex-wrap justify-center gap-2">
                  {cleanSocials(networks).map((network) => (
                    <span
                      key={network.id}
                      className="flex h-9 w-9 items-center justify-center rounded-full bg-gray-100 text-xs font-bold text-gray-600"
                    >
                      {network.network[0]?.toUpperCase()}
                    </span>
                  ))}
                </div>
              )}

              {cleanButtons(buttons).length > 0 && (
                <div className="mt-5 space-y-3">
                  {cleanButtons(buttons).map((button) => (
                    <div
                      key={button.id}
                      className="rounded-xl px-4 py-3 text-sm font-semibold text-white"
                      style={{ backgroundColor: button.color ?? "#2D1B69" }}
                    >
                      {button.label}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}
