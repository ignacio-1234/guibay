import "./microsite.css";
import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import type { Metadata } from "next";

interface Props {
  params: Promise<{ slug: string }>;
}

export const dynamic = "force-dynamic";

/* ─────────────────────────────────────────────────────────────
   Utilidades de color (cálculo de contraste en el servidor)
   ───────────────────────────────────────────────────────────── */
type RGB = { r: number; g: number; b: number };

function parseColor(hex: string): RGB {
  let h = (hex || "").trim().replace("#", "");
  if (h.length === 3) h = h.split("").map((c) => c + c).join("");
  if (h.length !== 6 || /[^0-9a-fA-F]/.test(h)) return { r: 17, g: 17, b: 17 };
  return {
    r: parseInt(h.slice(0, 2), 16),
    g: parseInt(h.slice(2, 4), 16),
    b: parseInt(h.slice(4, 6), 16),
  };
}

function toHex({ r, g, b }: RGB): string {
  const c = (n: number) => Math.max(0, Math.min(255, Math.round(n))).toString(16).padStart(2, "0");
  return `#${c(r)}${c(g)}${c(b)}`;
}

function mix(a: RGB, b: RGB, t: number): RGB {
  return { r: a.r + (b.r - a.r) * t, g: a.g + (b.g - a.g) * t, b: a.b + (b.b - a.b) * t };
}

function relLuminance({ r, g, b }: RGB): number {
  const f = (v: number) => {
    const s = v / 255;
    return s <= 0.03928 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4;
  };
  return 0.2126 * f(r) + 0.7152 * f(g) + 0.0722 * f(b);
}

function contrast(a: RGB, b: RGB): number {
  const l1 = relLuminance(a);
  const l2 = relLuminance(b);
  return (Math.max(l1, l2) + 0.05) / (Math.min(l1, l2) + 0.05);
}

const WHITE: RGB = { r: 255, g: 255, b: 255 };
const INK: RGB = { r: 11, g: 11, b: 18 };

function readableOn(c: RGB): string {
  return contrast(WHITE, c) >= contrast(INK, c) ? toHex(WHITE) : toHex(INK);
}

function chroma({ r, g, b }: RGB): number {
  const mx = Math.max(r, g, b) / 255;
  const mn = Math.min(r, g, b) / 255;
  return mx - mn;
}

type Tone = "light" | "dark" | "color";

function buildTheme(colors: { background: string; primary: string; accent: string; text: string }) {
  const bg = parseColor(colors.background);
  const primary = parseColor(colors.primary);
  const accent = parseColor(colors.accent);
  const declared = parseColor(colors.text);

  const L = relLuminance(bg);
  const tone: Tone = L < 0.16 ? "dark" : L < 0.6 && chroma(bg) > 0.18 ? "color" : "light";

  // Texto de títulos (display): basta 3:1 sobre el fondo → conserva la marca.
  const text = contrast(declared, bg) >= 3 ? declared : parseColor(readableOn(bg));
  // Texto de cuerpo: exige 4.5:1 (legibilidad real).
  const body = contrast(declared, bg) >= 4.5 ? declared : parseColor(readableOn(bg));

  let surface: RGB, surface2: RGB, border: RGB, onSurface: RGB;
  const muted = mix(body, bg, tone === "dark" ? 0.38 : 0.3);

  if (tone === "dark") {
    surface = mix(bg, WHITE, 0.07);
    surface2 = mix(bg, WHITE, 0.12);
    border = mix(bg, WHITE, 0.15);
    onSurface = body;
  } else if (tone === "color") {
    surface = mix(bg, WHITE, 0.9);
    surface2 = mix(bg, WHITE, 0.8);
    border = mix(bg, WHITE, 0.68);
    onSurface = parseColor(readableOn(surface));
  } else {
    surface = mix(bg, primary, 0.06);
    surface2 = mix(bg, primary, 0.1);
    border = mix(bg, primary, 0.17);
    onSurface = parseColor(readableOn(surface));
  }

  // CTA principal: en fondos saturados resalta más el acento.
  const cta = tone === "color" ? accent : primary;

  return {
    tone,
    vars: {
      "--gb-bg": toHex(bg),
      "--gb-text": toHex(text),
      "--gb-body": toHex(body),
      "--gb-primary": toHex(primary),
      "--gb-accent": toHex(accent),
      "--gb-on-primary": readableOn(primary),
      "--gb-on-accent": readableOn(accent),
      "--gb-surface": toHex(surface),
      "--gb-surface-2": toHex(surface2),
      "--gb-border": toHex(border),
      "--gb-on-surface": toHex(onSurface),
      "--gb-muted": toHex(muted),
      "--gb-cta": toHex(cta),
      "--gb-on-cta": readableOn(cta),
    } as React.CSSProperties,
  };
}

