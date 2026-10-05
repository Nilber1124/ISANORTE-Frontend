# TextareaField (`<app-textarea-field>`)

Componente para campo de texto multilínea (`<textarea>`) con soporte para Two-Way Binding (`[(value)]`), control de filas, límites de caracteres, estado de error, ayuda y carga.

---

## 📦 Importación

```typescript
import { TextareaField } from './shared/components/textarea-field/textarea-field';

@Component({
  // ...
  imports: [TextareaField],
})
export class TuComponente {
  readonly comentarios = signal('');
}
```

---

## ⚙️ Entradas (`Inputs`), Modelos (`Model`) y Salidas (`Outputs`)

### Entradas (`Inputs`)
| Propiedad | Tipo | Requerido | Valor por defecto | Descripción |
| :--- | :--- | :--- | :--- | :--- |
| `inputId` | `string` | **Sí** | - | ID único HTML para vincular etiqueta y accesibilidad. |
| `label` | `string` | **Sí** | - | Etiqueta visible del campo. |
| `placeholder` | `string \| undefined` | No | `undefined` | Texto de sugerencia o instrucción. |
| `helperText` | `string \| undefined` | No | `undefined` | Texto aclaratorio inferior. |
| `error` | `string \| undefined` | No | `undefined` | Mensaje de error (resalta el área en rojo). |
| `rows` | `number` | No | `5` | Cantidad visible inicial de filas. |
| `maxLength` | `number \| undefined` | No | `undefined` | Límite máximo de caracteres permitidos. |
| `disabled` | `boolean` | No | `false` | Deshabilita la edición. |
| `readonly` | `boolean` | No | `false` | Campo de solo lectura. |
| `required` | `boolean` | No | `false` | Muestra el indicador de obligatorio (`*`). |
| `loading` | `boolean` | No | `false` | Muestra estado de carga. |

### Modelo Dos Vías (`Model`)
| Propiedad | Tipo | Descripción |
| :--- | :--- | :--- |
| `[(value)]` | `string` | Signal bidireccional con el texto ingresado. |

### Salidas (`Outputs`)
| Evento | Tipo | Descripción |
| :--- | :--- | :--- |
| `focused` | `FocusEvent` | Se emite cuando el área recibe el foco. |
| `blurred` | `FocusEvent` | Se emite cuando el área pierde el foco. |

---

## 💻 Ejemplos de Uso

### 1. Campo Multilínea Básico
```html
<app-textarea-field
  inputId="observaciones"
  label="Observaciones"
  placeholder="Escribe tus comentarios aquí..."
  [rows]="4"
  [(value)]="comentarios"
/>
```

### 2. Con Límite de Caracteres y Mensaje de Error
```html
<app-textarea-field
  inputId="mensaje-contacto"
  label="Mensaje de contacto"
  [required]="true"
  [maxLength]="500"
  [(value)]="mensaje"
  [error]="errorMensaje()"
  helperText="Máximo 500 caracteres."
/>
```
