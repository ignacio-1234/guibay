import { NextResponse } from "next/server";
import { MercadoPagoConfig, Preference } from "mercadopago";
import { auth } from "@/lib/auth";
import { getUserPlan, PRO_PRICING } from "@/lib/plan";

// URL base pública de la app (para back_urls y notification_url).
function appUrl(req: Request) {
  return (
    process.env.NEXT_PUBLIC_APP_URL?.replace(/\/$/, "") ||
    new URL(req.url).origin
  );
}

// POST /api/checkout/mercadopago — inicia el pago del plan Pro (Checkout Pro).
export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    if (!process.env.MP_ACCESS_TOKEN) {
      return NextResponse.json(
        { error: "Los pagos aún no están configurados." },
        { status: 503 }
      );
    }

    // Si ya es Pro, no tiene sentido cobrar de nuevo.
    if ((await getUserPlan(session.user.id)) === "PRO") {
      return NextResponse.json({ error: "Ya tienes el plan Pro." }, { status: 409 });
    }

    const { billing } = (await req.json().catch(() => ({}))) as {
      billing?: "monthly" | "annual";
    };
    const isAnnual = billing === "annual";
    const amount = isAnnual ? PRO_PRICING.annual : PRO_PRICING.monthly;
    const title = isAnnual ? "Guibay Pro — 1 año" : "Guibay Pro — 1 mes";

    const base = appUrl(req);
    const client = new MercadoPagoConfig({ accessToken: process.env.MP_ACCESS_TOKEN });
    const preference = new Preference(client);

    const result = await preference.create({
      body: {
        items: [
          {
            id: isAnnual ? "pro-annual" : "pro-monthly",
            title,
            quantity: 1,
            unit_price: amount,
            currency_id: PRO_PRICING.currency,
          },
        ],
        payer: { email: session.user.email ?? undefined },
        // external_reference: "<userId>:<billing>". MercadoPago SÍ propaga este
        // campo al pago (a diferencia de metadata), así sabemos a quién y por
        // cuánto tiempo acreditar el plan.
        external_reference: `${session.user.id}:${isAnnual ? "annual" : "monthly"}`,
        metadata: { user_id: session.user.id, billing: isAnnual ? "annual" : "monthly" },
        back_urls: {
          success: `${base}/upgrade?status=success`,
          failure: `${base}/upgrade?status=failure`,
          pending: `${base}/upgrade?status=pending`,
        },
        auto_return: "approved",
        notification_url: `${base}/api/webhooks/mercadopago`,
      },
    });

    const url = result.init_point ?? result.sandbox_init_point;
    if (!url) {
      return NextResponse.json({ error: "No se pudo iniciar el pago." }, { status: 502 });
    }
    return NextResponse.json({ url });
  } catch (error) {
    console.error("[POST /api/checkout/mercadopago]", error);
    return NextResponse.json({ error: "No se pudo iniciar el pago." }, { status: 500 });
  }
}
