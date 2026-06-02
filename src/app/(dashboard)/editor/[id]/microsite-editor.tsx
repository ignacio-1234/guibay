"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Eye, Globe2, Loader2, Plus, Save, Trash2, Phone, Mail, MapPin, Clock } from "lucide-react";

type ProfileData = { name: string; bio: string; avatarUrl: string | null; heroUrl: string | null };
type SocialNetwork = { id: string; network: string; url: string; label?: string };
type LinkButton = { id: string; label: string; url: string; color?: string };
type ServiceItem = { id: string; title: string; description: string; icon: string };
type ContactData = { phone: string; whatsapp: string; email: string; address: string; hours: string };

type InitialMicrosite = {
  id: string; title: string; slug: string; published: boolean; templateName: string;
  sections: { id: string; type: string; data: unknown }[];
};

function newId() {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) return crypto.randomUUID();
  return Math.random().toString(36).slice(2);
}

function readSectionData<T>(sections: InitialMicrosite["sections"], type: string, fallback: T): T {
  const section = sections.find((item) => item.type === type);
  if (!section || typeof section.data !== "object" || section.data === null) return fallback;
  return { ...fallback, ...(section.data as Partial<T>) };
}

function cleanSocials(networks: SocialNetwork[]) {
  return networks.map((n) => ({ ...n, network: n.network.trim(), url: n.url.trim(), label: n.label?.trim() })).filter((n) => n.network && n.url);
}

function cleanButtons(buttons: LinkButton[]) {
  return buttons.map((b) => ({ ...b, label: b.label.trim(), url: b.url.trim(), color: b.color || "#2D1B69" })).filter((b) => b.label && b.url);
}

