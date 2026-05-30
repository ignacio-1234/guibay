# Decisiones técnicas y de producto

Última actualización: 2026-05-30

Este archivo registra decisiones que deben sobrevivir entre sesiones. Agregar nuevas entradas al inicio.

## 2026-05-30: cerrar primero el flujo MVP editable

Decisión: implementar registro, login, creación de micrositio, editor mínimo y publicación antes de add-ons, pagos o custom domains.

Motivo: es el ciclo principal que demuestra que Guibay funciona de punta a punta.

Impacto:

- El editor inicial cubre PROFILE, SOCIAL y LINKS.
- La página pública por slug se renderiza dinámicamente para reflejar cambios de publicación al momento.
- Las plantillas Pro se muestran bloqueadas para usuarios Free y también se protegen en backend al crear.

## 2026-05-30: crear carpeta `contex/`

Decisión: usar exactamente `contex/` como carpeta de contexto del proyecto.

Motivo: el usuario pidió ese nombre y quiere una memoria clara para saber por dónde va el proyecto y qué se debe construir.

Impacto:

- Futuras sesiones deben leer `contex/README.md` y `contex/PROJECT_STATUS.md` antes de construir.
- Esta carpeta no es runtime ni afecta el build.
- La documentación debe mantenerse en español y UTF-8.

## 2026-05-30: no guardar secretos en documentación

Decisión: esta carpeta puede mencionar nombres de variables, servicios y referencias públicas, pero no debe guardar passwords, tokens, secrets ni contenido real de `.env.local`.

Motivo: GitHub, Supabase y Vercel requieren credenciales sensibles. El contexto debe ayudar a operar sin filtrar secretos.

Impacto:

- Usar placeholders cuando sea necesario.
- Si se documenta deploy, hablar de qué variables existen, no de sus valores reales.

## 2026-05-30: priorizar flujo base antes de features Pro

Decisión: el próximo esfuerzo debe cerrar el flujo mínimo de usuario antes de add-ons, pagos o custom domains.

Motivo: actualmente hay base técnica y pantallas, pero faltan rutas y conexión funcional para que un usuario complete el ciclo principal.

Impacto:

- Primero auth funcional, `/dashboard/new`, editor mínimo y publicación.
- Después planes, pagos, storage, add-ons y dominios.

## 2026-05-30: tratar README/DEPLOY como documentación a revisar

Decisión: el estado fuente de verdad debe ser el código actual y este contexto, no ciegamente README/DEPLOY.

Motivo: README y algunos comentarios contienen datos desactualizados o texto con codificación rota. Ejemplo: README menciona Next.js 14, pero `package.json` usa Next.js 15.1.

Impacto:

- Antes de implementar, verificar package, rutas, schema y APIs.
- Actualizar README/DEPLOY cuando se estabilice el flujo base.
