# Contexto técnico de Guibay

Última actualización: 2026-05-30

Esta carpeta es la memoria viva del proyecto. Antes de construir nuevas piezas, lee estos documentos para entender el estado real de Guibay, las decisiones tomadas y el orden recomendado de trabajo.

## Orden de lectura

1. `PROJECT_STATUS.md`: estado actual, qué ya existe y qué está pendiente.
2. `TECHNICAL_MAP.md`: mapa técnico de stack, rutas, APIs y modelo de datos.
3. `ROADMAP.md`: fases de construcción del producto.
4. `NEXT_TASKS.md`: tareas accionables priorizadas.
5. `DECISIONS.md`: registro de decisiones técnicas y de producto.

## Regla de uso

- Actualizar esta carpeta cuando cambie una ruta, API, modelo Prisma, flujo importante, estado de deploy o prioridad del roadmap.
- No guardar secretos, tokens, passwords ni valores reales de `.env.local`.
- Preferir estado comprobado desde el repo sobre memoria o suposiciones.
- Si hay conflicto entre documentación vieja y código actual, corregir primero este contexto o dejar la discrepancia anotada.

## Foto rápida

Guibay es un constructor de micrositios tipo "link en bio" para negocios, emprendedores y creadores de contenido en Latinoamérica.

El MVP actual incluye una base Next.js con Prisma, NextAuth, Supabase/PostgreSQL, landing, pantallas de login/registro, dashboard, APIs de microsites/templates y render público por slug. Las próximas piezas críticas son hacer funcionales los formularios de auth, crear el flujo de onboarding/editor y completar deploy productivo con variables reales en Vercel.
