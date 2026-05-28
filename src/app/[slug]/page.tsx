import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import type { Metadata } from "next";

interface Props {
  params: { slug: string };
}

// ISR: revalidar cada 60 segundos
export const revalidate = 60;

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const microsite = await getMicrosite(params.slug);

  if (!microsite) {
    return { title: "Sitio no encontrado" };
  }

  const profileSection = microsite.sections.find((s) => s.type === "PROFILE");
  const profileData = profileSection?.data as { bio?: string; name?: string } | null;

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
  return db.microsite.findUnique({
    where: { slug, published: true },
    include: {
      template: true,
      sections: { orderBy: { order: "asc" }, where: { visible: true } },
      addons: { where: { enabled: true } },
      user: { select: { name: true, image: true } },
    },
  });
}

export default async function MicrositePage({ params }: Props) {
  const microsite = await getMicrosite(params.slug);

  if (!microsite) notFound();

  // Registrar visita (fire and forget)
  db.analytics
    .create({
      data: {
        micrositeId: microsite.id,
        eventType: "PAGE_VIEW",
      },
    })
    .catch(() => {});

  const profileSection = microsite.sections.find((s) => s.type === "PROFILE");
  const socialSection = microsite.sections.find((s) => s.type === "SOCIAL");
  const linksSection = microsite.sections.find((s) => s.type === "LINKS");

  const profile = profileSection?.data as {
    name?: string;
    bio?: string;
    avatarUrl?: string;
    heroUrl?: string;
  } | null;

  const socials = socialSection?.data as {
    networks?: { id: string; network: string; url: string }[];
  } | null;

  const links = linksSection?.data as {
    buttons?: { id: string; label: string; url: string; color?: string }[];
  } | null;

  return (
    <div className="min-h-screen bg-gray-50 flex justify-center">
      <div className="w-full max-w-sm">
        {/* Hero / Header */}
        {profile?.heroUrl && (
          <div
            className="h-40 w-full bg-cover bg-center"
            style={{ backgroundImage: `url(${profile.heroUrl})` }}
          />
        )}

        {/* Perfil */}
        <div className="px-6 pt-6 pb-4 text-center">
          {profile?.avatarUrl && (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={profile.avatarUrl}
              alt={profile.name ?? microsite.title}
              className="w-20 h-20 rounded-full mx-auto mb-4 object-cover border-4 border-white shadow-md"
            />
          )}
          <h1 className="text-xl font-bold text-gray-900">{profile?.name ?? microsite.title}</h1>
          {profile?.bio && (
            <p className="text-sm text-gray-500 mt-2 text-balance">{profile.bio}</p>
          )}
        </div>

        {/* Redes sociales */}
        {socials?.networks && socials.networks.length > 0 && (
          <div className="flex justify-center gap-3 px-6 pb-4">
            {socials.networks.map((sn) => (
              <a
                key={sn.id}
                href={sn.url}
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center text-gray-600 transition-colors"
                aria-label={sn.network}
              >
                <span className="text-sm font-bold">{sn.network[0].toUpperCase()}</span>
              </a>
            ))}
          </div>
        )}

        {/* Links / Botones */}
        {links?.buttons && links.buttons.length > 0 && (
          <div className="px-6 pb-4 space-y-3">
            {links.buttons.map((btn) => (
              <a
                key={btn.id}
                href={btn.url}
                target="_blank"
                rel="noopener noreferrer"
                className="block w-full text-center py-3 px-4 rounded-xl font-medium text-white transition-all hover:opacity-90 hover:scale-[1.02]"
                style={{ backgroundColor: btn.color ?? "#2D1B69" }}
              >
                {btn.label}
              </a>
            ))}
          </div>
        )}

        {/* Footer Guibay */}
        <div className="py-8 text-center">
          <a
            href="https://guibay.com"
            className="text-xs text-gray-400 hover:text-gray-600 transition-colors"
          >
            powered by{" "}
            <span className="font-semibold text-primary">Guibay</span>
          </a>
        </div>
      </div>
    </div>
  );
}
