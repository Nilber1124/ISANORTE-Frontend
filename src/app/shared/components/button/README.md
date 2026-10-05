# Button (`<app-button>`)

Componente de botón reutilizable con soporte para variadas expresiones visuales, tamaños, estados (`loading`, `disabled`) y renderizado flexible como botón nativo `<button>` o enlace `<a>`.

---

## 📦 Importación

```typescript
import { Button } from './shared/components/button/button';

@Component({
  // ...
  imports: [Button],
})
export class TuComponente {}
```

---

## ⚙️ Entradas (`Inputs`)

| Propiedad | Tipo | Valor por defecto | Descripción |
| :--- | :--- | :--- | :--- |
| `variant` | `'primary' \| 'secondary' \| 'accent' \| 'ghost'` | `'primary'` | Estilo visual y esquema de color. |
| `size` | `'small' \| 'medium' \| 'large'` | `'medium'` | Tamaño y dimensiones del botón. |
| `type` | `'button' \| 'submit' \| 'reset'` | `'button'` | Tipo de botón nativo HTML. |
| `href` | `string \| undefined` | `undefined` | Si se provee, renderiza una etiqueta `<a>` en lugar de `<button>`. |
| `target` | `'_self' \| '_blank' \| undefined` | `undefined` | Destino del enlace (`target`) cuando `href` está definido. |
| `ariaLabel` | `string \| undefined` | `undefined` | Accesibilidad para lectores de pantalla. |
| `disabled` | `boolean` | `false` | Deshabilita el botón e impide clics. |
| `loading` | `boolean` | `false` | Muestra spinner de carga y deshabilita interacción. |

---

## 🎨 Variantes y Tamaños

### Variantes (`variant`)
- `primary`: Botón de acción principal.
- `secondary`: Botón secundario con borde sutil.
- `accent`: Acciones de alto contraste / acento.
- `ghost`: Sin fondo ni bordes, para acciones terciarias o barras de herramientas.

### Tamaños (`size`)
- `small`: Compacto (altura min 40px).
- `medium`: Estándar (altura min 44px).
- `large`: Grande/Destacado (altura min 48px).

---

## 💻 Ejemplos de Uso

### 1. Botón Básico
```html
<app-button (click)="onSave()">
  Guardar
</app-button>
```

### 2. Con Variantes y Tamaños
```html
<app-button variant="secondary" size="small">
  Cancelar
</app-button>

<app-button variant="accent" size="large">
  Comprar Ahora
</app-button>
```

### 3. Estado de Carga
```html
<app-button variant="primary" [loading]="isSubmitting()">
  Enviando...
</app-button>
```

### 4. Como Enlace (`<a>`)
```html
<app-button href="https://ejemplo.com" target="_blank" variant="ghost">
  Visitar sitio web
</app-button>
```
