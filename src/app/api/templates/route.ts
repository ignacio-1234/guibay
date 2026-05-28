import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { auth } from "@/lib/auth";

// GET /api/templates
export async function GET() {
  try {
    const session = await auth();
    const userPlan = session?.user ? "FREE" : "FREE"; // TODO: obtener plan real del usuario

    const templates = await db.template.findMany({
      where: { isActive: true },
      orderBy: [{ tier: "asc" }, { name: "asc" }],
    });

    // Marcar cuáles están disponibles según el plan
    const templatesWithAccess = templates.map((t) => ({
      ...t,
      locked: t.tier === "PRO" && userPlan === "FREE",
    }));

    return NextResponse.json({ data: templatesWithAccess });
  } catch (error) {
    console.error("[GET /api/templates]", error);
    return NextResponse.json({ error: "Error interno" }, { status: 500 });
  }
}
