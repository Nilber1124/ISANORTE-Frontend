import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';

export type SectionTitleAlignment = 'left' | 'center';
export type SectionTitleLevel = 'h1' | 'h2' | 'h3';

@Component({
  selector: 'app-section-title',
  templateUrl: './section-title.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SectionTitle {
  readonly eyebrow = input<string | undefined>();
  readonly title = input.required<string>();
  readonly description = input<string | undefined>();
  readonly alignment = input<SectionTitleAlignment>('left');
  readonly level = input<SectionTitleLevel>('h2');

  protected readonly wrapperClasses = computed(() =>
    this.alignment() === 'center' ? 'mx-auto max-w-3xl text-center animate-fade-in-up' : 'max-w-3xl text-left animate-fade-in-up',
  );
}
