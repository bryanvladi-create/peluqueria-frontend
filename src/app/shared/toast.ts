import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { ToastService } from '../core/toast.service';

@Component({
  selector: 'app-toast',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  styles: [`
    .stack { position: fixed; right: 20px; bottom: 20px; z-index: 3000; display: flex; flex-direction: column; gap: 10px; max-width: min(380px, calc(100vw - 40px)); }
    .toast { display: flex; gap: 12px; align-items: flex-start; padding: 12px 14px; border-radius: 10px; color: #fff; font-size: .9rem;
      background: #1f7a5a; box-shadow: 0 8px 24px rgba(0,0,0,.25); }
    .toast.error { background: #b3382f; }
    .toast p { flex: 1; line-height: 1.35; }
    .toast button { background: none; border: 0; color: inherit; cursor: pointer; font-size: 1.1rem; line-height: 1; opacity: .8; }
    .toast button:hover { opacity: 1; }
  `],
  template: `
    <div class="stack" role="status" aria-live="polite">
      @for (toast of toasts.toasts(); track toast.id) {
        <div class="toast" [class.error]="toast.type === 'error'">
          <p>{{ toast.message }}</p>
          <button type="button" aria-label="Cerrar aviso" (click)="toasts.dismiss(toast.id)">×</button>
        </div>
      }
    </div>`
})
export class ToastComponent {
  toasts = inject(ToastService);
}
