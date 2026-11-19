# Prompt 5 · Frontend: nuevo Home `/isadecor`

> Pega primero el "Contexto común" de `00-LEEME.md`. Requiere los Prompts 1-3 (y 4 si se quiere editar contenido).
> Antes de diseñar usa las skills de diseño del repo (`impeccable`, `design-taste-frontend`) y `frontend-review` al final.

## Objetivo
Reescribir `src/app/features/isadecor/home/` desde cero (`home.ts`, `home.html`, `home.css`) consumiendo SOLO `GET /api/publico/sitios/{clave}/unidades/isadecor/home`. Borrar `isadecor-home-content.facade.ts` y todo dato estático.

## Arquitectura
Component → `IsadecorHomeFacade` (signals: `home`, `loading`, `error`, pestaña activa) → `IsadecorHomeApiService` en `data/services/` con modelos en `data/models/` que reflejan el contrato exacto. Sin `HttpClient` en componentes. SSR seguro: nada de browser APIs fuera de `afterNextRender`. 1 sola petición HTTP.

## Secciones (en este orden)
1. **Hero**: imagen del backend, titular, subtítulo, **buscador** (envía a `/isadecor/productos?q=`) y las 4 categorías destacadas debajo (enlazan a `?categoria=`). Un único CTA principal. La foto no se oscurece con degradados pesados: sólo lo necesario para contraste AA.
2. **Franja de confianza**: los beneficios (una línea, iconos).
3. **Productos** con pestañas Destacados · Nuevos · Ofertas (teclado y ARIA correctos). Tarjeta: imagen, nombre, precio, precio anterior y descuento, unidad de venta; botón según `modalidad`: "Agregar al carrito" (COMPRAR) o "Cotizar" (COTIZAR). Reutiliza `ProductCard` solo si no obliga a arrastrar su lógica; si no, crea una tarjeta del Home.
4. **Por ambiente**: 4 imágenes que enlazan al catálogo con el filtro correspondiente.
5. **Calculadora de m²**: alto × ancho + merma → m² y cajas/unidades estimadas; un solo CTA "Cotizar este proyecto". Cálculo en el cliente, sin backend.
6. **Reseñas y obras reales**: reseñas con estrellas y producto; 3-4 obras.
7. **Cierre**: WhatsApp/cotización + iconos Instagram y TikTok (de `redes`). Sin feed embebido ni scripts de terceros.

## Reglas de calidad
- Esqueletos de carga con el número real de elementos (`conteos`); sin imágenes ni textos locales salvo skeleton y textos fijos mínimos (títulos de sección).
- Una sola acción de cotizar por pantalla visible; sin banners redundantes.
- Móvil 375: buscador y categorías visibles sin scroll largo; alto total del Home notablemente menor que hoy (4 332 px escritorio, 6 453 px móvil).
- `home.css` dentro del presupuesto de 4 kB; preferir utilidades Tailwind.
- Contenido legible aunque GSAP falle; respeta `prefers-reduced-motion`. Imágenes con `width/height`, `loading="lazy"` salvo el hero (`fetchpriority="high"`), `alt` descriptivo.
- Un solo `<h1>`, jerarquía de encabezados correcta, foco visible, contraste AA.
- Nombre de marca: "ISADECOR". Corrige también el logo si dice "Import" (solo en el layout de ISADECOR si hace falta; informa qué tocaste).
- Estados: cargando, error con reintento, y secciones sin datos se ocultan (no cajas vacías).

## Verificación
1. `npm run build` y `npm test` sin errores (SSR y prerender incluidos).
2. Con el backend local y datos cargados, revisar `/isadecor` en 1440 y 375 con el navegador integrado; contar peticiones HTTP (esperado: 1 del Home + las del layout).
3. Informar alturas finales, peticiones y capturas.

## No hagas
Commit/push. No modifiques catálogo, ficha, carrito, cotización, checkout, cuenta ni `/isadecor/comunidad` (se harán después).
