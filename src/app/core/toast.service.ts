import { Injectable, signal } from '@angular/core';

export interface Toast { id: number; message: string; type: 'success' | 'error'; }

@Injectable({ providedIn: 'root' })
export class ToastService {
  readonly toasts = signal<Toast[]>([]);
  private nextId = 1;

  success(message: string) { this.push(message, 'success'); }
  error(message: string) { this.push(message, 'error'); }

  dismiss(id: number) { this.toasts.update((list) => list.filter((t) => t.id !== id)); }

  private push(message: string, type: Toast['type']) {
    const id = this.nextId++;
    this.toasts.update((list) => [...list, { id, message, type }]);
    setTimeout(() => this.dismiss(id), type === 'error' ? 6000 : 3500);
  }
}
