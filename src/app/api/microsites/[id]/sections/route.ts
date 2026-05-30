import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { updateMicrositeSectionsSchema } from "@/lib/validations/microsite";

interface Params {
  params: Promise<{ id: string }>;
}

function cleanUrl(value: string | null | undefined) {
  return value && value.trim().length > 0 ? value.trim() : null;
}

// PATCH /api/microsites/:id/sections
export async function PATCH(req: Request, { params }: Params) {
  try {
    const { id } = await params;
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const microsite = await db.microsite.findFirst({
      where: { id, userId: session.user.id },
      select: { id: true },
    });

    if (!microsite) {
      return NextResponse.json({ error: "No encontrado" }, { status: 404 });
    }

    const body = await req.json();
    const validated = updateMicrositeSectionsSchema.safeParse(body);

    if (!validated.success) {
      return NextResponse.json(
        { error: "Datos invalidos", details: validated.error.flatten() },
        { status: 400 }
      );
    }

    const { profile, social, links } = validated.data;
    const sections = [
      {
        type: "PROFILE" as const,
        order: 0,
        data: {
          name: profile.name,
          bio: profile.bio ?? "",
          avatarUrl: cleanUrl(profile.avatarUrl),
          heroUrl: cleanUrl(profile.heroUrl),
        },
      },
      {
        type: "SOCIAL" as const,
        order: 1,
        data: {
          networks: social.networks.map((network) => ({
            ...network,
            label: network.label?.trim() || network.network,
          })),
        },
      },
      {
        type: "LINKS" as const,
        order: 2,
        data: {
          buttons: links.buttons.map((button) => ({
            ...button,
            color: button.color ?? "#2D1B69",
          })),
        },
      },
    ];

    const existingSections = await db.section.findMany({
      where: { micrositeId: microsite.id, type: { in: ["PROFILE", "SOCIAL", "LINKS"] } },
    });

    await db.$transaction(
      sections.map((section) => {
        const existing = existingSections.find((item) => item.type === section.type);

        if (existing) {
          return db.section.update({
            where: { id: existing.id },
            data: {
              order: section.order,
              data: section.data,
              visible: true,
            },
          });
        }

        return db.section.create({
          data: {
            micrositeId: microsite.id,
            type: section.type,
            order: section.order,
            data: section.data,
            visible: true,
          },
        });
      })
    );

    const updated = await db.section.findMany({
      where: { micrositeId: microsite.id },
      orderBy: { order: "asc" },
    });

    return NextResponse.json({ data: updated });
  } catch (error) {
    console.error("[PATCH /api/microsites/:id/sections]", error);
    return NextResponse.json({ error: "Error interno" }, { status: 500 });
  }
}
