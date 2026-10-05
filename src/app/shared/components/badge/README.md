# Badge (`<app-badge>`)

Componente de etiqueta o insignia pequeña utilizada para mostrar estados, categorías, recuentos o indicadores visuales.

---

## 📦 Importación

```typescript
import { Badge } from './shared/components/badge/badge';

@Component({
  // ...
  imports: [Badge],
})
export class TuComponente {}
```

---

## ⚙️ Entradas (`Inputs`)

| Propiedad | Tipo | Valor por defecto | Descripción |
| :--- | :--- | :--- | :--- |
| `variant` | `'neutral' \| 'accent' \| 'success' \| 'warning' \| 'error' \| 'info'` | `'neutral'` | Esquema de color e intención semántica. |
| `size` | `'small' \| 'medium'` | `'small'` | Tamaño del badge (Small: 24px, Medium: 28px). |
| `dot` | `boolean` | `false` | Si es `true`, muestra un pequeño punto circular de estado antes del texto. |
| `ariaLabel` | `string \| undefined` | `undefined` | Texto alternativo para accesibilidad en lectores de pantalla. |

---

## 🎨 Variantes y Tamaños

### Variantes (`variant`)
- `neutral`: Gris sutil para categorías neutras.
- `accent`: Destacado con color principal/acento.
- `success`: Verde para estados activos, completados o aprobados.
- `warning`: Amarillo/naranja para pendientes o advertencias.
- `error`: Rojo para inactivos, cancelados o con fallos.
- `info`: Azul para novedades o notificaciones.

---

## 💻 Ejemplos de Uso

### 1. Badge Estándar
```html
<app-badge variant="success">
  Activo
</app-badge>
```

### 2. Badge con Punto Indicador (`dot`)
```html
<app-badge variant="warning" [dot]="true">
  Pendiente de revisión
</app-badge>
```

### 3. Badge Tamaño Mediano
```html
<app-badge variant="accent" size="medium">
  Nuevo
</app-badge>
```
