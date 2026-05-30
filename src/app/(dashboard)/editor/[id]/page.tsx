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

  const microsite = await db.microsite.findFirst({
    where: { id, userId: session.user.id },
    include: {
      template: true,
      sections: { orderBy: { order: "asc" } },
    },
  });

  if (!microsite) {
    notFound();
  }

  return (
    <MicrositeEditor
      initialMicrosite={{
        id: microsite.id,
        title: microsite.title,
        slug: microsite.slug,
        published: microsite.published,
        templateName: microsite.template.name,
        sections: microsite.sections.map((section) => ({
          id: section.id,
          type: section.type,
          data: section.data,
        })),
      }}
    />
  );
}
