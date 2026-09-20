import { ChangeDetectionStrategy, Component, afterNextRender, inject, signal } from '@angular/core';

import { ServiceResponse } from '../../../data/models/service/service-response.model';
import { Alert } from '../../../shared/components/alert/alert';
import { Badge } from '../../../shared/components/badge/badge';
import { Button } from '../../../shared/components/button/button';
import { EmptyState } from '../../../shared/components/empty-state/empty-state';
import { Loading } from '../../../shared/components/loading/loading';
import { Modal } from '../../../shared/components/modal/modal';
import { AdminServicesFacade } from './admin-services.facade';
import { ServiceForm, ServiceFormSubmission } from './components/service-form/service-form';
import { ServiceBenefitRequest } from '../../../data/models/service/service-benefit.model';
import {
  DynamicChildManager,
  DynamicChildSave,
} from '../shared/dynamic-child-manager/dynamic-child-manager';

@Component({
  selector: 'app-admin-services',
  imports: [Alert, Badge, Button, DynamicChildManager, EmptyState, Loading, Modal, ServiceForm],
  providers: [AdminServicesFacade],
  templateUrl: './admin-services.html',
  styleUrl: './admin-services.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AdminServices {
  readonly facade = inject(AdminServicesFacade);
  readonly serviceToDeactivate = signal<ServiceResponse | null>(null);

  constructor() {
    afterNextRender(() => this.facade.load());
  }

  protected save(submission: ServiceFormSubmission): void {
    if (submission.mode === 'create') {
      this.facade.create(submission.request);
      return;
    }
    this.facade.update(submission.request);
  }

  protected requestActiveChange(service: ServiceResponse): void {
    if (service.activo === true) {
      this.serviceToDeactivate.set(service);
      return;
    }
    this.facade.changeActive(service, true);
  }

  protected confirmDeactivation(): void {
    const service = this.serviceToDeactivate();
    if (service === null) return;
    this.facade.changeActive(service, false);
    this.serviceToDeactivate.set(null);
  }

  protected closeDeactivation(): void {
    if (this.facade.changingActiveId() !== null) return;
    this.serviceToDeactivate.set(null);
  }
  protected saveBenefit(event: DynamicChildSave): void {
    this.facade.saveBenefit(event.request as ServiceBenefitRequest, event.id);
  }
}
