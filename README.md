# Guibay — Constructor de Micrositios Web

> Tu negocio, un solo enlace. Crea micrositios web en minutos, sin código.

## Stack

- **Framework**: Next.js 14 (App Router)
- **Estilos**: Tailwind CSS + shadcn/ui
- **Base de datos**: PostgreSQL via Supabase
- **ORM**: Prisma 5
- **Auth**: NextAuth.js v5 (email + Google OAuth)
- **Storage**: Cloudflare R2
- **Pagos**: Stripe + MercadoPago
- **Email**: Resend
- **Deploy**: Vercel

## Inicio rápido

```bash
# 1. Instalar dependencias
pnpm install

# 2. Copiar variables de entorno
cp .env.example .env.local
# → Edita .env.local con tus valores reales

# 3. Generar cliente Prisma
pnpm db:generate

# 4. Crear tablas en la base de datos
pnpm db:push

# 5. Poblar datos iniciales (planes y plantillas)
pnpm db:seed

# 6. Iniciar en desarrollo
pnpm dev
```

## Estructura del proyecto

```
src/
├── app/
│   ├── (auth)/          # Login, Registro
│   ├── (dashboard)/     # Dashboard, Editor, Upgrade, Settings
│   ├── [slug]/          # Micrositios públicos (ISR)
│   └── api/             # API Routes
├── components/
│   ├── ui/              # shadcn/ui base components
│   ├── editor/          # Componentes del editor
│   ├── templates/       # Renderers de plantillas
│   ├── addons/          # Secciones de add-ons
│   └── pricing/         # Planes y precios
├── lib/
│   ├── auth.ts          # Configuración NextAuth
│   ├── db.ts            # Cliente Prisma singleton
│   ├── utils.ts         # Utilidades compartidas
│   └── validations/     # Schemas Zod
├── types/               # Tipos TypeScript
└── middleware.ts        # Protección de rutas
prisma/
├── schema.prisma        # Schema completo de la DB
└── seed.ts              # Datos iniciales
```

## Scripts disponibles

| Script | Descripción |
|--------|-------------|
| `pnpm dev` | Servidor de desarrollo |
| `pnpm build` | Build de producción |
| `pnpm db:generate` | Genera el cliente Prisma |
| `pnpm db:migrate` | Crea una migración nueva |
| `pnpm db:push` | Push del schema sin migración |
| `pnpm db:studio` | Abre Prisma Studio (UI de la DB) |
| `pnpm db:seed` | Puebla datos iniciales |

## Variables de entorno

Ver `.env.example` para la lista completa con instrucciones de dónde obtener cada valor.

## Roadmap

- [x] Setup del proyecto (Next.js + Prisma + NextAuth)
- [ ] Onboarding wizard (Fase 1)
- [ ] Editor de micrositios con preview live
- [ ] Sistema de plantillas
- [ ] API de secciones y add-ons
- [ ] Integración Stripe (Plan Pro)
- [ ] Integración MercadoPago (LATAM)
- [ ] Custom domains (Fase 2)
- [ ] Analytics avanzados (Fase 2)
