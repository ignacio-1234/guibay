import { PrismaClient, PlanName, TemplateTier } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Seeding Guibay database...");

  // ── Planes ──────────────────────────────────
  const freePlan = await prisma.plan.upsert({
    where: { name: PlanName.FREE },
    update: {},
    create: {
      name: PlanName.FREE,
      displayName: "Free",
      priceMonthly: 0,
      priceAnnual: 0,
      features: [
        "1 micrositio",
        "Plantillas básicas",
        "Redes sociales ilimitadas",
        "Dominio guibay.com/tu-marca",
        "Analíticas básicas",
      ],
    },
  });

  const proPlan = await prisma.plan.upsert({
    where: { name: PlanName.PRO },
    update: {},
    create: {
      name: PlanName.PRO,
      displayName: "Pro",
      priceMonthly: 5,
      priceAnnual: 48,
      features: [
        "Todo lo de Free",
        "Plantillas premium",
        "Dominio personalizado",
        "Analíticas avanzadas",
        "Sin marca Guibay",
        "Soporte prioritario",
      ],
    },
  });

  console.log("✅ Plans:", freePlan.name, proPlan.name);

  // ── Templates ──────────────────────────────────
  const templates = await Promise.all([
    prisma.template.upsert({
      where: { slug: "mindfull" },
      update: {},
      create: {
        name: "MindFull",
        slug: "mindfull",
        description: "Elegante y minimalista, ideal para coaches y profesionales",
        category: "professional",
        tier: TemplateTier.FREE,
        config: {
          colors: {
            background: "#FFFFFF",
            primary: "#2D1B69",
            accent: "#FF1654",
            text: "#1A1A2E",
          },
          fonts: {
            heading: "Inter",
            body: "Inter",
          },
          layout: "centered",
        },
      },
    }),
    prisma.template.upsert({
      where: { slug: "vibrante" },
      update: {},
      create: {
        name: "Vibrante",
        slug: "vibrante",
        description: "Colorido y energético, perfecto para negocios creativos",
        category: "creative",
        tier: TemplateTier.FREE,
        config: {
          colors: {
            background: "#FF1654",
            primary: "#FFFFFF",
            accent: "#FFD600",
            text: "#FFFFFF",
          },
          fonts: {
            heading: "Inter",
            body: "Inter",
          },
          layout: "full-width",
        },
      },
    }),
    prisma.template.upsert({
      where: { slug: "oscuro-pro" },
      update: {},
      create: {
        name: "Oscuro Pro",
        slug: "oscuro-pro",
        description: "Dark mode elegante, para marcas premium",
        category: "business",
        tier: TemplateTier.PRO,
        config: {
          colors: {
            background: "#0F0F1A",
            primary: "#FFFFFF",
            accent: "#FF1654",
            text: "#E5E7EB",
          },
          fonts: {
            heading: "Inter",
            body: "Inter",
          },
          layout: "centered",
        },
      },
    }),
    prisma.template.upsert({
      where: { slug: "naturaleza" },
      update: {},
      create: {
        name: "Naturaleza",
        slug: "naturaleza",
        description: "Tonos tierra, ideal para gastronomía y productos naturales",
        category: "business",
        tier: TemplateTier.FREE,
        config: {
          colors: {
            background: "#F5F0E8",
            primary: "#4A3728",
            accent: "#8B6B3D",
            text: "#2C1810",
          },
          fonts: {
            heading: "Inter",
            body: "Inter",
          },
          layout: "card",
        },
      },
    }),
    prisma.template.upsert({
      where: { slug: "neon-city" },
      update: {},
      create: {
        name: "Neon City",
        slug: "neon-city",
        description: "Estética urbana y futurista para creadores y artistas",
        category: "creative",
        tier: TemplateTier.PRO,
        config: {
          colors: {
            background: "#0A0A0F",
            primary: "#00FFD1",
            accent: "#FF00FF",
            text: "#FFFFFF",
          },
          fonts: {
            heading: "Inter",
            body: "Inter",
          },
          layout: "full-width",
        },
      },
    }),
    prisma.template.upsert({
      where: { slug: "clasico" },
      update: {},
      create: {
        name: "Clásico",
        slug: "clasico",
        description: "Simple, limpio y profesional para cualquier rubro",
        category: "minimal",
        tier: TemplateTier.FREE,
        config: {
          colors: {
            background: "#FAFAFA",
            primary: "#111827",
            accent: "#3B82F6",
            text: "#374151",
          },
          fonts: {
            heading: "Inter",
            body: "Inter",
          },
          layout: "centered",
        },
      },
    }),
  ]);

  console.log(`✅ Templates: ${templates.length} creados`);
  console.log("🎉 Seed completado!");
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
