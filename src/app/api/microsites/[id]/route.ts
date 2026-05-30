import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { updateMicrositeSchema } from "@/lib/validations/microsite";

interface Params {
  params: Promise<{ id: string }>;
}

// GET /api/microsites/:id
export async function GET(_req: Request, { params }: Params) {
  try {
    const { id } = await params;
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const microsite = await db.microsite.findFirst({
      where: { id, userId: session.user.id },
      include: {
        template: true,
        sections: { orderBy: { order: "asc" } },
        addons: true,
      },
    });

    if (!microsite) {
      return NextResponse.json({ error: "No encontrado" }, { status: 404 });
    }

    return NextResponse.json({ data: microsite });
  } catch (error) {
    console.error("[GET /api/microsites/:id]", error);
    return NextResponse.json({ error: "Error interno" }, { status: 500 });
  }
}

// PATCH /api/microsites/:id
export async function PATCH(req: Request, { params }: Params) {
  try {
    const { id } = await params;
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const validated = updateMicrositeSchema.safeParse(body);

    if (!validated.success) {
      return NextResponse.json(
        { error: "Datos inválidos", details: validated.error.flatten() },
        { status: 400 }
      );
    }

    const existing = await db.microsite.findFirst({
      where: { id, userId: session.user.id },
      select: { id: true },
    });

    if (!existing) {
      return NextResponse.json({ error: "No encontrado" }, { status: 404 });
    }

    const microsite = await db.microsite.update({
      where: { id: existing.id },
      data: validated.data,
    });

    return NextResponse.json({ data: microsite });
  } catch (error) {
    console.error("[PATCH /api/microsites/:id]", error);
    return NextResponse.json({ error: "Error interno" }, { status: 500 });
  }
}

// DELETE /api/microsites/:id
export async function DELETE(_req: Request, { params }: Params) {
  try {
    const { id } = await params;
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const existing = await db.microsite.findFirst({
      where: { id, userId: session.user.id },
      select: { id: true },
    });

    if (!existing) {
      return NextResponse.json({ error: "No encontrado" }, { status: 404 });
    }

    await db.microsite.delete({
      where: { id: existing.id },
    });

    return NextResponse.json({ message: "Eliminado" });
  } catch (error) {
    console.error("[DELETE /api/microsites/:id]", error);
    return NextResponse.json({ error: "Error interno" }, { status: 500 });
  }
}
