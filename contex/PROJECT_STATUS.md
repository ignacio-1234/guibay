# Estado actual del proyecto

Última actualización: 2026-05-30

## Avance implementado el 2026-05-30

- Diagnostico produccion 2026-05-30:
  - Vercel proyecto `prueba-emilios-projects/guibay` esta enlazado y el deploy actual esta `READY`.
  - Vercel CLI reporta: `No Environment Variables found for prueba-emilios-projects/guibay`.
  - Supabase `Kutplix` responde y tiene `User = 0`, `Plan = 2`, `Subscription = 0`.
  - El registro falla en produccion porque falta configurar variables minimas de entorno en Vercel, especialmente `DATABASE_URL`.
  - Se agrego un guard en `POST /api/auth/register` para devolver error claro si falta `DATABASE_URL`.
- Diagnostico produccion 2026-06-02:
  - `DATABASE_URL` ya existe en Vercel, pero los logs muestran `Can't reach database server at db.kcltmubdckqvdxetqaby.supabase.co:6543`.
  - La variable debe usar el pooler de Supabase: `postgresql://postgres.kcltmubdckqvdxetqaby:[PASSWORD_URL_ENCODED]@aws-0-us-east-2.pooler.supabase.com:6543/postgres?pgbouncer=true`.
  - `DIRECT_URL` debe quedar como conexion directa: `postgresql://postgres:[PASSWORD_URL_ENCODED]@db.kcltmubdckqvdxetqaby.supabase.co:5432/postgres`.

- Registro funcional: `/register` llama `POST /api/auth/register` y luego inicia sesión con Credentials.
- Login funcional: `/login` usa NextAuth Credentials y Google OAuth cuando las variables de Google están configuradas.
- Creación de micrositio: `/dashboard/new` lista templates, valida slug y crea el micrositio.
- Editor mínimo: `/editor/{id}` permite editar perfil, redes y botones.
- Publicación: el editor guarda cambios y publica/despublica con `POST /api/microsites/{id}/publish`.
- Página pública: `/{slug}` ahora es dinámica para reflejar publicación/despublicación al momento.
- Verificación local: `npm run lint` y `npm run build` pasan correctamente.
- Supabase verificado con plugin: proyecto `Kutplix` activo, 12 tablas, 2 planes y 6 plantillas.

## Resumen

Guibay tiene un MVP técnico inicial. La estructura base ya está creada y conectada alrededor de Next.js App Router, Prisma, NextAuth y Supabase/PostgreSQL, pero todavía faltan flujos completos de producto para que un usuario pueda registrarse, crear, editar y publicar un micrositio sin intervención manual.

## Estado comprobado

- Repositorio local: `C:\Users\jiser\Desktop\gubai\guibay`.
- Rama local: `main`.
- Remoto Git configurado: `https://github.com/ignacio-1234/guibay.git`.
- Últimos commits relevantes:
  - `3eb1625 fix: generate prisma client during build`
  - `5642f4f fix: resolve Vercel build errors`
  - `5bae052 fix: actualizar a Next.js 15 compatible con next.config.ts`
  - `26d002e feat: Guibay MVP - Next.js 14 + Prisma + NextAuth`
- `DEPLOY.md` indica Supabase activo como proyecto `Kutplix`, ref `kcltmubdckqvdxetqaby`.
- `DEPLOY.md` marca pendiente: variables de entorno, código en GitHub y proyecto en Vercel.
- El historial Git muestra fixes de build para Vercel, así que el estado de deploy debe verificarse antes de asumir que producción ya existe.

## Lo que ya existe

- Landing pública en `/`.
- Páginas visuales de login y registro en `/login` y `/register`.
- Layout protegido de dashboard en `/dashboard`.
- Dashboard que lista micrositios del usuario autenticado.
- Página pública de micrositio en `/{slug}` con ISR y registro básico de visitas.
- NextAuth v5 configurado con Credentials y Google OAuth.
- Prisma Adapter para NextAuth.
- API de registro con hash de password y asignación de plan Free.
- APIs para listar, crear, leer, actualizar, borrar y publicar micrositios.
- API para revisar disponibilidad de slug.
- API para listar templates y marcar templates Pro como bloqueados.
- Schema Prisma con usuarios, planes, suscripciones, plantillas, micrositios, secciones, add-ons y analíticas.
- Seed con 2 planes y 6 plantillas.

## Pendientes importantes

- Los formularios de login y registro ya están conectados.
- Los botones Google en login/registro disparan `signIn("google")` si Google OAuth está configurado.
- Ya existe ruta de editor en `/editor/{id}`.
- Ya existe `/dashboard/new`.
- No existen `/upgrade`, `/settings/profile`, `/terms` ni `/privacy` aunque ya hay enlaces.
- Ya hay UI para crear microsites desde el dashboard.
- Ya hay editor mínimo para modificar perfil, redes y links. Add-ons y templates avanzadas siguen pendientes.
- La página pública por slug renderiza principalmente secciones PROFILE, SOCIAL y LINKS.
- `GET /api/templates` todavía usa plan Free fijo y no calcula el plan real del usuario.
- Falta aplicar reglas de límites Free/Pro en backend.
- Falta integrar pagos, storage real, email, custom domains y analytics avanzadas.
- Falta confirmar variables de entorno reales en local y en Vercel.

## Riesgos y discrepancias

- `README.md` dice Next.js 14, pero `package.json` usa Next.js `^15.1.0` y React `^19.0.0`.
- Varios archivos existentes muestran texto con codificación rota. Esta carpeta `contex/` debe quedar en UTF-8 limpio y puede servir como referencia para corregir la documentación anterior.
- `DEPLOY.md` indica PostgreSQL 17.6 en Supabase, mientras comentarios del schema dicen PostgreSQL 16. Tratar el dato de Supabase como pendiente de verificación directa.
- El schema permite `where: { id, userId }` en algunas operaciones Prisma. Confirmar en build/typecheck si Prisma acepta esa forma con los tipos generados actuales.

## Estado recomendado antes de seguir

El siguiente bloque de trabajo debería enfocarse en cerrar el flujo base:

1. Registro funcional.
2. Login funcional.
3. Crear micrositio desde UI.
4. Editor mínimo para perfil, redes y links.
5. Publicar y ver `/{slug}`.
6. Deploy Vercel con variables correctas.
