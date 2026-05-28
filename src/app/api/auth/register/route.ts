import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { db } from "@/lib/db";
import { registerSchema } from "@/lib/validations/auth";

// POST /api/auth/register
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const validated = registerSchema.safeParse(body);

    if (!validated.success) {
      return NextResponse.json(
        { error: "Datos inválidos", details: validated.error.flatten() },
        { status: 400 }
      );
    }

    const { name, email, password } = validated.data;

    // Verificar si el email ya está registrado
    const existingUser = await db.user.findUnique({ where: { email } });
    if (existingUser) {
      return NextResponse.json({ error: "El email ya está registrado" }, { status: 409 });
    }

    // Hash de contraseña
    const passwordHash = await bcrypt.hash(password, 12);

    // Crear usuario
    const user = await db.user.create({
      data: {
        name,
        email,
        passwordHash,
      },
      select: {
        id: true,
        name: true,
        email: true,
        createdAt: true,
      },
    });

    // Asignar plan FREE
    const freePlan = await db.plan.findUnique({ where: { name: "FREE" } });
    if (freePlan) {
      await db.subscription.create({
        data: {
          userId: user.id,
          planId: freePlan.id,
          status: "ACTIVE",
        },
      });
    }

    return NextResponse.json(
      { data: user, message: "Cuenta creada exitosamente" },
      { status: 201 }
    );
  } catch (error) {
    console.error("[POST /api/auth/register]", error);
    return NextResponse.json({ error: "Error interno" }, { status: 500 });
  }
}