/* ─────────────────────────────────────────────────────────────
   Iconos (line icons coherentes, currentColor)
   ───────────────────────────────────────────────────────────── */
function networkKey(name: string): string {
  const n = (name || "").toLowerCase();
  if (n.includes("insta")) return "instagram";
  if (n.includes("face")) return "facebook";
  if (n.includes("whats")) return "whatsapp";
  if (n.includes("tik")) return "tiktok";
  if (n.includes("you")) return "youtube";
  if (n.includes("linked")) return "linkedin";
  if (n.includes("tele")) return "telegram";
  if (n.includes("twit") || n === "x") return "x";
  if (n.includes("mail") || n.includes("correo") || n.includes("@")) return "email";
  if (n.includes("web") || n.includes("sitio") || n.includes("http")) return "web";
  return "link";
}

function Icon({ name }: { name: string }) {
  const p = { fill: "none", stroke: "currentColor", strokeWidth: 1.9, strokeLinecap: "round" as const, strokeLinejoin: "round" as const };
  const svg = (children: React.ReactNode) => (
    <svg viewBox="0 0 24 24" aria-hidden="true">{children}</svg>
  );
  switch (name) {
    case "instagram":
      return svg(<><rect x="2.5" y="2.5" width="19" height="19" rx="5.5" {...p} /><circle cx="12" cy="12" r="4.2" {...p} /><circle cx="17.4" cy="6.6" r="1.1" fill="currentColor" /></>);
    case "facebook":
      return svg(<path d="M15 3h-2.5A3.5 3.5 0 0 0 9 6.5V10H6v3.5h3V21h3.5v-7.5H15l.6-3.5h-3V6.7c0-.7.3-1.2 1.2-1.2H15z" {...p} />);
    case "whatsapp":
      return svg(<><path d="M20.5 11.6a8.5 8.5 0 0 1-12.3 7.6L3.5 20.5l1.4-4.6A8.5 8.5 0 1 1 20.5 11.6z" {...p} /><path d="M9 9c0 4 2.5 6 6 6 .6 0 1-.6 1-1.2 0-.3-1.6-1.2-1.9-1.1-.4.1-.7.9-1.1.8-1-.4-1.9-1.3-2.3-2.3-.1-.4.7-.7.8-1.1.1-.3-.8-1.9-1.1-1.9C9.6 8 9 8.4 9 9z" {...p} /></>);
    case "tiktok":
      return svg(<path d="M14 4c.3 2.6 2 4.2 4.5 4.4V11c-1.6 0-3.1-.5-4.5-1.4v5.6a5 5 0 1 1-5-5c.3 0 .7 0 1 .1v2.7a2.3 2.3 0 1 0 1.5 2.2V4z" {...p} />);
    case "youtube":
      return svg(<><rect x="2.5" y="5.5" width="19" height="13" rx="4" {...p} /><path d="M10.5 9.3l4.5 2.7-4.5 2.7z" {...p} /></>);
    case "linkedin":
      return svg(<><rect x="2.5" y="2.5" width="19" height="19" rx="3.5" {...p} /><path d="M7 10.5V17M7 7.2v.01M11 17v-3.4a2 2 0 0 1 4 0V17M11 17v-6.5" {...p} /></>);
    case "telegram":
      return svg(<path d="M21 4.5 2.8 11.3c-.7.3-.6 1.2.1 1.4l4.4 1.3 1.7 5c.2.6 1 .7 1.4.2l2.4-2.6 4.3 3.2c.5.4 1.3.1 1.4-.5L21.9 5.4c.1-.7-.5-1.2-1-.9z" {...p} />);
    case "x":
      return svg(<path d="M4.5 4.5l15 15M19.5 4.5l-15 15" {...p} />);
    case "email":
      return svg(<><rect x="2.5" y="4.5" width="19" height="15" rx="2.5" {...p} /><path d="M3.5 7l8.5 6 8.5-6" {...p} /></>);
    case "phone":
      return svg(<path d="M4.5 4.5h3.2l1.6 4-2.3 1.6a11 11 0 0 0 5.3 5.3l1.6-2.3 4 1.6v3.2a1.6 1.6 0 0 1-1.7 1.6A14.5 14.5 0 0 1 3 6.2a1.6 1.6 0 0 1 1.5-1.7z" {...p} />);
    case "pin":
      return svg(<><path d="M19 10c0 5-7 11-7 11s-7-6-7-11a7 7 0 0 1 14 0z" {...p} /><circle cx="12" cy="10" r="2.4" {...p} /></>);
    case "clock":
      return svg(<><circle cx="12" cy="12" r="9" {...p} /><path d="M12 7.5V12l3 2" {...p} /></>);
    case "web":
      return svg(<><circle cx="12" cy="12" r="9" {...p} /><path d="M3 12h18M12 3c2.7 2.7 2.7 15.3 0 18M12 3c-2.7 2.7-2.7 15.3 0 18" {...p} /></>);
    default:
      return svg(<><path d="M10 13a5 5 0 0 0 7 0l2.5-2.5a5 5 0 0 0-7-7L11 5" {...p} /><path d="M14 11a5 5 0 0 0-7 0L4.5 13.5a5 5 0 0 0 7 7L13 19" {...p} /></>);
  }
}

