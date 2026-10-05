# EmptyState (`<app-empty-state>`)

Componente para mostrar una pantalla o sección vacía cuando no existen datos, resultados de búsqueda o registros disponibles. Soporta proyección de acciones secundarias o botones mediante `<ng-content>`.

---

## 📦 Importación

```typescript
import { EmptyState } from './shared/components/empty-state/empty-state';

@Component({
  // ...
  imports: [EmptyState],
})
export class TuComponente {}
```

---

## ⚙️ Entradas (`Inputs`)

| Propiedad | Tipo | Requerido | Valor por defecto | Descripción |
| :--- | :--- | :--- | :--- | :--- |
| `emptyStateId` | `string` | **Sí** | - | Identificador único para vincular títulos y descripciones con accesibilidad ARIA. |
| `title` | `string` | **Sí** | - | Título principal del estado vacío. |
| `description` | `string \| undefined` | No | `undefined` | Texto explicativo o secundario. |
| `compact` | `boolean` | No | `false` | Si es `true`, reduce el padding interno a un tamaño más pequeño. |

---

## 💻 Ejemplos de Uso

### 1. Estado Vacío Estándar con Botón de Acción
```html
<app-empty-state
  emptyStateId="sin-resultados"
  title="No se encontraron registros"
  description="Intenta modificar los filtros de búsqueda o agrega un nuevo elemento."
>
  <app-button variant="primary" (click)="crearRegistro()">
    Crear Nuevo Registro
  </app-button>
</app-empty-state>
```

### 2. Estado Vacío Compacto
```html
<app-empty-state
  emptyStateId="sin-comentarios"
  title="Sin comentarios aún"
  [compact]="true"
>
</app-empty-state>
```
