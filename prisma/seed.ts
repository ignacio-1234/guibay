import { PrismaClient, PlanName, TemplateTier } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Seeding Guibay database...");

  // ── Planes ──────────────────────────────────
  const freePlan = await prisma.plan.upsert({
    where: { name: PlanName.FREE },
    update: {
      priceMonthly: 0,
      priceAnnual: 0,
      features: [
        "1 micrositio",
        "1 estilo de diseño",
        "Redes sociales ilimitadas",
        "Dominio guibay.com/tu-marca",
        "Analíticas básicas",
      ],
    },
    create: {
      name: PlanName.FREE,
      displayName: "Free",
      priceMonthly: 0,
      priceAnnual: 0,
      features: [
        "1 micrositio",
        "1 estilo de diseño",
        "Redes sociales ilimitadas",
        "Dominio guibay.com/tu-marca",
        "Analíticas básicas",
      ],
    },
  });

  const proPlan = await prisma.plan.upsert({
    where: { name: PlanName.PRO },
    update: {
      priceMonthly: 4990,
      priceAnnual: 47900,
      features: [
        "Hasta 10 micrositios",
        "Los 6 estilos de diseño",
        "Sin marca Guibay",
        "Analíticas avanzadas",
        "Dominio personalizado",
        "Soporte prioritario",
      ],
    },
    create: {
      name: PlanName.PRO,
      displayName: "Pro",
      priceMonthly: 4990,
      priceAnnual: 47900,
      features: [
        "Hasta 10 micrositios",
        "Los 6 estilos de diseño",
        "Sin marca Guibay",
        "Analíticas avanzadas",
        "Dominio personalizado",
        "Soporte prioritario",
      ],
    },
  });

  console.log("✅ Plans:", freePlan.name, proPlan.name);

  // ── Estilos (plantillas) ────────────────────
  // Los 6 estilos que el usuario puede elegir. Todos son FREE-seleccionables;
  // el plan Free tiene 1 sitio (1 estilo a la vez), Pro puede tener varios.
  const STYLES = [
    {
      name: "Minimalismo",
      slug: "minimalismo",
      description: "Limpio y elegante. Deja respirar tu contenido.",
      category: "minimal",
      colors: { background: "#FFFFFF", primary: "#111111", accent: "#111111", text: "#3F3F46" },
      layout: "minimal",
      style: "minimal",
    },
    {
      name: "Glassmorphism",
      slug: "glassmorphism",
      description: "Vidrio esmerilado y profundidad. Moderno y fresco.",
      category: "creative",
      colors: { background: "#EEF2FF", primary: "#4338CA", accent: "#06B6D4", text: "#1E1B4B" },
      layout: "card",
      style: "glass",
    },
    {
      name: "Claymorphism",
      slug: "claymorphism",
      description: "Formas suaves y esponjosas. Amable y cercano.",
      category: "creative",
      colors: { background: "#EDEBFF", primary: "#6D5AE6", accent: "#FF8FB1", text: "#2E2A4A" },
      layout: "card",
      style: "clay",
    },
    {
      name: "UI Espacial",
      slug: "ui-espacial",
      description: "Oscuro, futurista y con brillos de neón.",
      category: "creative",
      colors: { background: "#070713", primary: "#A78BFA", accent: "#22D3EE", text: "#E5E7EB" },
      layout: "full-width",
      style: "spatial",
    },
    {
      name: "Maximalismo",
      slug: "maximalismo",
      description: "Colores intensos y tipografía enorme. Imposible de ignorar.",
      category: "creative",
      colors: { background: "#FFE600", primary: "#141414", accent: "#FF2D95", text: "#141414" },
      layout: "full-width",
      style: "maximal",
    },
    {
      name: "Brutalismo",
      slug: "brutalismo",
      description: "Bordes gruesos y sin rodeos. Diseño que se hace notar.",
      category: "creative",
      colors: { background: "#FFFFFF", primary: "#000000", accent: "#FF3300", text: "#111111" },
      layout: "brutal",
      style: "brutal",
    },
  ] as const;

  const templates = await Promise.all(
    STYLES.map((s) =>
      prisma.template.upsert({
        where: { slug: s.slug },
        update: {
          name: s.name,
          description: s.description,
          category: s.category,
          tier: TemplateTier.FREE,
          isActive: true,
          config: {
            colors: s.colors,
            fonts: { heading: "Inter", body: "Inter" },
            layout: s.layout,
            style: s.style,
          },
        },
        create: {
          name: s.name,
          slug: s.slug,
          description: s.description,
          category: s.category,
          tier: TemplateTier.FREE,
          config: {
            colors: s.colors,
            fonts: { heading: "Inter", body: "Inter" },
            layout: s.layout,
            style: s.style,
          },
        },
      })
    )
  );

  // Ocultar plantillas viejas del selector (los sitios existentes las siguen usando).
  await prisma.template.updateMany({
    where: { slug: { in: ["mindfull", "vibrante", "oscuro-pro", "naturaleza", "neon-city", "clasico", "brutalista", "minimalista"] } },
    data: { isActive: false },
  });

  console.log(`✅ Estilos: ${templates.length} creados`);
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