/* ─────────────────────────────────────────────────────────────
   Datos
   ───────────────────────────────────────────────────────────── */
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const microsite = await getMicrosite(slug);
  if (!microsite) return { title: "Sitio no encontrado" };
  const profileData = microsite.sections.find((s) => s.type === "PROFILE")?.data as {
    bio?: string;
    name?: string;
  } | null;
  return {
    title: microsite.title,
    description: profileData?.bio ?? `Visita el sitio de ${microsite.title}`,
    openGraph: {
      title: microsite.title,
      description: profileData?.bio ?? `Visita el sitio de ${microsite.title}`,
    },
  };
}

async function getMicrosite(slug: string) {
  return db.microsite.findFirst({
    where: { slug, published: true },
    include: {
      template: true,
      sections: { orderBy: { order: "asc" }, where: { visible: true } },
      addons: { where: { enabled: true } },
      user: {
        select: {
          name: true,
          image: true,
          subscription: { include: { plan: true } },
        },
      },
    },
  });
}

type Family =
  | "classic" | "mindfull" | "vibrant" | "nature" | "brutal" | "minimal"
  // Estilos nuevos (Fase 3)
  | "glass" | "clay" | "spatial" | "maximal";

type TemplateConfig = {
  colors: { background: string; primary: string; accent: string; text: string };
  fonts: { heading: string; body: string };
  layout: "centered" | "full-width" | "card" | "brutal" | "minimal";
  style?: Family;
};

const DEFAULT_CONFIG: TemplateConfig = {
  colors: { background: "#FAFAFA", primary: "#111827", accent: "#3B82F6", text: "#374151" },
  fonts: { heading: "Inter", body: "Inter" },
  layout: "centered",
};

const KNOWN_STYLES: Family[] = ["glass", "clay", "spatial", "maximal", "minimal", "brutal"];

function pickFamily(config: TemplateConfig, templateSlug: string): Family {
  // Preferimos el estilo explícito del template (nuevos estilos).
  if (config.style && KNOWN_STYLES.includes(config.style)) return config.style;
  if (templateSlug === "mindfull") return "mindfull";
  switch (config.layout) {
    case "full-width": return "vibrant";
    case "card": return "nature";
    case "brutal": return "brutal";
    case "minimal": return "minimal";
    default: return "classic";
  }
}

/* ─────────────────────────────────────────────────────────────
   Página
   ───────────────────────────────────────────────────────────── */
