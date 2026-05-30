# Mapa técnico

Última actualización: 2026-05-30

## Stack real

- Framework: Next.js `^15.1.0` con App Router.
- UI: React `^19.0.0`.
- Lenguaje: TypeScript.
- Estilos: Tailwind CSS `^3.4.7`.
- Auth: NextAuth.js `^5.0.0-beta.19`.
- Adapter auth: `@auth/prisma-adapter`.
- ORM: Prisma `^5.17.0`.
- DB objetivo: PostgreSQL vía Supabase.
- Validación: Zod.
- Formularios previstos: React Hook Form.
- Estado cliente previsto: Zustand.
- Storage previsto: Cloudflare R2.
- Pagos previstos: Stripe y MercadoPago.
- Email previsto: Resend.
- Deploy previsto: Vercel.

## Scripts importantes

- `pnpm dev`: servidor local.
- `pnpm build`: `prisma generate && next build`.
- `pnpm start`: servidor de producción.
- `pnpm lint`: lint de Next.
- `pnpm db:generate`: genera Prisma Client.
- `pnpm db:push`: empuja schema sin migración.
- `pnpm db:migrate`: crea migración local.
- `pnpm db:seed`: ejecuta seed inicial.

## Rutas App Router

- `/`: landing pública.
- `/login`: pantalla de login.
- `/register`: pantalla de registro.
- `/dashboard`: dashboard protegido.
- `/{slug}`: micrositio público publicado.

Rutas enlazadas pero no existentes todavía:

- `/dashboard/new`
- `/editor/{id}`
- `/upgrade`
- `/settings/profile`
- `/terms`
- `/privacy`

## APIs actuales

- `POST /api/auth/register`: crea usuario con password hash y asigna plan Free si existe.
- `GET /api/templates`: lista templates activos y marca Pro como locked para usuarios Free.
- `GET /api/microsites`: lista micrositios del usuario autenticado.
- `POST /api/microsites`: crea micrositio con secciones iniciales PROFILE, SOCIAL y LINKS.
- `GET /api/microsites/{id}`: obtiene micrositio del usuario con template, secciones y add-ons.
- `PATCH /api/microsites/{id}`: actualiza datos básicos del micrositio.
- `DELETE /api/microsites/{id}`: borra micrositio del usuario.
- `POST /api/microsites/{id}/publish`: publica o despublica.
- `GET /api/microsites/slug-check?slug=...`: normaliza y verifica disponibilidad de slug.

## Middleware y protección

- Rutas públicas: `/`, `/login`, `/register`.
- Rutas auth: `/login`, `/register`.
- Prefijos protegidos: `/dashboard`, `/editor`, `/settings`.
- APIs protegidas por defecto excepto `/api/auth`.
- Usuarios autenticados que visitan login/register son redirigidos a `/dashboard`.
- Usuarios no autenticados que visitan rutas protegidas son redirigidos a `/login?callbackUrl=...`.

## Modelo de datos

Modelos auth:

- `User`
- `Account`
- `Session`
- `VerificationToken`

Modelos de negocio:

- `Plan`: planes Free y Pro.
- `Subscription`: suscripción del usuario a un plan.
- `Template`: plantillas Free/Pro con config JSON.
- `Microsite`: sitio creado por usuario.
- `Section`: bloques ordenados del micrositio.
- `Addon`: funcionalidades extra por micrositio.
- `AddonPurchase`: compras de add-ons por usuario.
- `Analytics`: eventos por micrositio.

Enums principales:

- `UserRole`: `USER`, `ADMIN`.
- `PlanName`: `FREE`, `PRO`.
- `SubscriptionStatus`: `ACTIVE`, `CANCELED`, `PAST_DUE`, `TRIALING`, `INCOMPLETE`.
- `TemplateTier`: `FREE`, `PRO`.
- `SectionType`: `PROFILE`, `SOCIAL`, `LINKS`, `CONTACT`, `TEXT`, `VIDEO`.
- `AddonType`: `CATALOG`, `MAP`, `GALLERY`, `REVIEWS`, `WHATSAPP`.
- `AnalyticsEvent`: `PAGE_VIEW`, `LINK_CLICK`, `WHATSAPP_CLICK`, `CATALOG_VIEW`, `MAP_VIEW`, `GALLERY_VIEW`, `CONTACT_SUBMIT`.

## Flujo de datos base

1. Usuario se registra por API o OAuth.
2. El sistema crea o asocia usuario en Prisma.
3. Al crear usuario se intenta asignar plan Free.
4. Usuario entra al dashboard protegido.
5. Dashboard consulta micrositios del usuario.
6. API crea micrositio con slug, template y secciones iniciales.
7. Micrositio se puede publicar.
8. Página pública `/{slug}` solo muestra micrositios publicados.
9. Vista pública registra `PAGE_VIEW` en analytics de forma fire-and-forget.

## Variables de entorno relevantes

Mínimas para base funcional:

- `DATABASE_URL`
- `DIRECT_URL`
- `NEXTAUTH_URL`
- `NEXTAUTH_SECRET`
- `NEXT_PUBLIC_APP_URL`

Opcionales por feature:

- Google OAuth: `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`.
- Storage R2: `R2_ACCOUNT_ID`, `R2_ACCESS_KEY_ID`, `R2_SECRET_ACCESS_KEY`, `R2_BUCKET_NAME`, `R2_PUBLIC_URL`.
- Stripe: `STRIPE_SECRET_KEY`, `STRIPE_PUBLISHABLE_KEY`, `STRIPE_WEBHOOK_SECRET`, `STRIPE_PRICE_PRO_MONTHLY`, `STRIPE_PRICE_PRO_ANNUAL`.
- MercadoPago: `MP_ACCESS_TOKEN`, `MP_WEBHOOK_SECRET`.
- Email: `RESEND_API_KEY`, `EMAIL_FROM`.
- Maps: `NEXT_PUBLIC_GOOGLE_MAPS_KEY`.
- Vercel custom domains: `VERCEL_TEAM_ID`, `VERCEL_TOKEN`.
- Rate limiting: `UPSTASH_REDIS_REST_URL`, `UPSTASH_REDIS_REST_TOKEN`.

No guardar valores reales en este directorio.
