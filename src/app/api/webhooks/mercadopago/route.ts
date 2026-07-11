import { NextResponse } from "next/server";
import crypto from "crypto";
import { MercadoPagoConfig, Payment } from "mercadopago";
import { db } from "@/lib/db";

/**
 * Verifica la firma del webhook de MercadoPago (header x-signature).
 * Devuelve true si no hay secreto configurado (no se puede/`quiere` validar).
 * Doc: manifest = `id:<data.id>;request-id:<x-request-id>;ts:<ts>;`
 */
function verifySignature(req: Request, dataId: string): boolean {
  const secret = process.env.MP_WEBHOOK_SECRET;
  if (!secret) return true; // sin secreto, no validamos (dev)

  const xSignature = req.headers.get("x-signature");
  const xRequestId = req.headers.get("x-request-id");
  if (!xSignature || !xRequestId) return false;

  const parts = Object.fromEntries(
    xSignature.split(",").map((p) => p.split("=").map((s) => s.trim()) as [string, string])
  );
  const ts = parts["ts"];
  const v1 = parts["v1"];
  if (!ts || !v1) return false;

  const manifest = `id:${dataId.toLowerCase()};request-id:${xRequestId};ts:${ts};`;
  const hmac = crypto.createHmac("sha256", secret).update(manifest).digest("hex");
  try {
    return crypto.timingSafeEqual(Buffer.from(hmac), Buffer.from(v1));
  } catch {
    return false;
  }
}

// Otorga el plan Pro al usuario por el período pagado.
async function grantPro(userId: string, paymentId: string, billing: string) {
  const proPlan = await db.plan.findUnique({ where: { name: "PRO" } });
  if (!proPlan) {
    console.error("[mp webhook] No existe el plan PRO en la base de datos.");
    return;
  }

  const now = new Date();
  const end = new Date(now);
  if (billing === "annual") end.setFullYear(end.getFullYear() + 1);
  else end.setMonth(end.getMonth() + 1);

  await db.subscription.upsert({
    where: { userId },
    create: {
      userId,
      planId: proPlan.id,
      status: "ACTIVE",
      mpSubscriptionId: paymentId,
      currentPeriodStart: now,
      currentPeriodEnd: end,
    },
    update: {
      planId: proPlan.id,
      status: "ACTIVE",
      mpSubscriptionId: paymentId,
      currentPeriodStart: now,
      currentPeriodEnd: end,
    },
  });
  console.log(`[mp webhook] Plan Pro activado para ${userId} hasta ${end.toISOString()}`);
}

// POST /api/webhooks/mercadopago — recibe notificaciones de pago de MP.
export async function POST(req: Request) {
  try {
    if (!process.env.MP_ACCESS_TOKEN) {
      return NextResponse.json({ ok: true }, { status: 200 });
    }

    const url = new URL(req.url);
    const body = (await req.json().catch(() => ({}))) as {
      type?: string;
      action?: string;
      data?: { id?: string };
    };

    const type = body.type ?? url.searchParams.get("type") ?? url.searchParams.get("topic");
    const dataId =
      body.data?.id ?? url.searchParams.get("data.id") ?? url.searchParams.get("id");

    // Solo nos interesan las notificaciones de pago.
    if (type !== "payment" || !dataId) {
      return NextResponse.json({ ok: true }, { status: 200 });
    }

    if (!verifySignature(req, dataId)) {
      console.warn("[mp webhook] Firma inválida.");
      return NextResponse.json({ error: "Firma inválida" }, { status: 401 });
    }

    // Consultamos el pago real en MP (nunca confiamos en el estado del body).
    const client = new MercadoPagoConfig({ accessToken: process.env.MP_ACCESS_TOKEN });
    const payment = await new Payment(client).get({ id: dataId });

    if (payment.status === "approved") {
      // external_reference viene como "<userId>:<billing>".
      const ref = payment.external_reference ?? "";
      const [refUserId, refBilling] = ref.split(":");
      const userId = refUserId || (payment.metadata as { user_id?: string })?.user_id;
      const billing =
        refBilling || (payment.metadata as { billing?: string })?.billing || "monthly";
      if (userId) await grantPro(userId, String(payment.id), billing);
    }

    return NextResponse.json({ ok: true }, { status: 200 });
  } catch (error) {
    console.error("[POST /api/webhooks/mercadopago]", error);
    // 500 → MercadoPago reintenta más tarde (útil si fue un fallo transitorio).
    return NextResponse.json({ error: "Error procesando webhook" }, { status: 500 });
  }
}
