# InputField (`<app-input-field>`)

Componente reutilizable de campo de entrada de texto nativo de formulario con soporte para Signal Two-Way Binding (`[(value)]`), validaciones, mensajes de ayuda, estados de error y carga.

---

## 📦 Importación

```typescript
import { InputField } from './shared/components/input-field/input-field';

@Component({
  // ...
  imports: [InputField],
})
export class TuComponente {
  readonly email = signal('');
}
```

---

## ⚙️ Entradas (`Inputs`), Modelos (`Model`) y Salidas (`Outputs`)

### Entradas (`Inputs`)
| Propiedad | Tipo | Requerido | Valor por defecto | Descripción |
| :--- | :--- | :--- | :--- | :--- |
| `inputId` | `string` | **Sí** | - | ID HTML único para asociar `<label>` y mensajes ARIA. |
| `label` | `string` | **Sí** | - | Etiqueta visible del campo. |
| `type` | `'text' \| 'email' \| 'password' \| 'tel' \| 'url' \| 'search' \| 'number' \| 'date'` | No | `'text'` | Tipo de input nativo HTML. |
| `placeholder` | `string \| undefined` | No | `undefined` | Texto de sugerencia preliminar. |
| `helperText` | `string \| undefined` | No | `undefined` | Texto de ayuda inferior. |
| `error` | `string \| undefined` | No | `undefined` | Mensaje de error (resalta el borde en rojo). |
| `disabled` | `boolean` | No | `false` | Deshabilita la edición. |
| `readonly` | `boolean` | No | `false` | Campo de solo lectura. |
| `required` | `boolean` | No | `false` | Muestra el indicador de obligatorio (`*`). |
| `loading` | `boolean` | No | `false` | Muestra un indicador de carga interno. |
| `minLength` | `number \| undefined` | No | `undefined` | Longitud mínima de caracteres. |
| `maxLength` | `number \| undefined` | No | `undefined` | Longitud máxima de caracteres. |

### Modelo Dos Vías (`Model`)
| Propiedad | Tipo | Descripción |
| :--- | :--- | :--- |
| `[(value)]` | `string` | Signal con binding bidireccional para el contenido ingresado. |

### Salidas (`Outputs`)
| Evento | Tipo | Descripción |
| :--- | :--- | :--- |
| `focused` | `FocusEvent` | Se emite cuando el campo recibe el foco. |
| `blurred` | `FocusEvent` | Se emite cuando el campo pierde el foco. |

---

## 💻 Ejemplos de Uso

### 1. Campo de Texto Básico con Two-Way Binding
```html
<app-input-field
  inputId="nombre-usuario"
  label="Nombre completo"
  placeholder="Ej. Juan Pérez"
  [(value)]="nombreUsuario"
/>
```

### 2. Campo de Correo con Validación y Error
```html
<app-input-field
  inputId="email"
  label="Correo electrónico"
  type="email"
  [required]="true"
  [(value)]="email"
  [error]="emailInvalido() ? 'Ingresa un correo electrónico válido' : undefined"
  helperText="Te enviaremos un correo de confirmación."
/>
```

### 3. Campo de Contraseña Deshabilitado o en Carga
```html
<app-input-field
  inputId="password"
  label="Contraseña"
  type="password"
  [(value)]="password"
  [loading]="isChecking()"
/>
```
