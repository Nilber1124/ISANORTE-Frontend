import { ChangeDetectionStrategy, Component, afterNextRender, inject } from '@angular/core';
import { ContactRequestStatus } from '../../../data/models/contact/contact-request.model';
import { Alert } from '../../../shared/components/alert/alert';
import { Button } from '../../../shared/components/button/button';
import { EmptyState } from '../../../shared/components/empty-state/empty-state';
import { Loading } from '../../../shared/components/loading/loading';
import { Modal } from '../../../shared/components/modal/modal';
import { AdminContactFacade } from './admin-contact.facade';
@Component({
  selector: 'app-admin-contact',
  imports: [Alert, Button, EmptyState, Loading, Modal],
  templateUrl: './admin-contact.html',
  providers: [AdminContactFacade],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AdminContact {
  readonly facade = inject(AdminContactFacade);
  readonly statuses = Object.values(ContactRequestStatus);
  constructor() {
    afterNextRender(() => this.facade.load());
  }
  protected filterChanged(event: Event): void {
    const value = (event.target as HTMLSelectElement).value;
    this.facade.load(value ? (value as ContactRequestStatus) : null);
  }
  protected statusChanged(event: Event): void {
    this.facade.changeStatus((event.target as HTMLSelectElement).value as ContactRequestStatus);
  }
}
