import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";

interface Params {
  params: Promise<{ id: string }>;
}

// POST /api/microsites/:id/publish — publicar o despublicar
export async function POST(req: Request, { params }: Params) {
  try {
    const { id } = await params;
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { published } = await req.json();

    const microsite = await db.microsite.update({
      where: { id, userId: session.user.id },
      data: {
        published: Boolean(published),
        publishedAt: published ? new Date() : null,
      },
    });

    return NextResponse.json({ data: microsite });
  } catch (error) {
    console.error("[POST /api/microsites/:id/publish]", error);
    return NextResponse.json({ error: "Error interno" }, { status: 500 });
  }
}
