# Roadmap de construcción

Última actualización: 2026-05-30

## Fase 0: estabilizar base

Objetivo: que el repo compile y la documentación refleje el estado real.

- Confirmar instalación y build local con variables mínimas.
- Corregir textos con codificación rota en documentación y UI.
- Actualizar README para reflejar Next.js 15 y React 19.
- Verificar `pnpm lint` y `pnpm build`.
- Confirmar que Prisma Client se genera correctamente en local y Vercel.

## Fase 1: auth y onboarding funcional

Objetivo: que un usuario pueda crear cuenta, iniciar sesión y llegar a un dashboard útil.

- Conectar formulario de registro a `POST /api/auth/register`.
- Conectar login credentials con NextAuth.
- Conectar login/registro con Google OAuth.
- Manejar errores visibles en formularios.
- Respetar `callbackUrl` después del login.
- Crear `/dashboard/new` como inicio del onboarding.
- Permitir elegir template, título y slug.
- Usar `slug-check` para validar disponibilidad antes de crear.

## Fase 2: editor mínimo de micrositios

Objetivo: que el usuario pueda editar y publicar un micrositio real.

- Crear `/editor/{id}` protegido.
- Cargar micrositio por `GET /api/microsites/{id}`.
- Editar sección PROFILE: nombre, bio, avatar, hero.
- Editar sección SOCIAL: redes sociales.
- Editar sección LINKS: botones con label, URL y color.
- Guardar cambios con API estable.
- Crear preview live dentro del editor.
- Publicar/despublicar con `POST /api/microsites/{id}/publish`.

## Fase 3: plantillas y experiencia pública

Objetivo: que los micrositios publicados se vean bien y reflejen templates.

- Aplicar `template.config` en la página pública.
- Crear renderers por layout o categoría.
- Mejorar SEO y Open Graph por micrositio.
- Registrar clicks de links y eventos importantes.
- Agregar estados vacíos profesionales.
- Validar responsive móvil primero.

## Fase 4: planes, pagos y límites

Objetivo: convertir Free/Pro en reglas reales del producto.

- Calcular plan real del usuario en backend.
- Bloquear templates Pro para Free también en API de creación/actualización.
- Definir límite Free: cantidad de micrositios, branding y features.
- Crear `/upgrade`.
- Integrar Stripe para pagos internacionales.
- Integrar MercadoPago para LATAM si sigue siendo prioridad.
- Agregar webhooks y sincronización de suscripciones.

## Fase 5: storage, add-ons y contenido avanzado

Objetivo: permitir contenido rico sin romper simplicidad.

- Integrar Cloudflare R2 para imágenes.
- Agregar carga segura de avatar/hero.
- Implementar add-ons: catálogo, mapa, galería, reviews, WhatsApp.
- Validar permisos de add-ons por plan o compra.
- Agregar email transaccional con Resend.

## Fase 6: producción y crecimiento

Objetivo: operar Guibay en producción de forma confiable.

- Configurar Vercel con variables reales.
- Confirmar build y runtime en producción.
- Configurar dominio principal.
- Agregar custom domains para micrositios Pro.
- Agregar rate limiting si hay abuso o endpoints públicos sensibles.
- Agregar observabilidad básica: logs, errores y métricas.
- Documentar proceso de deploy definitivo.
