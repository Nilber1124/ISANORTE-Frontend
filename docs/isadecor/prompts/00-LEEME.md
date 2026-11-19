> **Histórico.** Estos prompts se escribieron para delegar el trabajo a Antigravity con un diseño anterior del Home. Ya no describen lo implementado: ver `../ESTRUCTURA-HOME.md` y `../PLAN-BACKEND.md`.

# Prompts ISADECOR · solo la vista `/isadecor` (Home)

Orden de ejecución (un prompt por vez, verificar y volver a revisar antes de seguir):

| # | Archivo | Repo | Modelo sugerido |
|---|---|---|---|
| 1 | `01-backend-home.md` | ISANORTE-Backend | Sonnet/Opus (diseño de esquema y endpoint) |
| 2 | `02-datos-demo.md` | ISANORTE-Frontend (docs) | Gemini Flash (mecánico) |
| 3 | `03-imagenes.md` | local (skill ia-visual-local) | Flash / manual |
| 4 | `04-admin.md` | ISANORTE-Frontend | Flash o Sonnet |
| 5 | `05-frontend-home.md` | ISANORTE-Frontend | Sonnet/Opus (UI) |

## Contexto común (pegar al inicio de CADA prompt)

```
Proyecto ISANORTE (Cajamarca, Perú). ISADECOR es la unidad de negocio de acabados e interiores
(paneles WPC, pisos SPC, revestimientos, cielos rasos, mobiliario a medida). Se está rehaciendo SOLO
la vista pública /isadecor (Home). Las demás vistas (catálogo, ficha, carrito, cotización, checkout,
cuenta, comunidad) se harán después: no las modifiques salvo lo mínimo para que compilen.

Repos en ~/Documentos/Proyectos/ISANORTE/:
- ISANORTE-Backend: Spring Boot, JPA, Flyway. Lee su AGENTS.md (tests unitarios por clase nueva,
  README sincronizado) y docs/openapi.yaml.
- ISANORTE-Frontend: Angular 22 standalone + signals, Tailwind 4, SSR. Lee su AGENTS.md y
  docs/DESIGN_SYSTEM.md. Informe base: docs/isadecor/ANALISIS-HOME.md (léelo completo).

Decisiones tomadas:
- Modalidad de venta MIXTA: cada producto es "COMPRAR" (precio firme, carrito/checkout) o "COTIZAR"
  (precio referencial, flujo de cotización). El botón principal depende de ese campo.
- Nombre: solo "ISADECOR" (nunca "ISADECOR Import").
- Datos de demostración con imágenes generadas; se reemplazarán por reales vía admin.
- Redes: Instagram y TikTok (URLs de cuentas por definir: usar marcadores en redes_sociales).
- Esquema nuevo: una tabla por entidad, sin columnas "ubicacion" que mezclen cosas, admin genérico
  (como en ISANORTE: src/app/features/admin/site-content), esqueletos de carga con los conteos
  reales, sin datos ni imágenes locales salvo skeleton, textos fijos mínimos.
- Todo local: NO hagas commit ni push. No imprimas secretos del .env.

Entorno local: PostgreSQL localhost:5432, base isanorte_db, esquema isanorte_main. Backend :8080 con
SPRING_DATASOURCE_URL=...?currentSchema=isanorte_main, SPRING_FLYWAY_SCHEMAS=isanorte_main,
SPRING_FLYWAY_DEFAULT_SCHEMA=isanorte_main y el .env del backend; ./mvnw -o funciona.
Frontend: npm start (proxy a :8080) en :4200.

Reglas generales: no inventes endpoints ni campos fuera de lo que este prompt define; si falta algo,
dilo y detente. Al terminar, informa qué archivos cambiaste y rangos de líneas.
```

## Estructura objetivo del Home (referencia de todos los prompts)

1. Hero corto + buscador + 4 categorías (pared, piso, techo, mobiliario).
2. Franja de confianza (4 beneficios reales).
3. Productos: pestañas Destacados · Nuevos · Ofertas (8 tarjetas, precio, descuento, acción según modalidad).
4. Por ambiente (sala, cocina, baño, exterior): 4 imágenes que filtran el catálogo.
5. Calculadora de m² con un único CTA de cotizar.
6. Reseñas + 3-4 obras reales.
7. Cierre: cotización/WhatsApp + iconos Instagram y TikTok.

Fuera del Home (más adelante): `/isadecor/comunidad` con publicaciones de Instagram y TikTok.
