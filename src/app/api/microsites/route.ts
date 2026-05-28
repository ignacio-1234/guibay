import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { createMicrositeSchema } from "@/lib/validations/microsite";
import { toSlug } from "@/lib/utils";

// GET /api/microsites — obtener micrositios del usuario
export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const microsites = await db.microsite.findMany({
      where: { userId: session.user.id },
      include: {
        template: true,
        _count: { select: { analytics: true } },
      },
      orderBy: { updatedAt: "desc" },
    });

    return NextResponse.json({ data: microsites });
  } catch (error) {
    console.error("[GET /api/microsites]", error);
    return NextResponse.json({ error: "Error interno" }, { status: 500 });
  }
}

// POST /api/microsites — crear micrositio
export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const validated = createMicrositeSchema.safeParse(body);

    if (!validated.success) {
      return NextResponse.json(
        { error: "Datos inválidos", details: validated.error.flatten() },
        { status: 400 }
      );
    }

    const { title, slug, templateId } = validated.data;

    // Verificar slug disponible
    const existing = await db.microsite.findUnique({ where: { slug } });
    if (existing) {
      return NextResponse.json({ error: "El slug ya está en uso" }, { status: 409 });
    }

    // Verificar que la plantilla existe
    const template = await db.template.findUnique({ where: { id: templateId } });
    if (!template) {
      return NextResponse.json({ error: "Plantilla no encontrada" }, { status: 404 });
    }

    // Crear micrositio con secciones por defecto
    const microsite = await db.microsite.create({
      data: {
        title,
        slug: toSlug(slug),
        templateId,
        userId: session.user.id,
        sections: {
          create: [
            {
              type: "PROFILE",
              order: 0,
              data: { name: title, bio: "", avatarUrl: null, heroUrl: null },
            },
            {
              type: "SOCIAL",
              order: 1,
              data: { networks: [] },
            },
            {
              type: "LINKS",
              order: 2,
              data: { buttons: [] },
            },
          ],
        },
      },
      include: { template: true, sections: true },
    });

    return NextResponse.json({ data: microsite }, { status: 201 });
  } catch (error) {
    console.error("[POST /api/microsites]", error);
    return NextResponse.json({ error: "Error interno" }, { status: 500 });
  }
}
