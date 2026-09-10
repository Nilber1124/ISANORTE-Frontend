# Loading (`<app-loading>`)

Componente de indicación de carga que admite dos variantes visuales (`spinner` o `dots`), varios tamaños y layouts (`block` o `inline`).

---

## 📦 Importación

```typescript
import { Loading } from './shared/components/loading/loading';

@Component({
  // ...
  imports: [Loading],
})
export class TuComponente {}
```

---

## ⚙️ Entradas (`Inputs`)

| Propiedad | Tipo | Valor por defecto | Descripción |
| :--- | :--- | :--- | :--- |
| `variant` | `'spinner' \| 'dots'` | `'spinner'` | Estilo de animación de carga (Giro circular o Puntos parpadeantes). |
| `size` | `'small' \| 'medium' \| 'large'` | `'medium'` | Tamaño de los elementos visuales. |
| `layout` | `'inline' \| 'block'` | `'block'` | Disposición (`block`: centrado con espacio min h-32; `inline`: alineado horizontalmente). |
| `label` | `string` | `'Cargando'` | Texto descriptivo de carga. |
| `showLabel` | `boolean` | `true` | Muestra u oculta el texto del `label`. |

---

## 💻 Ejemplos de Uso

### 1. Estado de Carga de Bloque (Sección / Contenido)
```html
<app-loading
  variant="spinner"
  size="large"
  label="Cargando datos del cliente..."
/>
```

### 2. Estado de Carga Inline (Para incluir junto a texto)
```html
<app-loading
  variant="dots"
  size="small"
  layout="inline"
  label="Sincronizando..."
/>
```

### 3. Solo Icono de Carga sin Texto
```html
<app-loading
  size="medium"
  [showLabel]="false"
/>
```
