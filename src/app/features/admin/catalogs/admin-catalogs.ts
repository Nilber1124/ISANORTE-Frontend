import { ChangeDetectionStrategy, Component, afterNextRender, computed, inject } from '@angular/core';

import { CatalogoRequest } from '../../../data/models/business-unit/catalogo.model';
import { Alert } from '../../../shared/components/alert/alert';
import { Badge } from '../../../shared/components/badge/badge';
import { Button } from '../../../shared/components/button/button';
import { EmptyState } from '../../../shared/components/empty-state/empty-state';
import { Loading } from '../../../shared/components/loading/loading';
import { AdminBusinessUnitsFacade } from '../business-units/admin-business-units.facade';
import { AdminPageHeader } from '../shared/admin-page-header/admin-page-header';
import {
  DynamicChildManager,
  DynamicChildSave,
} from '../shared/dynamic-child-manager/dynamic-child-manager';

const ISADECOR_SLUG = 'isadecor';

/**
 * Catálogos PDF de ISADECOR: un acceso directo a la gestión que ya existe dentro de Unidades de negocio.
 * Muestra lo publicado y abre el mismo panel para agregar, reemplazar el PDF, reordenar, ocultar o eliminar.
 */
@Component({
  selector: 'app-admin-catalogs',
  imports: [AdminPageHeader, Alert, Badge, Button, DynamicChildManager, EmptyState, Loading],
  providers: [AdminBusinessUnitsFacade],
  templateUrl: './admin-catalogs.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AdminCatalogs {
  readonly facade = inject(AdminBusinessUnitsFacade);

  protected readonly unit = computed(
    () => this.facade.businessUnits().find((item) => item.slug === ISADECOR_SLUG) ?? null,
  );

  constructor() {
    afterNextRender(() => this.facade.load());
  }

  protected save(event: DynamicChildSave): void {
    this.facade.saveCatalogo(event.request as CatalogoRequest, event.id);
  }
}
