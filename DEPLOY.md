# Guía de Deploy — Guibay

## Estado actual ✅

- [x] Base de datos Supabase "Kutplix" activa (`kcltmubdckqvdxetqaby`)
- [x] 12 tablas creadas en PostgreSQL 17.6
- [x] 2 planes insertados (Free / Pro)
- [x] 6 plantillas insertadas (4 Free + 2 Pro)

Nota 2026-05-30: Vercel CLI reporto `No Environment Variables found for prueba-emilios-projects/guibay`.
El registro en produccion no funcionara hasta agregar las variables minimas del Paso 5 y redeployar.
- [ ] Variables de entorno configuradas
- [ ] Código en GitHub
- [ ] Proyecto en Vercel

---

## Paso 1 — Configura tu password de Supabase

1. Ve a [supabase.com](https://supabase.com) → proyecto **Kutplix**
2. Settings → Database → **Database password** → Reset password (o cópialo si lo recuerdas)
3. Abre el archivo `.env.local` en la carpeta `guibay/`
4. Reemplaza los dos `[TU-PASSWORD]` con tu contraseña real

---

## Paso 2 — Genera el NEXTAUTH_SECRET

Abre una terminal y ejecuta:

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
```

Copia el resultado y pégalo en `NEXTAUTH_SECRET` en `.env.local`

---

## Paso 3 — Instala dependencias y verifica que anda

```bash
cd guibay
pnpm install
pnpm db:generate    # genera el cliente Prisma desde el schema
pnpm dev            # levanta en http://localhost:3000
```

> Si ves la landing de Guibay, ¡todo anda! 🎉

---

## Paso 4 — Sube a GitHub

```bash
# Desde la carpeta guibay/
git init
git add .
git commit -m "feat: Guibay MVP inicial"

# Crea un repo en github.com/new (nombre sugerido: guibay)
# Luego:
git remote add origin https://github.com/TU-USUARIO/guibay.git
git branch -M main
git push -u origin main
```

---

## Paso 5 — Conecta con Vercel

1. Ve a [vercel.com](https://vercel.com) → **Add New Project**
2. Selecciona tu repo `guibay` de GitHub
3. En **Configure Project**:
   - Framework: **Next.js** (auto-detectado)
   - Root Directory: `/` (o `guibay/` si lo subiste como subcarpeta)
4. En **Environment Variables**, agrega estas (mínimas para que funcione):

| Key | Valor |
|-----|-------|
| `DATABASE_URL` | `postgresql://postgres:[PASSWORD]@db.kcltmubdckqvdxetqaby.supabase.co:6543/postgres?pgbouncer=true` |
| `DIRECT_URL` | `postgresql://postgres:[PASSWORD]@db.kcltmubdckqvdxetqaby.supabase.co:5432/postgres` |
| `NEXTAUTH_SECRET` | tu secret generado en el Paso 2 |
| `NEXTAUTH_URL` | `https://TU-PROYECTO.vercel.app` |
| `NEXT_PUBLIC_APP_URL` | `https://TU-PROYECTO.vercel.app` |

5. Click **Deploy** → Vercel hace el build automático

---

## Paso 6 — Agrega el build command de Prisma en Vercel

En Vercel → Settings → General → **Build Command**, cambia a:

```
prisma generate && next build
```

Esto asegura que el cliente Prisma se genera en cada deploy.

---

## Variables para habilitar features adicionales

Agrégalas en Vercel cuando estés listo para cada feature:

| Feature | Variable | Dónde obtenerla |
|---------|----------|-----------------|
| Login con Google | `GOOGLE_CLIENT_ID` + `GOOGLE_CLIENT_SECRET` | console.cloud.google.com |
| Subida de imágenes | `R2_*` (5 variables) | cloudflare.com → R2 |
| Pagos (Plan Pro) | `STRIPE_*` (5 variables) | dashboard.stripe.com |
| Emails | `RESEND_API_KEY` | resend.com |
| Mapa (Add-on) | `NEXT_PUBLIC_GOOGLE_MAPS_KEY` | console.cloud.google.com |
