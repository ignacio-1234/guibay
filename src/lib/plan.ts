import { db } from "@/lib/db";

/**
 * Fuente única de verdad de planes y límites (entitlements).
 * Cualquier chequeo de "¿este usuario puede X?" debe pasar por aquí.
 */

export type PlanName = "FREE" | "PRO";

export type Entitlements = {
  plan: PlanName;
  /** Máximo de micrositios que puede tener el usuario. */
  maxMicrosites: number;
  /** Si true, se oculta el pie "Hecho con Guibay" en el sitio público. */
  hideBranding: boolean;
  /** Analíticas avanzadas (Pro). */
  advancedAnalytics: boolean;
};

const RULES: Record<PlanName, Omit<Entitlements, "plan">> = {
  FREE: { maxMicrosites: 1, hideBranding: false, advancedAnalytics: false },
  PRO: { maxMicrosites: 10, hideBranding: true, advancedAnalytics: true },
};

/** Precios del plan Pro (en CLP). Configurables antes de lanzar. */
export const PRO_PRICING = {
  currency: "CLP" as const,
  monthly: 4990,
  annual: 47900,
};

/**
 * Devuelve el plan efectivo del usuario. Solo cuenta como PRO una
 * suscripción PRO con estado ACTIVE o TRIALING; cualquier otra cosa es FREE.
 */
export async function getUserPlan(userId: string): Promise<PlanName> {
  const subscription = await db.subscription.findUnique({
    where: { userId },
    include: { plan: true },
  });

  if (
    subscription?.plan.name === "PRO" &&
    (subscription.status === "ACTIVE" || subscription.status === "TRIALING")
  ) {
    // Pago por período: si ya venció, vuelve a FREE.
    const end = subscription.currentPeriodEnd;
    if (!end || end.getTime() > Date.now()) return "PRO";
  }
  return "FREE";
}

/** Devuelve los límites/permisos del usuario según su plan. */
export async function getEntitlements(userId: string): Promise<Entitlements> {
  const plan = await getUserPlan(userId);
  return { plan, ...RULES[plan] };
}

/** Límites de un plan sin tocar la base de datos (para UI/servidor). */
export function rulesFor(plan: PlanName): Entitlements {
  return { plan, ...RULES[plan] };
}
