import { Injectable, inject, signal } from '@angular/core';
import { forkJoin } from 'rxjs';

import { ProductApiService } from '../../../data/services/product-api.service';
import { ProjectApiService } from '../../../data/services/project-api.service';
import { QuoteApiService } from '../../../data/services/quote-api.service';
import { ServiceApiService } from '../../../data/services/service-api.service';
import { ProductPublicationStatus } from '../../../data/models/product/product-publication-status.enum';
import { QuoteStatus } from '../../../data/models/quote/quote-status.enum';
import { QuoteResponse } from '../../../data/models/quote/quote-response.model';

@Injectable()
export class AdminDashboardFacade {
  private readonly productApi = inject(ProductApiService);
  private readonly projectApi = inject(ProjectApiService);
  private readonly quoteApi = inject(QuoteApiService);
  private readonly serviceApi = inject(ServiceApiService);

  readonly loading = signal(true);
  readonly error = signal<string | null>(null);

  private readonly _publishedProducts = signal(0);
  private readonly _activeProjects = signal(0);
  private readonly _pendingQuotes = signal(0);
  private readonly _activeServices = signal(0);
  private readonly _recentQuotes = signal<QuoteResponse[]>([]);

  readonly publishedProducts = this._publishedProducts.asReadonly();
  readonly activeProjects = this._activeProjects.asReadonly();
  readonly pendingQuotes = this._pendingQuotes.asReadonly();
  readonly activeServices = this._activeServices.asReadonly();
  readonly recentQuotes = this._recentQuotes.asReadonly();

  load(): void {
    this.loading.set(true);
    this.error.set(null);

    forkJoin({
      products: this.productApi.getAll(),
      projects: this.projectApi.getAll(),
      quotes: this.quoteApi.getAll(),
      services: this.serviceApi.getAll(),
    }).subscribe({
      next: ({ products, projects, quotes, services }) => {
        this._publishedProducts.set(
          products.filter((p) => p.estado === ProductPublicationStatus.PUBLICADO).length,
        );
        this._activeProjects.set(projects.filter((p) => p.activo === true).length);
        this._pendingQuotes.set(quotes.filter((q) => q.estado === QuoteStatus.NUEVA).length);
        this._activeServices.set(services.filter((s) => s.activo === true).length);

        const sorted = [...quotes].sort((a, b) => {
          const dateA = a.fechaCreacion ? new Date(a.fechaCreacion).getTime() : 0;
          const dateB = b.fechaCreacion ? new Date(b.fechaCreacion).getTime() : 0;
          return dateB - dateA;
        });
        this._recentQuotes.set(sorted.slice(0, 5));
        this.loading.set(false);
      },
      error: () => {
        this.error.set(
          'No se pudo cargar la información del panel. Comprueba la conexión con el servidor.',
        );
        this.loading.set(false);
      },
    });
  }
}
