# Alert (`<app-alert>`)

Componente para mostrar mensajes de alerta o notificaciones de estado (información, éxito, advertencia o error) con soporte para título, descripción proyectada y cierre opcional.

---

## 📦 Importación

```typescript
import { Alert } from './shared/components/alert/alert';

@Component({
  // ...
  imports: [Alert],
})
export class TuComponente {}
```

---

## ⚙️ Entradas (`Inputs`) y Salidas (`Outputs`)

### Entradas (`Inputs`)
| Propiedad | Tipo | Valor por defecto | Descripción |
| :--- | :--- | :--- | :--- |
| `variant` | `'neutral' \| 'info' \| 'success' \| 'warning' \| 'error'` | `'neutral'` | Esquema visual y nivel de severidad de la alerta. |
| `title` | `string \| undefined` | `undefined` | Título o encabezado destacado de la alerta. |
| `dismissible` | `boolean` | `false` | Muestra un botón de cierre en la esquina superior derecha. |

### Salidas (`Outputs`)
| Salida | Tipo | Descripción |
| :--- | :--- | :--- |
| `dismissed` | `void` | Evento emitido al hacer clic en el botón de cerrar la alerta. |

---

## 🎨 Variantes

- `neutral`: Contenedor sutil para información general.
- `info`: Mensaje informativo del sistema.
- `success`: Confirmación de acciones realizadas con éxito.
- `warning`: Advertencia sobre posibles inconvenientes.
- `error`: Error crítico de sistema (`role="alert"` dinámico).

---

## 💻 Ejemplos de Uso

### 1. Alerta Informativa Básica
```html
<app-alert variant="info" title="Información del sistema">
  El mantenimiento programado se realizará hoy a las 11:00 PM.
</app-alert>
```

### 2. Alerta de Éxito Cerrable (`dismissible`)
```html
<app-alert
  variant="success"
  title="Guardado Correctamente"
  [dismissible]="true"
  (dismissed)="onAlertClosed()"
>
  Tus preferencias de perfil se han actualizado.
</app-alert>
```

### 3. Alerta de Error
```html
<app-alert variant="error" title="Error de autenticación">
  Las credenciales ingresadas son incorrectas.
</app-alert>
```
