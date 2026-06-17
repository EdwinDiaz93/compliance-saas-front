import { Injectable, signal } from '@angular/core';

export type NotificationType = 'error' | 'success' | 'warning';

export interface Notification {
  id: number;
  message: string;
  type: NotificationType;
}

// Cola de toasts renderizada por ToastComponent (montado una vez en app.html)
// El jwtInterceptor ya maneja errores 0 y 5xx — usar show() solo para feedback de dominio
@Injectable({ providedIn: 'root' })
export class NotificationService {
  notifications = signal<Notification[]>([]);
  private nextId = 0;

  // duration en ms, se auto-descarta al vencer
  show(message: string, type: NotificationType = 'error', duration = 4000) {
    const id = this.nextId++;
    this.notifications.update(n => [...n, { id, message, type }]);
    setTimeout(() => this.dismiss(id), duration);
  }

  dismiss(id: number) {
    this.notifications.update(n => n.filter(n => n.id !== id));
  }
}
