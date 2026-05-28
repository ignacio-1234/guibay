import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { toSlug } from "@/lib/utils";

// GET /api/microsites/slug-check?slug=mi-negocio
export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const rawSlug = searchParams.get("slug");

  if (!rawSlug) {
    return NextResponse.json({ error: "Slug requerido" }, { status: 400 });
  }

  const slug = toSlug(rawSlug);

  if (slug.length < 3) {
    return NextResponse.json({ available: false, reason: "muy_corto" });
  }

  const existing = await db.microsite.findUnique({ where: { slug } });

  return NextResponse.json({ available: !existing, slug });
}
