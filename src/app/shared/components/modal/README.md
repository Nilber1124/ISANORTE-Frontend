# Modal (`<app-modal>`)

Componente de ventana modal/diálogo accesible con gestión de foco, trampeo de foco por teclado (Tab/Shift+Tab), tecla `Escape`, backdrop y slots para header, body y footer mediante `<ng-content>`.

---

## 📦 Importación

```typescript
import { Modal } from './shared/components/modal/modal';

@Component({
  // ...
  imports: [Modal],
})
export class TuComponente {
  readonly isModalOpen = signal(false);
}
```

---

## ⚙️ Entradas (`Inputs`), Modelos (`Model`) y Salidas (`Outputs`)

### Entradas (`Inputs`)
| Propiedad | Tipo | Requerido | Valor por defecto | Descripción |
| :--- | :--- | :--- | :--- | :--- |
| `modalId` | `string` | **Sí** | - | ID único para vinculación de títulos y ARIA. |
| `title` | `string` | **Sí** | - | Título principal de la ventana modal. |
| `description` | `string \| undefined` | No | `undefined` | Subtítulo o descripción opcional del modal. |
| `size` | `'small' \| 'medium' \| 'large'` | No | `'medium'` | Ancho máximo (`small`: 512px, `medium`: 672px, `large`: 896px). |
| `dismissible` | `boolean` | No | `true` | Habilita/deshabilita la opción de cerrar el modal. |
| `closeOnBackdrop` | `boolean` | No | `true` | Permite cerrar al hacer clic en el fondo semitransparente. |
| `closeOnEscape` | `boolean` | No | `true` | Permite cerrar al presionar la tecla `Escape`. |
| `loading` | `boolean` | No | `false` | Muestra indicador de carga y deshabilita acciones de cierre. |
| `showFooter` | `boolean` | No | `true` | Muestra u oculta la barra de acciones inferior. |

### Modelo Dos Vías (`Model`)
| Propiedad | Tipo | Descripción |
| :--- | :--- | :--- |
| `[(open)]` | `boolean` | Signal bidireccional que controla si el modal está abierto o cerrado. |

### Salidas (`Outputs`)
| Salida | Tipo | Descripción |
| :--- | :--- | :--- |
| `closed` | `'button' \| 'backdrop' \| 'escape'` | Emite la razón por la cual se cerró el modal. |

---

## 💻 Ejemplos de Uso

### 1. Modal Estándar con Confirmación
```html
<app-modal
  modalId="modal-eliminar"
  title="¿Desea eliminar este registro?"
  description="Esta acción no se puede deshacer."
  [(open)]="isModalOpen"
  (closed)="onModalClosed($event)"
>
  <!-- Contenido del cuerpo del modal (cuerpo principal) -->
  <p class="text-body-sm text-text-secondary">
    Se eliminarán todos los archivos asociados permanentemente.
  </p>

  <!-- Botones en el Footer del modal (proyectados en el footer) -->
  <div class="flex justify-end gap-3" modal-footer>
    <app-button variant="secondary" (click)="isModalOpen.set(false)">
      Cancelar
    </app-button>
    <app-button variant="accent" (click)="confirmarEliminacion()">
      Confirmar
    </app-button>
  </div>
</app-modal>
```