export function MicrositeEditor({ initialMicrosite }: { initialMicrosite: InitialMicrosite }) {
  const initialProfile = useMemo(() => readSectionData<ProfileData>(initialMicrosite.sections, "PROFILE", { name: initialMicrosite.title, bio: "", avatarUrl: null, heroUrl: null }), [initialMicrosite]);
  const initialSocial = useMemo(() => readSectionData<{ networks: SocialNetwork[] }>(initialMicrosite.sections, "SOCIAL", { networks: [] }), [initialMicrosite]);
  const initialLinks = useMemo(() => readSectionData<{ buttons: LinkButton[] }>(initialMicrosite.sections, "LINKS", { buttons: [] }), [initialMicrosite]);
  const initialServices = useMemo(() => readSectionData<{ heading: string; items: ServiceItem[] }>(initialMicrosite.sections, "SERVICES", { heading: "Nuestros Servicios", items: [] }), [initialMicrosite]);
  const initialContact = useMemo(() => readSectionData<ContactData>(initialMicrosite.sections, "CONTACT", { phone: "", whatsapp: "", email: "", address: "", hours: "" }), [initialMicrosite]);

  const [title, setTitle] = useState(initialMicrosite.title);
  const [profile, setProfile] = useState<ProfileData>(initialProfile);
  const [networks, setNetworks] = useState<SocialNetwork[]>(initialSocial.networks ?? []);
  const [buttons, setButtons] = useState<LinkButton[]>(initialLinks.buttons ?? []);
  const [servicesHeading, setServicesHeading] = useState(initialServices.heading);
  const [services, setServices] = useState<ServiceItem[]>(initialServices.items ?? []);
  const [contact, setContact] = useState<ContactData>(initialContact);
  const [published, setPublished] = useState(initialMicrosite.published);
  const [status, setStatus] = useState("");
  const [error, setError] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [isPublishing, setIsPublishing] = useState(false);

  const hasServices = services.length > 0 || servicesHeading !== "Nuestros Servicios";
  const hasContact = Object.values(contact).some((v) => v.trim() !== "");

  async function saveChanges() {
    setError(""); setStatus(""); setIsSaving(true);

    const micrositeRes = await fetch(`/api/microsites/${initialMicrosite.id}`, {
      method: "PATCH", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title }),
    });
    if (!micrositeRes.ok) { setIsSaving(false); setError((await micrositeRes.json()).error ?? "Error al guardar título."); return false; }

    const body: Record<string, unknown> = {
      profile,
      social: { networks: cleanSocials(networks) },
      links: { buttons: cleanButtons(buttons) },
    };
    if (hasServices) body.services = { heading: servicesHeading, items: services };
    if (hasContact) body.contact = contact;

    const sectionsRes = await fetch(`/api/microsites/${initialMicrosite.id}/sections`, {
      method: "PATCH", headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    setIsSaving(false);
    if (!sectionsRes.ok) { setError((await sectionsRes.json()).error ?? "Error al guardar contenido."); return false; }
    setStatus("Cambios guardados."); return true;
  }

  async function publish(nextPublished: boolean) {
    setIsPublishing(true);
    const saved = await saveChanges();
    if (!saved) { setIsPublishing(false); return; }
    const res = await fetch(`/api/microsites/${initialMicrosite.id}/publish`, {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ published: nextPublished }),
    });
    setIsPublishing(false);
    if (!res.ok) { setError((await res.json()).error ?? "Error al publicar."); return; }
    setPublished(nextPublished);
    setStatus(nextPublished ? "Micrositio publicado." : "Micrositio despublicado.");
  }

  const inputCls = "w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary";

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-8 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <p className="text-sm font-medium text-accent">{initialMicrosite.templateName}</p>
          <h1 className="text-2xl font-bold text-gray-900">Editor de micrositio</h1>
          <p className="mt-1 text-gray-500">guibay.com/{initialMicrosite.slug} · {published ? "Publicado" : "Borrador"}</p>
        </div>
        <div className="flex flex-wrap gap-2">
          {published && (
            <Link href={`/${initialMicrosite.slug}`} target="_blank" className="inline-flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm font-medium text-gray-700 hover:border-primary hover:text-primary">
              <Eye className="h-4 w-4" /> Ver sitio
            </Link>
          )}
          <button type="button" onClick={saveChanges} disabled={isSaving || isPublishing} className="inline-flex items-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-sm font-semibold text-white hover:bg-primary/90 disabled:opacity-60">
            {isSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />} Guardar
          </button>
          <button type="button" onClick={() => publish(!published)} disabled={isSaving || isPublishing} className="inline-flex items-center gap-2 rounded-xl bg-accent px-4 py-2.5 text-sm font-semibold text-white hover:bg-accent/90 disabled:opacity-60">
            {isPublishing ? <Loader2 className="h-4 w-4 animate-spin" /> : <Globe2 className="h-4 w-4" />}
            {published ? "Despublicar" : "Publicar"}
          </button>
        </div>
      </div>

      {(status || error) && (
        <div className={`mb-6 rounded-2xl px-4 py-3 text-sm ${error ? "bg-red-50 text-red-700" : "bg-green-50 text-green-700"}`}>{error || status}</div>
      )}

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_380px]">
        <div className="space-y-6">

          {/* Perfil */}
          <section className="bg-white rounded-2xl border border-gray-100 p-6 shadow-card">
            <h2 className="text-lg font-semibold text-gray-900">Perfil</h2>
            <div className="mt-5 grid gap-4 sm:grid-cols-2">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nombre interno</label>
                <input value={title} onChange={(e) => { setTitle(e.target.value); setProfile((p) => ({ ...p, name: e.target.value })); }} className={inputCls} />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nombre público</label>
                <input value={profile.name} onChange={(e) => setProfile((p) => ({ ...p, name: e.target.value }))} className={inputCls} />
              </div>
              <div className="sm:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">Bio</label>
                <textarea value={profile.bio} onChange={(e) => setProfile((p) => ({ ...p, bio: e.target.value }))} maxLength={240} rows={3} className={`${inputCls} resize-none`} placeholder="Describe tu negocio en pocas palabras..." />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">URL de avatar</label>
                <input type="url" value={profile.avatarUrl ?? ""} onChange={(e) => setProfile((p) => ({ ...p, avatarUrl: e.target.value }))} className={inputCls} placeholder="https://..." />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">URL de portada</label>
                <input type="url" value={profile.heroUrl ?? ""} onChange={(e) => setProfile((p) => ({ ...p, heroUrl: e.target.value }))} className={inputCls} placeholder="https://..." />
              </div>
            </div>
          </section>

          {/* Redes */}
          <section className="bg-white rounded-2xl border border-gray-100 p-6 shadow-card">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-900">Redes sociales</h2>
              <button type="button" onClick={() => setNetworks((n) => [...n, { id: newId(), network: "instagram", url: "", label: "Instagram" }])} className="inline-flex items-center gap-2 rounded-xl border border-gray-200 px-3 py-2 text-sm font-medium text-gray-700 hover:border-primary hover:text-primary">
                <Plus className="h-4 w-4" /> Agregar
              </button>
            </div>
            <div className="mt-5 space-y-3">
              {networks.map((n, i) => (
                <div key={n.id} className="grid gap-3 rounded-2xl bg-surface-muted p-3 sm:grid-cols-[140px_1fr_auto]">
                  <input value={n.network} onChange={(e) => setNetworks((arr) => arr.map((item, idx) => idx === i ? { ...item, network: e.target.value } : item))} className="px-3 py-2 border border-gray-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-primary/20" placeholder="instagram" />
                  <input type="url" value={n.url} onChange={(e) => setNetworks((arr) => arr.map((item, idx) => idx === i ? { ...item, url: e.target.value } : item))} className="px-3 py-2 border border-gray-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-primary/20" placeholder="https://instagram.com/..." />
                  <button type="button" onClick={() => setNetworks((arr) => arr.filter((item) => item.id !== n.id))} className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-gray-200 text-gray-500 hover:border-red-200 hover:text-red-600"><Trash2 className="h-4 w-4" /></button>
                </div>
              ))}
              {networks.length === 0 && <p className="rounded-2xl bg-surface-muted p-4 text-sm text-gray-500">Sin redes agregadas.</p>}
            </div>
          </section>

          {/* Botones */}
          <section className="bg-white rounded-2xl border border-gray-100 p-6 shadow-card">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-900">Botones de acción</h2>
              <button type="button" onClick={() => setButtons((b) => [...b, { id: newId(), label: "Visitar sitio", url: "", color: "#2D1B69" }])} className="inline-flex items-center gap-2 rounded-xl border border-gray-200 px-3 py-2 text-sm font-medium text-gray-700 hover:border-primary hover:text-primary">
                <Plus className="h-4 w-4" /> Agregar
              </button>
            </div>
            <div className="mt-5 space-y-3">
              {buttons.map((b, i) => (
                <div key={b.id} className="grid gap-3 rounded-2xl bg-surface-muted p-3 sm:grid-cols-[1fr_1.4fr_64px_auto]">
                  <input value={b.label} onChange={(e) => setButtons((arr) => arr.map((item, idx) => idx === i ? { ...item, label: e.target.value } : item))} className="px-3 py-2 border border-gray-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-primary/20" placeholder="Texto del botón" />
                  <input type="url" value={b.url} onChange={(e) => setButtons((arr) => arr.map((item, idx) => idx === i ? { ...item, url: e.target.value } : item))} className="px-3 py-2 border border-gray-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-primary/20" placeholder="https://..." />
                  <input type="color" value={b.color ?? "#2D1B69"} onChange={(e) => setButtons((arr) => arr.map((item, idx) => idx === i ? { ...item, color: e.target.value } : item))} className="h-10 w-full rounded-xl border border-gray-200 bg-white p-1" />
                  <button type="button" onClick={() => setButtons((arr) => arr.filter((item) => item.id !== b.id))} className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-gray-200 text-gray-500 hover:border-red-200 hover:text-red-600"><Trash2 className="h-4 w-4" /></button>
                </div>
              ))}
              {buttons.length === 0 && <p className="rounded-2xl bg-surface-muted p-4 text-sm text-gray-500">Sin botones agregados.</p>}
            </div>
          </section>

          {/* Servicios */}
          <section className="bg-white rounded-2xl border border-gray-100 p-6 shadow-card">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-semibold text-gray-900">Servicios</h2>
                <p className="text-xs text-gray-400 mt-0.5">Lista de lo que ofreces</p>
              </div>
              <button type="button" onClick={() => setServices((s) => [...s, { id: newId(), title: "Nuevo servicio", description: "", icon: "⭐" }])} className="inline-flex items-center gap-2 rounded-xl border border-gray-200 px-3 py-2 text-sm font-medium text-gray-700 hover:border-primary hover:text-primary">
                <Plus className="h-4 w-4" /> Agregar
              </button>
            </div>
            <div className="mt-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">Título de sección</label>
              <input value={servicesHeading} onChange={(e) => setServicesHeading(e.target.value)} className={`${inputCls} mb-4`} placeholder="Nuestros Servicios" />
            </div>
            <div className="space-y-3">
              {services.map((s, i) => (
                <div key={s.id} className="rounded-2xl bg-surface-muted p-4 space-y-3">
                  <div className="grid gap-3 sm:grid-cols-[64px_1fr_auto]">
                    <input value={s.icon} onChange={(e) => setServices((arr) => arr.map((item, idx) => idx === i ? { ...item, icon: e.target.value } : item))} className="px-3 py-2 border border-gray-200 rounded-xl text-lg text-center outline-none" placeholder="⭐" maxLength={4} />
                    <input value={s.title} onChange={(e) => setServices((arr) => arr.map((item, idx) => idx === i ? { ...item, title: e.target.value } : item))} className="px-3 py-2 border border-gray-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-primary/20" placeholder="Nombre del servicio" />
                    <button type="button" onClick={() => setServices((arr) => arr.filter((item) => item.id !== s.id))} className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-gray-200 text-gray-500 hover:border-red-200 hover:text-red-600"><Trash2 className="h-4 w-4" /></button>
                  </div>
                  <input value={s.description} onChange={(e) => setServices((arr) => arr.map((item, idx) => idx === i ? { ...item, description: e.target.value } : item))} className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-primary/20" placeholder="Descripción breve (opcional)" />
                </div>
              ))}
              {services.length === 0 && <p className="rounded-2xl bg-surface-muted p-4 text-sm text-gray-500">Sin servicios agregados. Agrega tus servicios para mostrarlos en tu sitio.</p>}
            </div>
          </section>

          {/* Contacto */}
          <section className="bg-white rounded-2xl border border-gray-100 p-6 shadow-card">
            <h2 className="text-lg font-semibold text-gray-900">Información de contacto</h2>
            <p className="text-xs text-gray-400 mt-0.5 mb-5">Se mostrará en tu sitio público</p>
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="flex items-center gap-1.5 text-sm font-medium text-gray-700 mb-1"><Phone className="h-3.5 w-3.5" /> Teléfono</label>
                <input value={contact.phone} onChange={(e) => setContact((c) => ({ ...c, phone: e.target.value }))} className={inputCls} placeholder="+56 9 1234 5678" />
              </div>
              <div>
                <label className="flex items-center gap-1.5 text-sm font-medium text-gray-700 mb-1"><Phone className="h-3.5 w-3.5 text-green-600" /> WhatsApp</label>
                <input value={contact.whatsapp} onChange={(e) => setContact((c) => ({ ...c, whatsapp: e.target.value }))} className={inputCls} placeholder="+56 9 1234 5678" />
              </div>
              <div>
                <label className="flex items-center gap-1.5 text-sm font-medium text-gray-700 mb-1"><Mail className="h-3.5 w-3.5" /> Email</label>
                <input type="email" value={contact.email} onChange={(e) => setContact((c) => ({ ...c, email: e.target.value }))} className={inputCls} placeholder="hola@tunegocio.com" />
              </div>
              <div>
                <label className="flex items-center gap-1.5 text-sm font-medium text-gray-700 mb-1"><Clock className="h-3.5 w-3.5" /> Horario</label>
                <input value={contact.hours} onChange={(e) => setContact((c) => ({ ...c, hours: e.target.value }))} className={inputCls} placeholder="Lun-Vie 9:00 - 18:00" />
              </div>
              <div className="sm:col-span-2">
                <label className="flex items-center gap-1.5 text-sm font-medium text-gray-700 mb-1"><MapPin className="h-3.5 w-3.5" /> Dirección</label>
                <input value={contact.address} onChange={(e) => setContact((c) => ({ ...c, address: e.target.value }))} className={inputCls} placeholder="Av. Ejemplo 1234, Ciudad" />
              </div>
            </div>
          </section>

        </div>

        {/* Preview */}
        <aside className="h-fit rounded-2xl border border-gray-100 bg-white p-6 shadow-card xl:sticky xl:top-6">
          <h2 className="text-lg font-semibold text-gray-900">Vista previa</h2>
          <div className="mt-5 overflow-hidden rounded-[28px] border-8 border-gray-900 bg-gray-50 shadow-card max-h-[600px] overflow-y-auto">
            {profile.heroUrl && <div className="h-28 bg-cover bg-center" style={{ backgroundImage: `url(${profile.heroUrl})` }} />}
            <div className="px-5 py-5 text-center">
              {profile.avatarUrl
                ? <img src={profile.avatarUrl} alt={profile.name} className="mx-auto h-20 w-20 rounded-full border-4 border-white object-cover shadow-md" />
                : <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-primary/10 text-2xl font-bold text-primary">{profile.name?.[0]?.toUpperCase() ?? "G"}</div>
              }
              <h3 className="mt-3 text-lg font-bold text-gray-900">{profile.name || title}</h3>
              {profile.bio && <p className="mt-1 text-xs text-gray-500 leading-relaxed">{profile.bio}</p>}
              {cleanSocials(networks).length > 0 && (
                <div className="mt-4 flex flex-wrap justify-center gap-2">
                  {cleanSocials(networks).map((n) => <span key={n.id} className="flex h-8 w-8 items-center justify-center rounded-full bg-gray-100 text-xs font-bold text-gray-600">{n.network[0]?.toUpperCase()}</span>)}
                </div>
              )}
              {cleanButtons(buttons).length > 0 && (
                <div className="mt-4 space-y-2">
                  {cleanButtons(buttons).map((b) => <div key={b.id} className="rounded-xl px-4 py-2.5 text-sm font-semibold text-white" style={{ backgroundColor: b.color ?? "#2D1B69" }}>{b.label}</div>)}
                </div>
              )}
              {services.length > 0 && (
                <div className="mt-4 text-left border-t border-gray-100 pt-4">
                  <p className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-2">{servicesHeading}</p>
                  {services.slice(0, 3).map((s) => (
                    <div key={s.id} className="flex items-center gap-2 py-1.5">
                      <span className="text-lg">{s.icon}</span>
                      <span className="text-sm font-medium text-gray-800">{s.title}</span>
                    </div>
                  ))}
                  {services.length > 3 && <p className="text-xs text-gray-400 mt-1">+{services.length - 3} más...</p>}
                </div>
              )}
              {hasContact && (
                <div className="mt-4 text-left border-t border-gray-100 pt-4 space-y-1.5">
                  <p className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-2">Contacto</p>
                  {contact.phone && <p className="text-xs text-gray-600">📞 {contact.phone}</p>}
                  {contact.address && <p className="text-xs text-gray-600">📍 {contact.address}</p>}
                  {contact.hours && <p className="text-xs text-gray-600">🕐 {contact.hours}</p>}
                </div>
              )}
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}
