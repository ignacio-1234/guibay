# Próximas tareas

Última actualización: 2026-05-30

## Completado el 2026-05-30

- `npm run lint` pasa sin warnings.
- `npm run build` pasa correctamente.
- Registro y login quedaron funcionales.
- `/dashboard/new` permite crear micrositios.
- `/editor/{id}` permite editar perfil, redes y botones.
- El editor permite publicar/despublicar y abrir el sitio público.
- Supabase `Kutplix` fue verificado con 12 tablas, 2 planes y 6 plantillas.

## Prioridad alta

0. Configurar variables en Vercel para desbloquear registro
   - Vercel CLI confirmo `No Environment Variables found for prueba-emilios-projects/guibay`.
   - Agregar en Production, Preview y Development: `DATABASE_URL`, `DIRECT_URL`, `NEXTAUTH_SECRET`, `NEXTAUTH_URL`, `NEXT_PUBLIC_APP_URL`.
   - Redeploy despues de guardar las variables.
   - Reprobar `/register` con una cuenta de prueba.

1. Verificar proyecto local
   - Ejecutar instalación si falta `node_modules`.
   - Ejecutar `pnpm db:generate`.
   - Ejecutar `pnpm lint`.
   - Ejecutar `pnpm build`.
   - Anotar errores reales antes de cambiar código.

2. Corregir documentación base
   - Actualizar README de Next.js 14 a Next.js 15.
   - Corregir texto roto por codificación en README y DEPLOY.
   - Mantener `.env.example` sin secretos.

3. Preparar deploy real
   - Confirmar que Vercel tiene `DATABASE_URL`, `DIRECT_URL`, `NEXTAUTH_SECRET`, `NEXTAUTH_URL` y `NEXT_PUBLIC_APP_URL`.
   - Confirmar que el proyecto Vercel usa el repo `ignacio-1234/guibay`.
   - Desplegar los cambios y validar `/`, `/login`, `/register`, `/dashboard/new` y `/editor/{id}`.

## Prioridad media

6. Completar APIs de edición de secciones
   - Definir endpoints o payload para actualizar `Section.data`.
   - Validar datos JSON por tipo de sección.
   - Mantener ownership por `userId`.

7. Aplicar templates en página pública
   - Leer `template.config`.
   - Aplicar colores, fuentes y layout.
   - Evitar estilos inseguros o inconsistentes.

8. Implementar reglas Free/Pro
   - Obtener plan real del usuario.
   - Bloquear templates Pro en backend.
   - Definir límites Free con mensajes claros.

## Prioridad baja

10. Crear páginas legales y settings
    - `/terms`
    - `/privacy`
    - `/settings/profile`

11. Crear `/upgrade`
    - Mostrar planes Free/Pro.
    - Preparar integración Stripe/MercadoPago.

12. Mejorar analytics
    - Registrar clicks.
    - Evitar guardar IP cruda si no es necesario.
    - Preparar métricas agregadas para dashboard.

13. Preparar producción
    - Confirmar variables en Vercel.
    - Confirmar Supabase connection pooling.
    - Confirmar dominio y `NEXTAUTH_URL`.
    - Actualizar `DEPLOY.md` con el estado real.

## Criterio de avance inmediato

La siguiente meta de producto debería ser:

Un usuario nuevo puede registrarse, iniciar sesión, crear un micrositio con template, editar perfil/redes/links, publicarlo y verlo en `/{slug}`.
