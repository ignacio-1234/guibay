import { NextResponse } from "next/server";
import { put } from "@vercel/blob";
import sharp from "sharp";
import { nanoid } from "nanoid";
import { auth } from "@/lib/auth";

// Tipos de imagen aceptados y tamaño máximo del archivo original
const ACCEPTED = ["image/jpeg", "image/png", "image/webp", "image/gif"];
const MAX_BYTES = 8 * 1024 * 1024; // 8 MB

// Presets de optimización según dónde se usa la imagen
const PRESETS = {
  avatar: { width: 400, height: 400, fit: "cover" as const },
  hero: { width: 1600, height: 900, fit: "cover" as const },
  free: { width: 1600, height: 1600, fit: "inside" as const },
};

// POST /api/upload  —  sube una imagen optimizada a Vercel Blob y devuelve su URL
export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    if (!process.env.BLOB_READ_WRITE_TOKEN) {
      return NextResponse.json(
        { error: "El almacenamiento de imágenes no está configurado todavía." },
        { status: 503 }
      );
    }

    const form = await req.formData();
    const file = form.get("file");
    const kind = String(form.get("kind") ?? "free") as keyof typeof PRESETS;

    if (!(file instanceof File)) {
      return NextResponse.json({ error: "No se recibió ninguna imagen." }, { status: 400 });
    }
    if (!ACCEPTED.includes(file.type)) {
      return NextResponse.json(
        { error: "Formato no válido. Usa JPG, PNG, WebP o GIF." },
        { status: 400 }
      );
    }
    if (file.size > MAX_BYTES) {
      return NextResponse.json(
        { error: "La imagen es muy pesada. El máximo es 8 MB." },
        { status: 400 }
      );
    }

    const preset = PRESETS[kind] ?? PRESETS.free;
    const input = Buffer.from(await file.arrayBuffer());

    // Optimizamos: redimensionamos y convertimos a WebP para que cargue rápido
    // (importante para conexiones lentas en Latinoamérica).
    const optimized = await sharp(input)
      .rotate() // respeta la orientación EXIF del celular
      .resize({
        width: preset.width,
        height: preset.height,
        fit: preset.fit,
        withoutEnlargement: true,
      })
      .webp({ quality: 82 })
      .toBuffer();

    const blob = await put(`microsites/${session.user.id}/${kind}-${nanoid(10)}.webp`, optimized, {
      access: "public",
      contentType: "image/webp",
    });

    return NextResponse.json({ url: blob.url });
  } catch (error) {
    console.error("[POST /api/upload]", error);
    return NextResponse.json({ error: "No se pudo subir la imagen." }, { status: 500 });
  }
}
