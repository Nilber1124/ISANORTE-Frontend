import { ChangeDetectionStrategy, Component, afterNextRender, inject, signal } from '@angular/core';

import { CompanyResponse, SocialNetworkResponse } from '../../../data/models/company/company-response.model';
import { Alert } from '../../../shared/components/alert/alert';
import { Badge } from '../../../shared/components/badge/badge';
import { Button } from '../../../shared/components/button/button';
import { EmptyState } from '../../../shared/components/empty-state/empty-state';
import { Loading } from '../../../shared/components/loading/loading';
import { Modal } from '../../../shared/components/modal/modal';
import { AdminCompanyFacade } from './admin-company.facade';
import { CompanyForm, CompanyFormSubmission } from './components/company-form/company-form';
import { SocialNetworkForm, SocialNetworkFormSubmission } from './components/social-network-form/social-network-form';

@Component({
  selector: 'app-admin-company',
  imports: [Alert, Badge, Button, CompanyForm, EmptyState, Loading, Modal, SocialNetworkForm],
  providers: [AdminCompanyFacade],
  templateUrl: './admin-company.html',
  styleUrl: './admin-company.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AdminCompany {
  readonly facade = inject(AdminCompanyFacade);
  readonly networkToDelete = signal<SocialNetworkResponse | null>(null);

  constructor() {
    afterNextRender(() => this.facade.load());
  }

  protected saveCompany(submission: CompanyFormSubmission): void {
    if (submission.mode === 'create') this.facade.createCompany(submission.request);
    else this.facade.updateCompany(submission.request);
  }

  protected saveSocialNetwork(submission: SocialNetworkFormSubmission): void {
    if (this.facade.selectedSocialNetwork()) {
      this.facade.updateSocialNetwork(submission.request);
    } else {
      this.facade.createSocialNetwork(submission.request);
    }
  }

  protected requestDeleteNetwork(network: SocialNetworkResponse): void {
    this.networkToDelete.set(network);
  }

  protected confirmDeleteNetwork(): void {
    const network = this.networkToDelete();
    if (!network) return;
    this.facade.deleteSocialNetwork(network.id);
    this.networkToDelete.set(null);
  }

  protected closeDeleteNetwork(): void {
    if (this.facade.deletingSocialNetworkId() === null) {
      this.networkToDelete.set(null);
    }
  }

  protected get sortedNetworks(): SocialNetworkResponse[] {
    const company = this.facade.company();
    if (!company || !company.redesSociales) return [];
    return [...company.redesSociales].sort(
      (a, b) => (a.orden ?? Number.MAX_SAFE_INTEGER) - (b.orden ?? Number.MAX_SAFE_INTEGER) || a.nombre.localeCompare(b.nombre)
    );
  }
}
