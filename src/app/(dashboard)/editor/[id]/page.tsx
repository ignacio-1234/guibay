import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { MicrositeEditor } from "./microsite-editor";

interface Props {
  params: Promise<{ id: string }>;
}

export const metadata: Metadata = {
  title: "Editor",
};

export default async function EditorPage({ params }: Props) {
  const { id } = await params;
  const session = await auth();

  if (!session?.user?.id) {
    notFound();
  }

  const [microsite, styleTemplates] = await Promise.all([
    db.microsite.findFirst({
      where: { id, userId: session.user.id },
      include: {
        template: true,
        sections: { orderBy: { order: "asc" } },
      },
    }),
    db.template.findMany({
      where: { isActive: true },
      orderBy: { name: "asc" },
      select: { id: true, name: true, slug: true, config: true },
    }),
  ]);

  if (!microsite) {
    notFound();
  }

  const styles = styleTemplates.map((t) => {
    const cfg = (t.config ?? {}) as { colors?: Record<string, string>; style?: string };
    return {
      id: t.id,
      name: t.name,
      slug: t.slug,
      style: cfg.style ?? t.slug,
      colors: {
        background: cfg.colors?.background ?? "#FAFAFA",
        primary: cfg.colors?.primary ?? "#111827",
        accent: cfg.colors?.accent ?? "#3B82F6",
      },
    };
  });

  return (
    <MicrositeEditor
      initialMicrosite={{
        id: microsite.id,
        title: microsite.title,
        slug: microsite.slug,
        published: microsite.published,
        templateName: microsite.template.name,
        templateId: microsite.templateId,
        sections: microsite.sections.map((section) => ({
          id: section.id,
          type: section.type,
          data: section.data,
        })),
      }}
      styles={styles}
    />
  );
}
