---
name: frontend-review
description: Audit an ISANORTE frontend change before completion. Use for code review, regression checks, pre-handoff validation, or after significant Angular, UI, API, animation, routing, or architecture work.
---

# Frontend Review

## Cuándo utilizarla

Úsala al revisar una implementación, antes de entregar un cambio significativo o cuando se solicite una auditoría de arquitectura, Angular, UI, accesibilidad, API, SSR o rendimiento.

## Objetivo

Detectar regresiones y desviaciones del proyecto con evidencia concreta, y confirmar que TypeScript, SSR, prerender e hidratación siguen compilando.

## Procedimiento

1. Lee `AGENTS.md`, el diff y los archivos consumidores, no solo el archivo editado.
2. Define el alcance y separa cambios del agente de cambios preexistentes del usuario.
3. Revisa arquitectura:
   - archivo en capa correcta;
   - componente sin HTTP;
   - facade sin HTML ni decisiones visuales;
   - ApiService sin lógica de pantalla;
   - sin abstracciones o directorios vacíos innecesarios.
4. Revisa Angular:
   - tipado/nulabilidad;
   - Signals y `computed()` sin duplicar estado;
   - `OnPush` cuando corresponda;
   - imports, cleanup y código muerto;
   - ausencia de `any` evitable y `subscribe()` dispersos.
5. Revisa UI y Design System en light/dark, móvil/tablet/escritorio, incluidos loading, error, empty y disabled.
6. Revisa accesibilidad: headings, landmarks, labels, alt, teclado, foco, contraste, anuncios de estado y reduced motion.
7. Si hay API, coteja endpoint, DTO, enum, UUID, null, acceso y códigos 400/404/409 con `docs/openapi.yaml`.
8. Revisa SSR: browser APIs protegidas, HTML significativo, hidratación estable, recursos limpiados y rutas prerenderizadas.
9. Revisa rendimiento: dimensiones/formato/lazy loading de imágenes, dependencias, trabajo en scroll, renders y solicitudes repetidas.
10. Busca referencias obsoletas o errores de nomenclatura relevantes con `rg`; presta especial atención a `isadecord` frente a `isadecor`.
11. Ejecuta verificaciones proporcionales:
   - `git diff --check`;
   - `npm run build` para cambios significativos;
   - `npm test -- --watch=false` cuando existan tests relevantes configurados.
12. Informa hallazgos por severidad y con ruta/línea. Si la tarea es solo revisión, no modifiques código sin autorización.

## Reglas

- Priorizar bugs, regresiones, seguridad de contrato y pruebas faltantes sobre preferencias estilísticas.
- No aprobar una integración basándose en endpoints o enums supuestos.
- No considerar que `x-access-intent: ADMIN` implementa autenticación; el OpenAPI actual declara security no implementada.
- No tratar placeholders como funcionalidades completas ni exigir contenido inventado para llenarlos.
- No crear tests artificiales solo para aumentar cobertura; probar comportamiento y contratos relevantes.
- No ignorar warnings de SSR/prerender aunque el bundle browser compile.
- No cambiar tokens, rutas o arquitectura durante una revisión salvo que también se haya pedido corregir.
- Si no se puede ejecutar una verificación, indicar el comando, la causa y el riesgo pendiente.
- Distinguir claramente un hallazgo confirmado de una recomendación o incertidumbre.

## Checklist final

- [ ] El diff fue revisado junto con consumidores y estado previo.
- [ ] Arquitectura y responsabilidades respetan AGENTS.md.
- [ ] Tipos, Signals, OnPush, imports y cleanup son correctos.
- [ ] UI, responsive, temas y estados fueron comprobados.
- [ ] Accesibilidad y reduced motion fueron comprobados.
- [ ] Toda integración coincide con el contrato real.
- [ ] SSR, prerender e hidratación no presentan regresiones.
- [ ] Rendimiento e imágenes no empeoraron sin justificación.
- [ ] `git diff --check` pasa.
- [ ] `npm run build` y tests pertinentes pasan, o sus limitaciones están documentadas.
