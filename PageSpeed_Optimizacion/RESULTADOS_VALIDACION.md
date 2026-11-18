# Resultados de validación

## Evidencia PageSpeed de línea base

Informes guardados el 16 de noviembre de 2026:

| Dispositivo | Rendimiento | Accesibilidad | LCP | CLS | Transferencia |
|---|---:|---:|---:|---:|---:|
| Móvil | 72 | 92 | 13.3 s | 0.057 | 5,637 KiB |
| Escritorio | 85 | 92 | 2.4 s | 0.074 | 6,322 KiB |

La URL evaluada fue la web pública de producción. No se volvió a medir Lighthouse después de los cambios.

## Verificaciones ejecutadas

- `npm.cmd run build` — **aprobado**. Angular generó bundle browser inicial de 567.03 kB raw (135.85 kB estimados transferidos) y chunks diferidos. Emitió una advertencia de presupuesto de estilos: `isadecor/home.css` tiene 4.45 kB frente al máximo de 4.00 kB. La salida indica `Prerendered 0 static routes`, coherente con la configuración existente que sirve rutas en cliente.
- `npm.cmd test -- --watch=false` — **fallido**: 463 pruebas aprobadas y 22 fallidas de 485, en 9 archivos. Fallos observados en formularios de administración, `app.spec.ts`, servicios de anuncios, `app.routes.server.spec.ts`, layout público, layout admin y landing admin. No se atribuyen todos a estos cambios.
- Se actualizó el test existente que esperaba una importación estática del layout ISADECOR. La prueba enfocada `npm.cmd test -- --watch=false --include=src/app/app.spec.ts` confirmó esa nueva expectativa, pero el archivo terminó con 5 aprobadas y 2 fallidas por aserciones previas sobre admin: espera omitir la ruta `anuncios` y espera que `isadecor-landing` cargue `AdminIsadecorLanding` aunque la configuración actual conecta `AdminAnnouncements`.
- `git diff --check` — aprobado antes de crear los commits.
- Imágenes de fallback: 1,799,472 bytes en JPEG frente a 781,552 bytes en WebP, reducción de 1,017,920 bytes (56.6%) calculada localmente. Esto solo confirma tamaño de archivos.

## Verificaciones no realizadas

- No se ejecutó Lighthouse local en móvil ni escritorio: Lighthouse no está instalado como dependencia (`npm.cmd ls lighthouse --depth=0` devuelve vacío). No se descargó ni añadió una dependencia solo para producir una puntuación.
- No se hizo una revisión manual de navegador para formularios, navegación completa o tamaños responsive. El build y los tests existentes son la validación disponible en este entorno; el usuario hará su revisión manual antes de publicar.
- No se confirmó una puntuación PageSpeed posterior, LCP, CLS, tareas largas, contraste automático ni encabezados de caché.

## Ejecutar en modo producción local (PowerShell)

Desde la raíz del frontend:

```powershell
npm.cmd run build
$env:BACKEND_ORIGIN = 'https://isanorte-backend.onrender.com'
npm.cmd run serve:ssr:ISANORTE-FRONTEND
```

Abrir `http://localhost:4000/`. El servidor de producción requiere `BACKEND_ORIGIN` para renderizar contenido público. Para medir después, evaluar esa compilación con Lighthouse en perfiles móvil y escritorio, registrando LCP, CLS, bytes, elemento LCP y subpartes; no usar `ng serve` como referencia.
