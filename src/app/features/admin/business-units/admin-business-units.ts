import { ChangeDetectionStrategy, Component, afterNextRender, inject, signal } from '@angular/core';

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

@Component({
  selector: 'app-admin-business-units',
  imports: [Alert, Badge, Button, BusinessUnitForm, EmptyState, Loading, Modal],
  providers: [AdminBusinessUnitsFacade],
  templateUrl: './admin-business-units.html',
  styleUrl: './admin-business-units.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AdminBusinessUnits {
  readonly facade = inject(AdminBusinessUnitsFacade);
  readonly businessUnitToDeactivate = signal<BusinessUnitResponse | null>(null);

  constructor() {
    afterNextRender(() => this.facade.load());
  }

  protected save(submission: BusinessUnitFormSubmission): void {
    if (submission.mode === 'create') this.facade.create(submission.request);
    else this.facade.update(submission.request);
  }

  protected requestActiveChange(businessUnit: BusinessUnitResponse): void {
    if (businessUnit.activo === true) this.businessUnitToDeactivate.set(businessUnit);
    else this.facade.changeActive(businessUnit, true);
  }

  protected confirmDeactivation(): void {
    const businessUnit = this.businessUnitToDeactivate();
    if (businessUnit === null) return;
    this.facade.changeActive(businessUnit, false);
    this.businessUnitToDeactivate.set(null);
  }

  protected closeDeactivation(): void {
    if (this.facade.changingActiveId() === null) this.businessUnitToDeactivate.set(null);
  }
}
