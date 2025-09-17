import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

export interface Notification {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  message: string;
  timestamp: Date;
}

@Injectable({
  providedIn: 'root'
})
export class NotificationService {
  private notificationsSubject = new BehaviorSubject<Notification[]>([]);
  public notifications$ = this.notificationsSubject.asObservable();

  showSuccess(message: string): void {
    this.addNotification('success', message);
  }

  showError(message: string): void {
    this.addNotification('error', message);
  }

  showWarning(message: string): void {
    this.addNotification('warning', message);
  }

  showInfo(message: string): void {
    this.addNotification('info', message);
  }

  private addNotification(type: Notification['type'], message: string): void {
    const notification: Notification = {
      id: Date.now().toString(),
      type,
      message,
      timestamp: new Date()
    };

    const currentNotifications = this.notificationsSubject.value;
    this.notificationsSubject.next([notification, ...currentNotifications]);

    // Auto remove after 5 seconds
    setTimeout(() => {
      this.removeNotification(notification.id);
    }, 5000);
  }

  removeNotification(id: string): void {
    const currentNotifications = this.notificationsSubject.value;
    const filteredNotifications = currentNotifications.filter(n => n.id !== id);
    this.notificationsSubject.next(filteredNotifications);
  }

  clearAll(): void {
    this.notificationsSubject.next([]);
  }
}