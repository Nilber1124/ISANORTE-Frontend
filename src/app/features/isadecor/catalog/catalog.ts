import {
  ChangeDetectionStrategy,
  Component,
  afterNextRender,
  computed,
  inject,
} from '@angular/core';

import { Alert } from '../../../shared/components/alert/alert';
import { Button } from '../../../shared/components/button/button';
import { EmptyState } from '../../../shared/components/empty-state/empty-state';
import { InputField } from '../../../shared/components/input-field/input-field';
import { Loading } from '../../../shared/components/loading/loading';
import { SectionTitle } from '../../../shared/components/section-title/section-title';
import { SelectField, SelectOption } from '../../../shared/components/select-field/select-field';
import { CatalogFacade } from './catalog.facade';
import { ProductCard } from './components/product-card/product-card';

@Component({
  selector: 'app-isadecor-catalog',
  imports: [Alert, Button, EmptyState, InputField, Loading, ProductCard, SectionTitle, SelectField],
  providers: [CatalogFacade],
  templateUrl: './catalog.html',
  styleUrl: './catalog.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Catalog {
  readonly facade = inject(CatalogFacade);

  readonly categoryOptions = computed<readonly SelectOption[]>(() => [
    { value: '', label: 'Todas las categorías' },
    ...this.facade.categories().map((category) => ({
      value: category.id,
      label: category.nombre,
    })),
  ]);

  constructor() {
    afterNextRender(() => this.facade.load());
  }
}
