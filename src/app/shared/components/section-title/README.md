# SectionTitle (`<app-section-title>`)

Componente para encabezados de sección normalizados con soporte para `eyebrow` (sub-antetítulo), título principal, descripción secundaria, alineación y nivel semántico de encabezado (`h1`, `h2`, `h3`).

---

## 📦 Importación

```typescript
import { SectionTitle } from './shared/components/section-title/section-title';

@Component({
  // ...
  imports: [SectionTitle],
})
export class TuComponente {}
```

---

## ⚙️ Entradas (`Inputs`)

| Propiedad | Tipo | Requerido | Valor por defecto | Descripción |
| :--- | :--- | :--- | :--- | :--- |
| `eyebrow` | `string \| undefined` | No | `undefined` | Texto pequeño en mayúsculas ubicado sobre el título. |
| `title` | `string` | **Sí** | - | Texto del título principal. |
| `description` | `string \| undefined` | No | `undefined` | Texto explicativo o subtítulo secundario. |
| `alignment` | `'left' \| 'center'` | No | `'left'` | Alineación del texto (Izquierda o Centrado). |
| `level` | `'h1' \| 'h2' \| 'h3'` | No | `'h2'` | Etiqueta semántica de encabezado HTML a renderizar. |

---

## 💻 Ejemplos de Uso

### 1. Encabezado Estándar Alineado a la Izquierda (`h2`)
```html
<app-section-title
  eyebrow="Nuestros Servicios"
  title="Soluciones a tu Medida"
  description="Ofrecemos opciones adaptadas a los requerimientos de tu empresa."
/>
```

### 2. Encabezado Centrado Principal (`h1`)
```html
<app-section-title
  eyebrow="Bienvenido"
  title="Portal de Gestión ISANORTE"
  alignment="center"
  level="h1"
/>
```
