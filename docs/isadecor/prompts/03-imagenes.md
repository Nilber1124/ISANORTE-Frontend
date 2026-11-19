# Prompt 3 · Imágenes de demostración (generación local + Cloudinary)

> Pega primero el "Contexto común" de `00-LEEME.md`. Requiere `isadecor-demo-manifiesto.json` del Prompt 2.
> Cloudflare FLUX y Figma NO están disponibles. Usa la skill local `ia-visual-local` (ComfyUI, DreamShaper, rembg, Upscayl).

## Objetivo
Generar las imágenes del manifiesto y subirlas a Cloudinary, dejando las URLs en la base.

## Pasos
1. Lee `~/Documentos/Proyectos/ISANORTE/demo-cajamarca/imagenes.py` y `manifiesto.json` (así se hizo con ISANORTE) y reutiliza el script con un manifiesto de ISADECOR en una carpeta nueva `~/Documentos/Proyectos/ISANORTE/demo-isadecor/`.
2. Tipos de imagen:
   - **Productos** (~48): foto de producto sobre fondo blanco (rembg + composición), 1:1, 1200 px. Muestra textura clara de la madera, mármol o PVC.
   - **Ambientes** (4) y **obras** (4): interiores reales de sala, cocina, baño y exterior, 4:3, 1600 px.
   - **Hero** (1): interior luminoso, 16:9, 1920 px, sin texto ni logos, zona izquierda despejada para el titular.
   - **Categorías** (6): detalle de material, 4:3.
3. Sin texto, marcas ni personas con rostro. Mismo estilo de luz (cálida, natural) en todo el set.
4. Comprimir a WebP (calidad 80) y subir a Cloudinary en carpeta `isadecor/`. Credenciales del `.env` del backend (no imprimirlas). Guardar `url` por imagen en un JSON de resultado.
5. Generar `datos/isadecor-urls.sql` con los `UPDATE` que sustituyen las rutas convencionales por las URLs de Cloudinary. Cargarlo en la base local.

## Verificación
Cada URL responde 200; revisar visualmente una muestra por tipo; el Home muestra imágenes de verdad (esto se verifica en el Prompt 5).

## No hagas
Commit/push. No subas el `.env`. Si ComfyUI no está levantado, detente y avisa en vez de usar un servicio en la nube.
