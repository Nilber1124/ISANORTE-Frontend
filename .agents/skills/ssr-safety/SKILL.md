---
name: ssr-safety
description: Protect Angular SSR, wildcard prerender, and client hydration in ISANORTE. Use whenever code touches browser globals, DOM APIs, storage, observers, viewport state, GSAP, client-only libraries, or server-rendered data.
---

# SSR Safety

## Cuándo utilizarla

Úsala al trabajar con `window`, `document`, `localStorage`, `sessionStorage`, `navigator`, GSAP, IntersectionObserver, ResizeObserver, DOM APIs, viewport, listeners o librerías exclusivas del navegador. También al cambiar carga de datos que participa en SSR.

## Objetivo

Conservar el SSR, el prerender wildcard y la hidratación actuales, manteniendo el contenido importante disponible en HTML y evitando divergencias entre servidor y cliente.

## Procedimiento

1. Revisa la configuración real antes de cambiarla:
   - `app.config.ts` usa `provideClientHydration()`;
   - `app.config.server.ts` usa `provideServerRendering(withRoutes(serverRoutes))`;
   - `app.routes.server.ts` prerenderiza `**`;
   - `main.server.ts` arranca Angular en servidor;
   - `server.ts` sirve con Express y `AngularNodeAppEngine`.
2. Localiza cada browser API, incluidos imports con side effects y código en inicializadores de campo.
3. Pregunta si el código necesita ejecutarse en servidor. Si no, muévelo a una frontera de browser explícita:
   - `afterNextRender()` para DOM/animación posterior al render;
   - `isPlatformBrowser()` para una rama que deba protegerse explícitamente;
   - inyección de `DOCUMENT` cuando sea apropiado, sin asumir `window.document`.
4. Evita importar en el nivel de módulo librerías que evalúen browser globals; usa import dinámico dentro de la frontera de browser cuando sea necesario.
5. Mantén el primer render determinista. No hagas depender el HTML inicial de viewport, storage, hora aleatoria o DOM medido solo en cliente.
6. Conserva contenido, enlaces, headings y acciones esenciales en SSR. Las mejoras visuales se aplican después.
7. Registra cleanup de listeners, observers, timelines, RAF y timers mediante el ciclo de vida Angular.
8. Para datos remotos, decide explícitamente si deben estar en SSR/prerender y evita duplicar solicitudes o cambiar el árbol inicial durante hidratación.
9. Ejecuta build y comprueba las rutas `/`, `/nosotros`, `/servicios`, `/proyectos`, `/contacto` y `/isadecor`.
10. Si la prueba local del servidor rechaza el host, considera que `angular.json` mantiene `security.allowedHosts: []`; no cambies seguridad incidentalmente, informa o modifica solo si la tarea lo autoriza.

## Reglas

- Nunca usar browser globals en nivel de módulo, constructor o inicialización que también ejecute el servidor.
- SSR no puede depender de que una animación, observer o tamaño de viewport esté disponible.
- No resolver una incompatibilidad marcando una feature completa como client-only si basta aislar el comportamiento interactivo.
- No ocultar contenido con estilos iniciales que solo GSAP puede revertir.
- Evitar diferencias de markup/orden entre servidor y primer render del cliente.
- No leer theme, preferencias o sesión de storage sin fallback estable para SSR.
- Proteger también librerías de terceros, no solo referencias escritas directamente a `window`.
- Toda suscripción o recurso browser de larga vida debe tener cleanup.
- Conservar el wildcard prerender salvo una decisión explícita respaldada por requisitos de rutas dinámicas.

## Checklist final

- [ ] Cada browser API está dentro de una frontera segura.
- [ ] No hay imports con side effects de browser durante SSR.
- [ ] El HTML importante existe en la salida del servidor.
- [ ] Servidor y cliente producen un árbol inicial compatible.
- [ ] Viewport, storage y DOM medido tienen fallback determinista.
- [ ] Listeners, observers, timelines, timers y RAF se limpian.
- [ ] La carga remota no se duplica ni causa parpadeo de hidratación.
- [ ] Todas las rutas públicas se prerenderizan correctamente.
- [ ] `npm run build` pasa.