export default async function MicrositePage({ params }: Props) {
  const { slug } = await params;
  const microsite = await getMicrosite(slug);
  if (!microsite) notFound();

  db.analytics
    .create({ data: { micrositeId: microsite.id, eventType: "PAGE_VIEW" } })
    .catch(() => {});

  const config: TemplateConfig = {
    ...DEFAULT_CONFIG,
    ...((microsite.template?.config as Partial<TemplateConfig>) ?? {}),
    colors: {
      ...DEFAULT_CONFIG.colors,
      ...((microsite.template?.config as Partial<TemplateConfig>)?.colors ?? {}),
    },
  };

  const profile = microsite.sections.find((s) => s.type === "PROFILE")?.data as {
    name?: string; bio?: string; avatarUrl?: string; heroUrl?: string;
  } | null;
  const socials = (microsite.sections.find((s) => s.type === "SOCIAL")?.data as {
    networks?: { id: string; network: string; url: string; label?: string }[];
  } | null)?.networks?.filter((s) => s.url) ?? [];
  const links = (microsite.sections.find((s) => s.type === "LINKS")?.data as {
    buttons?: { id: string; label: string; url: string; color?: string }[];
  } | null)?.buttons?.filter((b) => b.label && b.url) ?? [];
  const services = microsite.sections.find((s) => s.type === "SERVICES")?.data as {
    heading?: string; items?: { id: string; title: string; description?: string; icon?: string }[];
  } | null;
  const contact = microsite.sections.find((s) => s.type === "CONTACT")?.data as {
    phone?: string; whatsapp?: string; email?: string; address?: string; hours?: string;
  } | null;

  const family = pickFamily(config, microsite.template?.slug ?? "clasico");
  const { vars } = buildTheme(config.colors);

  // El pie "hecho con Guibay" se muestra solo en el plan Free del dueño.
  const ownerPlan = microsite.user?.subscription?.plan?.name;
  const ownerIsPro =
    ownerPlan === "PRO" &&
    (microsite.user?.subscription?.status === "ACTIVE" ||
      microsite.user?.subscription?.status === "TRIALING");
  const showBranding = !ownerIsPro;

  const brand = (profile?.name || microsite.title || "Mi sitio").trim();
  const initial = brand[0]?.toUpperCase() ?? "•";
  const hasServices = !!services?.items?.length;
  const contactItems = contact ? buildContactItems(contact) : [];
  const hasContact = contactItems.length > 0;

  const heroHasImg = !!profile?.heroUrl;
  const heroStyle: React.CSSProperties | undefined = heroHasImg
    ? {
        backgroundImage: `linear-gradient(180deg, rgba(0,0,0,0.32), rgba(0,0,0,0.62)), url(${profile!.heroUrl})`,
      }
    : undefined;

  const Avatar = ({ className }: { className: string }) =>
    profile?.avatarUrl ? (
      // eslint-disable-next-line @next/next/no-img-element
      <img src={profile.avatarUrl} alt={brand} className={className} />
    ) : (
      <div className={`${className} gb-fallback`}>{initial}</div>
    );

  const Socials = ({ inBar = false }: { inBar?: boolean }) =>
    socials.length === 0 ? null : (
      <nav className="gb-socials" aria-label={inBar ? "Redes en cabecera" : "Redes sociales"}>
        {socials.map((sn) => (
          <a key={sn.id} className="gb-social" href={sn.url} target="_blank" rel="noopener noreferrer" title={sn.label ?? sn.network} aria-label={sn.label ?? sn.network}>
            <Icon name={networkKey(sn.network)} />
          </a>
        ))}
      </nav>
    );

  return (
    <div className={`gb-root gb-tpl-${family}`} style={vars}>
      {/* Barra superior */}
      <header className="gb-bar">
        <a className="gb-brand" href="#top">
          <span className="gb-brand-mark">
            {profile?.avatarUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={profile.avatarUrl} alt="" />
            ) : (
              initial
            )}
          </span>
          {brand}
        </a>
        <div className="gb-nav">
          {links.length > 0 && <a className="gb-navlink" href="#enlaces">Enlaces</a>}
          {hasServices && <a className="gb-navlink" href="#servicios">Servicios</a>}
          {hasContact && <a className="gb-navlink" href="#contacto">Contacto</a>}
          {socials.length > 0 && <Socials inBar />}
        </div>
      </header>

      <span id="top" />

      {/* Hero */}
      <section className={`gb-hero${heroHasImg ? " gb-hero--img" : ""}`} style={heroStyle}>
        <div className="gb-hero-inner">
          <Avatar className="gb-hero-av" />
          <h1 className="gb-name">{brand}</h1>
          {profile?.bio && <p className="gb-bio">{profile.bio}</p>}
          {family === "minimal" && <Socials />}
        </div>
      </section>

      <main className="gb-main">
        {/* Enlaces */}
        {links.length > 0 && (
          <section id="enlaces" className="gb-section">
            <div className="gb-wrap">
              {family !== "minimal" && socials.length > 0 && (
                <div style={{ display: "flex", justifyContent: family === "vibrant" || family === "classic" || family === "mindfull" || family === "nature" ? "center" : "flex-start", marginBottom: 24 }}>
                  <Socials />
                </div>
              )}
              <div className="gb-links">
                {links.map((btn, i) => (
                  <a
                    key={btn.id}
                    className={`gb-link${i === 0 ? " gb-link--primary" : ""}`}
                    href={btn.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={btn.color && i !== 0 ? { background: btn.color, color: readableOn(parseColor(btn.color)), borderColor: "transparent" } : undefined}
                  >
                    <span>{btn.label}</span>
                    <span className="gb-link-arrow" aria-hidden="true">↗</span>
                  </a>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* Si no hay enlaces pero sí redes, mostramos redes solas */}
        {links.length === 0 && socials.length > 0 && family !== "minimal" && (
          <section className="gb-section">
            <div className="gb-wrap" style={{ display: "flex", justifyContent: "center" }}>
              <Socials />
            </div>
          </section>
        )}

        {/* Servicios */}
        {hasServices && (
          <section id="servicios" className="gb-section">
            <div className="gb-wrap">
              <h2 className="gb-h2">{services!.heading ?? "Servicios"}</h2>
              <div className="gb-services">
                {services!.items!.map((item) => (
                  <article key={item.id} className="gb-card">
                    <span className="gb-card-ic">{item.icon ?? "✦"}</span>
                    <h3>{item.title}</h3>
                    {item.description && <p>{item.description}</p>}
                  </article>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* Contacto */}
        {hasContact && (
          <section id="contacto" className="gb-section">
            <div className="gb-wrap">
              <h2 className="gb-h2">Contacto</h2>
              <div className="gb-contact">
                {contactItems.map((item) => {
                  const inner = (
                    <>
                      <span className="gb-cinfo-ic"><Icon name={item.icon} /></span>
                      <span>
                        <span className="gb-clabel">{item.label}</span>
                        <span className="gb-cval">{item.value}</span>
                      </span>
                    </>
                  );
                  return item.href ? (
                    <a key={item.label} className="gb-cinfo" href={item.href} target="_blank" rel="noopener noreferrer">{inner}</a>
                  ) : (
                    <div key={item.label} className="gb-cinfo">{inner}</div>
                  );
                })}
              </div>
            </div>
          </section>
        )}
      </main>

      <footer className="gb-footer">
        <a className="gb-brand" href="#top">
          <span className="gb-brand-mark">{initial}</span>
          {brand}
        </a>
        {showBranding && (
          <div>
            <a className="gb-powered" href="https://guibay.com" target="_blank" rel="noopener noreferrer">
              hecho con <strong>Guibay</strong>
            </a>
          </div>
        )}
      </footer>
    </div>
  );
}

type ContactItem = { icon: string; label: string; value: string; href: string | null };

function buildContactItems(c: {
  phone?: string; whatsapp?: string; email?: string; address?: string; hours?: string;
}): ContactItem[] {
  return [
    c.whatsapp && { icon: "whatsapp", label: "WhatsApp", value: c.whatsapp, href: `https://wa.me/${c.whatsapp.replace(/\D/g, "")}` },
    c.phone && { icon: "phone", label: "Teléfono", value: c.phone, href: `tel:${c.phone.replace(/\s/g, "")}` },
    c.email && { icon: "email", label: "Email", value: c.email, href: `mailto:${c.email}` },
    c.address && { icon: "pin", label: "Dirección", value: c.address, href: null },
    c.hours && { icon: "clock", label: "Horario", value: c.hours, href: null },
  ].filter(Boolean) as ContactItem[];
}
