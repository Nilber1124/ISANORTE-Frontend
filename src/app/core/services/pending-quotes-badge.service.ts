import { Injectable, PLATFORM_ID, inject, signal } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { catchError, of } from 'rxjs';

import { QuoteApiService } from '../../data/services/quote-api.service';
import { QuoteStatus } from '../../data/models/quote/quote-status.enum';

@Injectable({ providedIn: 'root' })
export class PendingQuotesBadgeService {
  private readonly quoteApi = inject(QuoteApiService);
  private readonly platformId = inject(PLATFORM_ID);

  readonly pendingCount = signal(0);

  load(): void {
    if (!isPlatformBrowser(this.platformId)) return;
    this.quoteApi
      .getByStatus(QuoteStatus.NUEVA)
      .pipe(catchError(() => of([])))
      .subscribe((quotes) => this.pendingCount.set(quotes.length));
  }
}
