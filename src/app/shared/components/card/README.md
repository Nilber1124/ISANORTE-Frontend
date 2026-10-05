# Card (`<app-card>`)

Componente contenedor versátil para agrupar contenido relacionado. Puede actuar como una tarjeta estática o como una tarjeta interactiva cliqueable/navegable cuando se pasa la propiedad `href`.

---

## 📦 Importación

```typescript
import { Card } from './shared/components/card/card';

@Component({
  // ...
  imports: [Card],
})
export class TuComponente {}
```

---

## ⚙️ Entradas (`Inputs`)

| Propiedad | Tipo | Valor por defecto | Descripción |
| :--- | :--- | :--- | :--- |
| `href` | `string \| undefined` | `undefined` | Si se proporciona, transforma la tarjeta en interactiva con animaciones `hover` y soporte de teclado/navegación. |
| `padding` | `'small' \| 'medium' \| 'large'` | `'medium'` | Espaciado interno de la tarjeta (small: `p-4`, medium: `p-6`, large: `p-6 md:p-8`). |
| `ariaLabel` | `string \| undefined` | `undefined` | Etiqueta ARIA para tarjetas interactivas (por defecto: `"Abrir detalle"`). |

---

## 💻 Ejemplos de Uso

### 1. Tarjeta Estática Básica
```html
<app-card padding="medium">
  <h3 class="text-title-sm font-semibold">Título del Contenido</h3>
  <p class="text-text-secondary mt-2">Descripción o información dentro de la tarjeta.</p>
</app-card>
```

### 2. Tarjeta Interactiva / Enlace (`href`)
```html
<app-card href="/servicios/detalle-1" padding="large" ariaLabel="Ver detalle del servicio">
  <h3 class="text-title-md font-semibold">Servicio de Asesoría</h3>
  <p class="text-text-secondary mt-2">Haz clic para consultar más detalles.</p>
</app-card>
```
