import { Injectable, signal } from '@angular/core';

export interface Toast {
  id: number;
  message: string;
  type: 'success' | 'info' | 'warning' | 'error';
}

@Injectable({
  providedIn: 'root'
})
export class ToastService {
  private nextId = 0;
  toasts = signal<Toast[]>([]);

  show(message: string, type: 'success' | 'info' | 'warning' | 'error' = 'success', duration = 3000) {
    const id = this.nextId++;
    const toast: Toast = { id, message, type };
    this.toasts.update(current => [...current, toast]);

    setTimeout(() => {
      this.remove(id);
    }, duration);
  }

  success(message: string, duration = 3000) {
    this.show(message, 'success', duration);
  }

  info(message: string, duration = 3000) {
    this.show(message, 'info', duration);
  }

  error(message: string, duration = 3000) {
    this.show(message, 'error', duration);
  }

  remove(id: number) {
    this.toasts.update(current => current.filter(t => t.id !== id));
  }
}
