# SelectField (`<app-select-field>`)

Componente de menú desplegable de selección (`<select>`) nativo con soporte para Two-Way Binding (`[(value)]`), lista de opciones estructuradas (`SelectOption`), mensajes de error, texto de ayuda y estados de carga.

---

## 📦 Importación

```typescript
import { SelectField, SelectOption } from './shared/components/select-field/select-field';

@Component({
  // ...
  imports: [SelectField],
})
export class TuComponente {
  readonly selectedValue = signal('');
  readonly opciones: SelectOption[] = [
    { value: 'pe', label: 'Perú' },
    { value: 'co', label: 'Colombia' },
    { value: 'cl', label: 'Chile' },
  ];
}
```

---

## ⚙️ Entradas (`Inputs`), Modelos (`Model`) y Salidas (`Outputs`)

### Entradas (`Inputs`)
| Propiedad | Tipo | Requerido | Valor por defecto | Descripción |
| :--- | :--- | :--- | :--- | :--- |
| `inputId` | `string` | **Sí** | - | ID único HTML para vincular etiqueta y accesibilidad. |
| `label` | `string` | **Sí** | - | Etiqueta visible del campo. |
| `options` | `readonly SelectOption[]` | **Sí** | - | Arreglo de opciones (`{ value, label, disabled? }`). |
| `placeholder` | `string \| undefined` | No | `undefined` | Texto de la opción por defecto sin seleccionar. |
| `helperText` | `string \| undefined` | No | `undefined` | Texto de ayuda o instrucción. |
| `error` | `string \| undefined` | No | `undefined` | Mensaje de error (resalta el campo en rojo). |
| `disabled` | `boolean` | No | `false` | Deshabilita la interacción. |
| `required` | `boolean` | No | `false` | Muestra indicador de campo obligatorio (`*`). |
| `loading` | `boolean` | No | `false` | Deshabilita el select y muestra estado de carga. |

### Modelo Dos Vías (`Model`)
| Propiedad | Tipo | Descripción |
| :--- | :--- | :--- |
| `[(value)]` | `string` | Signal bidireccional con el valor seleccionado (`value`). |

### Salidas (`Outputs`)
| Evento | Tipo | Descripción |
| :--- | :--- | :--- |
| `focused` | `FocusEvent` | Se emite cuando el campo recibe el foco. |
| `blurred` | `FocusEvent` | Se emite cuando el campo pierde el foco. |

---

## 💻 Ejemplos de Uso

### 1. Select Básico con Options y Placeholder
```html
<app-select-field
  inputId="select-pais"
  label="País de residencia"
  placeholder="Selecciona un país"
  [options]="opcionesPais"
  [(value)]="paisSeleccionado"
/>
```

### 2. Select Requerido con Validación de Error
```html
<app-select-field
  inputId="select-categoria"
  label="Categoría"
  [required]="true"
  [options]="categorias"
  [(value)]="categoriaId"
  [error]="categoriaError() ? 'Debe seleccionar una categoría' : undefined"
/>
```
