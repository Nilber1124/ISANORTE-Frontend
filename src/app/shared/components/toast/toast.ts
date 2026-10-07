import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { Toast, ToastService, ToastType } from '../../../core/services/toast.service';

@Component({
  selector: 'app-toast',
  templateUrl: './toast.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AppToast {
  readonly toastService = inject(ToastService);

  trackById(_index: number, toast: Toast): number {
    return toast.id;
  }

  toastClasses(type: ToastType): string {
    if (type === 'success') return 'bg-surface-elevated border-success/30 text-text-primary';
    if (type === 'error') return 'bg-surface-elevated border-error/30 text-text-primary';
    return 'bg-surface-elevated border-border text-text-primary';
  }
}
