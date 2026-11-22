import { ChangeDetectionStrategy, Component, afterNextRender, computed, inject, signal } from '@angular/core';

import { BusinessUnitResponse } from '../../../data/models/business-unit/business-unit-response.model';
import { Alert } from '../../../shared/components/alert/alert';
import { Badge } from '../../../shared/components/badge/badge';
import { Button } from '../../../shared/components/button/button';
import { EmptyState } from '../../../shared/components/empty-state/empty-state';
import { Loading } from '../../../shared/components/loading/loading';
import { Modal } from '../../../shared/components/modal/modal';
import { AdminBusinessUnitsFacade } from './admin-business-units.facade';
import {
  BusinessUnitForm,
  BusinessUnitFormSubmission,
} from './components/business-unit-form/business-unit-form';
import { BusinessUnitResourceRequest } from '../../../data/models/business-unit/business-unit-resource.model';
import { CatalogoRequest } from '../../../data/models/business-unit/catalogo.model';
import {
  DynamicChildManager,
  DynamicChildSave,
} from '../shared/dynamic-child-manager/dynamic-child-manager';
import { AdminPageHeader } from '../shared/admin-page-header/admin-page-header';
import { InputField } from '../../../shared/components/input-field/input-field';

@Component({
  selector: 'app-admin-business-units',
  imports: [AdminPageHeader, 
    Alert,
    Badge,
    Button,
    BusinessUnitForm,
    DynamicChildManager,
    EmptyState,
    InputField,
    Loading,
    Modal,
  ],
  providers: [AdminBusinessUnitsFacade],
  templateUrl: './admin-business-units.html',
  styleUrl: './admin-business-units.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AdminBusinessUnits {
  readonly facade = inject(AdminBusinessUnitsFacade);
  readonly businessUnitToDeactivate = signal<BusinessUnitResponse | null>(null);
  /** Lo que se escribe para confirmar: desactivar una unidad apaga su tienda, así que exige su nombre. */
  readonly deactivationName = signal('');
  readonly deactivationNameMatches = computed(() => {
    const unit = this.businessUnitToDeactivate();
    return unit !== null && this.deactivationName().trim().toLowerCase() === unit.nombre.trim().toLowerCase();
  });

  constructor() {
    afterNextRender(() => this.facade.load());
  }

  protected save(submission: BusinessUnitFormSubmission): void {
    if (submission.mode === 'create') this.facade.create(submission.request);
    else this.facade.update(submission.request);
  }

  protected requestActiveChange(businessUnit: BusinessUnitResponse): void {
    if (businessUnit.activo === true) {
      this.deactivationName.set('');
      this.businessUnitToDeactivate.set(businessUnit);
    } else this.facade.changeActive(businessUnit, true);
  }

  protected confirmDeactivation(): void {
    const businessUnit = this.businessUnitToDeactivate();
    if (businessUnit === null || !this.deactivationNameMatches()) return;
    this.facade.changeActive(businessUnit, false);
    this.businessUnitToDeactivate.set(null);
  }

  protected closeDeactivation(): void {
    if (this.facade.changingActiveId() === null) this.businessUnitToDeactivate.set(null);
  }
  protected saveResource(event: DynamicChildSave): void {
    this.facade.saveResource(event.request as BusinessUnitResourceRequest, event.id);
  }

  protected saveCatalogo(event: DynamicChildSave): void {
    this.facade.saveCatalogo(event.request as CatalogoRequest, event.id);
  }
}
