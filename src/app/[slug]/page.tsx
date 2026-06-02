import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import type { Metadata } from "next";

interface Props {
  params: Promise<{ slug: string }>;
}

export const dynamic = "force-dynamic";

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
      user: { select: { name: true, image: true } },
    },
  });
}

type TemplateConfig = {
  colors: { background: string; primary: string; accent: string; text: string };
  fonts: { heading: string; body: string };
  layout: "centered" | "full-width" | "card";
};

const DEFAULT_CONFIG: TemplateConfig = {
  colors: { background: "#FAFAFA", primary: "#111827", accent: "#3B82F6", text: "#374151" },
  fonts: { heading: "Inter", body: "Inter" },
  layout: "centered",
};

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
  const socials = microsite.sections.find((s) => s.type === "SOCIAL")?.data as {
    networks?: { id: string; network: string; url: string; label?: string }[];
  } | null;
  const links = microsite.sections.find((s) => s.type === "LINKS")?.data as {
    buttons?: { id: string; label: string; url: string; color?: string }[];
  } | null;
  const servicesData = microsite.sections.find((s) => s.type === "SERVICES")?.data as {
    heading?: string; items?: { id: string; title: string; description?: string; icon?: string }[];
  } | null;
  const contactData = microsite.sections.find((s) => s.type === "CONTACT")?.data as {
    phone?: string; whatsapp?: string; email?: string; address?: string; hours?: string;
  } | null;

  const { colors, layout } = config;
  const templateSlug = microsite.template?.slug ?? "clasico";

  return (
    <div
      style={{ minHeight: "100vh", background: colors.background, color: colors.text, fontFamily: "Inter, system-ui, sans-serif" }}
    >
      {/* ── CLÁSICO (centered, minimal) ─────────────────────── */}
      {layout === "centered" && templateSlug !== "mindfull" && (
        <div style={{ maxWidth: 420, margin: "0 auto", padding: "48px 24px 80px" }}>
          {profile?.heroUrl && (
            <div
              style={{
                height: 160,
                borderRadius: 20,
                backgroundImage: `url(${profile.heroUrl})`,
                backgroundSize: "cover",
                backgroundPosition: "center",
                marginBottom: 24,
              }}
            />
          )}
          <div style={{ textAlign: "center", marginBottom: 28 }}>
            {profile?.avatarUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={profile.avatarUrl}
                alt={profile.name ?? microsite.title}
                style={{
                  width: 88, height: 88, borderRadius: "50%",
                  margin: "0 auto 16px",
                  objectFit: "cover",
                  border: `4px solid ${colors.primary}`,
                  boxShadow: "0 4px 16px rgba(0,0,0,0.12)",
                }}
              />
            ) : (
              <div style={{
                width: 88, height: 88, borderRadius: "50%",
                background: `linear-gradient(135deg, ${colors.primary}, ${colors.accent})`,
                margin: "0 auto 16px",
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: 32, fontWeight: 700, color: "#fff",
              }}>
                {(profile?.name ?? microsite.title)[0].toUpperCase()}
              </div>
            )}
            <h1 style={{ fontSize: 22, fontWeight: 700, color: colors.primary, margin: "0 0 8px" }}>
              {profile?.name ?? microsite.title}
            </h1>
            {profile?.bio && (
              <p style={{ fontSize: 14, color: colors.text, opacity: 0.7, lineHeight: 1.6, margin: 0 }}>
                {profile.bio}
              </p>
            )}
          </div>

          {/* Social icons */}
          {socials?.networks && socials.networks.length > 0 && (
            <div style={{ display: "flex", justifyContent: "center", gap: 12, marginBottom: 24, flexWrap: "wrap" }}>
              {socials.networks.map((sn) => (
                <a key={sn.id} href={sn.url} target="_blank" rel="noopener noreferrer"
                  style={{
                    width: 44, height: 44, borderRadius: "50%",
                    background: `${colors.primary}15`,
                    display: "flex", alignItems: "center", justifyContent: "center",
                    color: colors.primary, fontWeight: 700, fontSize: 13,
                    textDecoration: "none", border: `1.5px solid ${colors.primary}30`,
                    transition: "transform 0.15s",
                  }}
                  title={sn.network}
                >
                  {sn.network[0].toUpperCase()}
                </a>
              ))}
            </div>
          )}

          {/* Link buttons */}
          {links?.buttons && links.buttons.length > 0 && (
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              {links.buttons.map((btn, i) => (
                <a key={btn.id} href={btn.url} target="_blank" rel="noopener noreferrer"
                  style={{
                    display: "block", textAlign: "center",
                    padding: "14px 20px", borderRadius: 14,
                    background: btn.color ?? (i % 2 === 0 ? colors.primary : colors.accent),
                    color: "#fff", fontWeight: 600, fontSize: 14,
                    textDecoration: "none",
                    boxShadow: `0 4px 12px ${btn.color ?? colors.primary}40`,
                    transition: "transform 0.15s, opacity 0.15s",
                  }}
                >
                  {btn.label}
                </a>
              ))}
            </div>
          )}

          <ServicesBlock data={servicesData} colors={colors} />
          <ContactBlock data={contactData} colors={colors} />
          <PoweredBy color={colors.text} />
        </div>
      )}

      {/* ── MINDFULL (professional, dark accent, elegant) ────── */}
      {templateSlug === "mindfull" && (
        <div style={{ maxWidth: 420, margin: "0 auto", padding: "0 0 80px" }}>
          {/* Top banner */}
          <div style={{
            background: `linear-gradient(160deg, ${colors.primary} 0%, ${colors.accent} 100%)`,
            padding: "52px 24px 80px",
            textAlign: "center",
          }}>
            {profile?.avatarUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={profile.avatarUrl} alt={profile.name ?? microsite.title}
                style={{ width: 96, height: 96, borderRadius: "50%", objectFit: "cover", border: "4px solid rgba(255,255,255,0.9)", margin: "0 auto 16px", display: "block" }}
              />
            ) : (
              <div style={{ width: 96, height: 96, borderRadius: "50%", background: "rgba(255,255,255,0.2)", margin: "0 auto 16px", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 36, fontWeight: 700, color: "#fff" }}>
                {(profile?.name ?? microsite.title)[0].toUpperCase()}
              </div>
            )}
            <h1 style={{ fontSize: 22, fontWeight: 700, color: "#fff", margin: "0 0 8px" }}>
              {profile?.name ?? microsite.title}
            </h1>
            {profile?.bio && <p style={{ fontSize: 13, color: "rgba(255,255,255,0.8)", lineHeight: 1.6, margin: 0 }}>{profile.bio}</p>}
          </div>

          {/* Card overlay */}
          <div style={{ background: colors.background, borderRadius: "24px 24px 0 0", marginTop: -32, padding: "28px 24px 0" }}>
            {socials?.networks && socials.networks.length > 0 && (
              <div style={{ display: "flex", justifyContent: "center", gap: 12, marginBottom: 24, flexWrap: "wrap" }}>
                {socials.networks.map((sn) => (
                  <a key={sn.id} href={sn.url} target="_blank" rel="noopener noreferrer"
                    style={{ width: 46, height: 46, borderRadius: "50%", background: colors.primary, display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontWeight: 700, fontSize: 13, textDecoration: "none" }}
                    title={sn.network}
                  >
                    {sn.network[0].toUpperCase()}
                  </a>
                ))}
              </div>
            )}

            {links?.buttons && links.buttons.length > 0 && (
              <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                {links.buttons.map((btn, i) => (
                  <a key={btn.id} href={btn.url} target="_blank" rel="noopener noreferrer"
                    style={{
                      display: "block", textAlign: "center", padding: "15px 20px", borderRadius: 12,
                      background: i === 0 ? (btn.color ?? colors.accent) : "transparent",
                      border: `2px solid ${btn.color ?? colors.primary}`,
                      color: i === 0 ? "#fff" : colors.primary,
                      fontWeight: 600, fontSize: 14, textDecoration: "none",
                    }}
                  >
                    {btn.label}
                  </a>
                ))}
              </div>
            )}
            <ServicesBlock data={servicesData} colors={colors} />
            <ContactBlock data={contactData} colors={colors} />
            <PoweredBy color={colors.text} />
          </div>
        </div>
      )}

      {/* ── VIBRANTE / full-width (colorido, energético) ─────── */}
      {layout === "full-width" && templateSlug !== "mindfull" && (
        <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column", alignItems: "center" }}>
          {/* Diagonal header */}
          <div style={{
            width: "100%", background: colors.background,
            padding: "56px 24px 100px", textAlign: "center",
            clipPath: "polygon(0 0, 100% 0, 100% 80%, 0 100%)",
            marginBottom: -40,
          }}>
            {profile?.avatarUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={profile.avatarUrl} alt={profile.name ?? microsite.title}
                style={{ width: 100, height: 100, borderRadius: "50%", objectFit: "cover", border: `5px solid ${colors.primary}`, margin: "0 auto 16px", display: "block", boxShadow: "0 8px 24px rgba(0,0,0,0.2)" }}
              />
            ) : (
              <div style={{ width: 100, height: 100, borderRadius: "50%", background: colors.primary, margin: "0 auto 16px", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 38, fontWeight: 900, color: colors.background, border: `5px solid ${colors.accent}` }}>
                {(profile?.name ?? microsite.title)[0].toUpperCase()}
              </div>
            )}
            <h1 style={{ fontSize: 26, fontWeight: 900, color: colors.primary, margin: "0 0 8px", textTransform: "uppercase", letterSpacing: 1 }}>
              {profile?.name ?? microsite.title}
            </h1>
            {profile?.bio && <p style={{ fontSize: 14, color: colors.text, opacity: 0.85, lineHeight: 1.5 }}>{profile.bio}</p>}
          </div>

          <div style={{ width: "100%", maxWidth: 420, padding: "48px 24px 80px", zIndex: 1 }}>
            {socials?.networks && socials.networks.length > 0 && (
              <div style={{ display: "flex", justifyContent: "center", gap: 12, marginBottom: 28, flexWrap: "wrap" }}>
                {socials.networks.map((sn) => (
                  <a key={sn.id} href={sn.url} target="_blank" rel="noopener noreferrer"
                    style={{ width: 48, height: 48, borderRadius: 12, background: colors.primary, display: "flex", alignItems: "center", justifyContent: "center", color: colors.background, fontWeight: 700, fontSize: 14, textDecoration: "none", boxShadow: `0 4px 12px ${colors.primary}60` }}
                    title={sn.network}
                  >
                    {sn.network[0].toUpperCase()}
                  </a>
                ))}
              </div>
            )}

            {links?.buttons && links.buttons.length > 0 && (
              <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                {links.buttons.map((btn, i) => (
                  <a key={btn.id} href={btn.url} target="_blank" rel="noopener noreferrer"
                    style={{
                      display: "block", textAlign: "center", padding: "16px 20px",
                      borderRadius: 16,
                      background: btn.color ?? (i % 2 === 0 ? colors.primary : colors.accent),
                      color: "#fff", fontWeight: 800, fontSize: 15,
                      textDecoration: "none", textTransform: "uppercase", letterSpacing: 0.5,
                      boxShadow: `0 6px 20px ${btn.color ?? colors.primary}50`,
                    }}
                  >
                    {btn.label}
                  </a>
                ))}
              </div>
            )}
            <ServicesBlock data={servicesData} colors={colors} />
            <ContactBlock data={contactData} colors={colors} />
            <PoweredBy color={colors.primary} />
          </div>
        </div>
      )}

      {/* ── NATURALEZA / card layout ─────────────────────────── */}
      {layout === "card" && (
        <div style={{ minHeight: "100vh", background: colors.background, display: "flex", alignItems: "flex-start", justifyContent: "center", padding: "40px 16px 80px" }}>
          <div style={{ width: "100%", maxWidth: 400, background: "#fff", borderRadius: 28, overflow: "hidden", boxShadow: "0 12px 48px rgba(0,0,0,0.12)" }}>
            {/* Card header */}
            <div style={{
              background: `linear-gradient(135deg, ${colors.primary}, ${colors.accent})`,
              padding: "40px 24px 52px", textAlign: "center",
            }}>
              {profile?.avatarUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={profile.avatarUrl} alt={profile.name ?? microsite.title}
                  style={{ width: 90, height: 90, borderRadius: "50%", objectFit: "cover", border: "4px solid rgba(255,255,255,0.9)", margin: "0 auto 14px", display: "block" }}
                />
              ) : (
                <div style={{ width: 90, height: 90, borderRadius: "50%", background: "rgba(255,255,255,0.25)", margin: "0 auto 14px", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 34, fontWeight: 700, color: "#fff" }}>
                  {(profile?.name ?? microsite.title)[0].toUpperCase()}
                </div>
              )}
              <h1 style={{ fontSize: 20, fontWeight: 700, color: "#fff", margin: "0 0 6px" }}>
                {profile?.name ?? microsite.title}
              </h1>
              {profile?.bio && <p style={{ fontSize: 13, color: "rgba(255,255,255,0.85)", lineHeight: 1.6, margin: 0 }}>{profile.bio}</p>}
            </div>

            {/* Card body */}
            <div style={{ padding: "24px 20px 28px", marginTop: -16, background: "#fff", borderRadius: "20px 20px 0 0", position: "relative" }}>
              {socials?.networks && socials.networks.length > 0 && (
                <div style={{ display: "flex", justifyContent: "center", gap: 10, marginBottom: 20, flexWrap: "wrap" }}>
                  {socials.networks.map((sn) => (
                    <a key={sn.id} href={sn.url} target="_blank" rel="noopener noreferrer"
                      style={{ width: 42, height: 42, borderRadius: "50%", background: `${colors.primary}18`, display: "flex", alignItems: "center", justifyContent: "center", color: colors.primary, fontWeight: 700, fontSize: 13, textDecoration: "none", border: `1.5px solid ${colors.primary}35` }}
                      title={sn.network}
                    >
                      {sn.network[0].toUpperCase()}
                    </a>
                  ))}
                </div>
              )}

              {links?.buttons && links.buttons.length > 0 && (
                <div style={{ display: "flex", flexDirection: "column", gap: 11 }}>
                  {links.buttons.map((btn, i) => (
                    <a key={btn.id} href={btn.url} target="_blank" rel="noopener noreferrer"
                      style={{
                        display: "block", textAlign: "center", padding: "13px 18px", borderRadius: 12,
                        background: btn.color ?? (i % 2 === 0 ? colors.primary : colors.accent),
                        color: "#fff", fontWeight: 600, fontSize: 14,
                        textDecoration: "none", boxShadow: `0 3px 10px ${btn.color ?? colors.primary}35`,
                      }}
                    >
                      {btn.label}
                    </a>
                  ))}
                </div>
              )}
              <ServicesBlock data={servicesData} colors={colors} />
              <ContactBlock data={contactData} colors={colors} />
              <PoweredBy color={colors.text} />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

type Colors = { background: string; primary: string; accent: string; text: string };

function ServicesBlock({ data, colors }: { data: { heading?: string; items?: { id: string; title: string; description?: string; icon?: string }[] } | null; colors: Colors }) {
  if (!data?.items || data.items.length === 0) return null;
  return (
    <div style={{ marginTop: 32, paddingTop: 24, borderTop: `1px solid ${colors.primary}18` }}>
      <h2 style={{ fontSize: 14, fontWeight: 700, textTransform: "uppercase", letterSpacing: 1, color: colors.primary, opacity: 0.6, margin: "0 0 16px", textAlign: "center" }}>
        {data.heading ?? "Servicios"}
      </h2>
      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        {data.items.map((item) => (
          <div key={item.id} style={{ display: "flex", alignItems: "flex-start", gap: 12, background: `${colors.primary}08`, borderRadius: 14, padding: "12px 14px" }}>
            <span style={{ fontSize: 22, lineHeight: 1, flexShrink: 0 }}>{item.icon ?? "⭐"}</span>
            <div>
              <p style={{ margin: 0, fontWeight: 600, fontSize: 14, color: colors.primary }}>{item.title}</p>
              {item.description && <p style={{ margin: "3px 0 0", fontSize: 12, color: colors.text, opacity: 0.7, lineHeight: 1.5 }}>{item.description}</p>}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function ContactBlock({ data, colors }: { data: { phone?: string; whatsapp?: string; email?: string; address?: string; hours?: string } | null; colors: Colors }) {
  if (!data) return null;
  const items = [
    data.whatsapp && { icon: "💬", label: "WhatsApp", value: data.whatsapp, href: `https://wa.me/${data.whatsapp.replace(/\D/g, "")}` },
    data.phone && { icon: "📞", label: "Teléfono", value: data.phone, href: `tel:${data.phone.replace(/\s/g, "")}` },
    data.email && { icon: "✉️", label: "Email", value: data.email, href: `mailto:${data.email}` },
    data.address && { icon: "📍", label: "Dirección", value: data.address, href: null },
    data.hours && { icon: "🕐", label: "Horario", value: data.hours, href: null },
  ].filter(Boolean) as { icon: string; label: string; value: string; href: string | null }[];

  if (items.length === 0) return null;
  return (
    <div style={{ marginTop: 24, paddingTop: 24, borderTop: `1px solid ${colors.primary}18` }}>
      <h2 style={{ fontSize: 14, fontWeight: 700, textTransform: "uppercase", letterSpacing: 1, color: colors.primary, opacity: 0.6, margin: "0 0 16px", textAlign: "center" }}>
        Contacto
      </h2>
      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        {items.map((item) => {
          const inner = (
            <div style={{ display: "flex", alignItems: "center", gap: 10, background: `${colors.primary}08`, borderRadius: 12, padding: "10px 14px" }}>
              <span style={{ fontSize: 18 }}>{item.icon}</span>
              <div>
                <p style={{ margin: 0, fontSize: 11, color: colors.text, opacity: 0.5, fontWeight: 500 }}>{item.label}</p>
                <p style={{ margin: 0, fontSize: 13, color: colors.primary, fontWeight: 600 }}>{item.value}</p>
              </div>
            </div>
          );
          return item.href
            ? <a key={item.label} href={item.href} target="_blank" rel="noopener noreferrer" style={{ textDecoration: "none" }}>{inner}</a>
            : <div key={item.label}>{inner}</div>;
        })}
      </div>
    </div>
  );
}

function PoweredBy({ color }: { color: string }) {
  return (
    <div style={{ textAlign: "center", marginTop: 40 }}>
      <a href="https://guibay.com" style={{ fontSize: 11, color, opacity: 0.4, textDecoration: "none" }}>
        powered by <strong>Guibay</strong>
      </a>
    </div>
  );
}
