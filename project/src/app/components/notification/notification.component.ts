import { Component, OnInit } from '@angular/core';

import { CommonModule } from '@angular/common';
import { NotificationService, Notification } from '../../services/notification.service';

@Component({
  selector: 'app-notification',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="notification-container">
      <div *ngFor="let notification of notifications" 
           [class]="'notification ' + getNotificationClass(notification.type)"
           (click)="removeNotification(notification.id)">
        <div class="notification-content">
          <span class="notification-icon">{{ getIcon(notification.type) }}</span>
          <span class="notification-message">{{ notification.message }}</span>
          <button class="notification-close" (click)="removeNotification(notification.id)">×</button>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .notification-container {
      position: fixed;
      top: 2rem;
      right: 2rem;
      z-index: 1000;
      display: flex;
      flex-direction: column;
      gap: 1rem;
    }

    .notification {
      min-width: 350px;
      padding: 1rem;
      border-radius: 8px;
      box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
      animation: slideIn 0.3s ease-out;
      cursor: pointer;
    }

    .notification-success {
      background-color: #ecfdf5;
      color: #065f46;
      border-left: 4px solid #10b981;
    }

    .notification-error {
      background-color: #fef2f2;
      color: #991b1b;
      border-left: 4px solid #ef4444;
    }

    .notification-warning {
      background-color: #fffbeb;
      color: #92400e;
      border-left: 4px solid #f59e0b;
    }

    .notification-info {
      background-color: #eff6ff;
      color: #1e40af;
      border-left: 4px solid #3b82f6;
    }

    .notification-content {
      display: flex;
      align-items: center;
      gap: 0.75rem;
    }

    .notification-icon {
      font-size: 1.25rem;
      flex-shrink: 0;
    }

    .notification-message {
      flex: 1;
      font-weight: 500;
    }

    .notification-close {
      background: none;
      border: none;
      font-size: 1.5rem;
      cursor: pointer;
      opacity: 0.5;
      transition: opacity 0.2s;
    }

    .notification-close:hover {
      opacity: 1;
    }

    @keyframes slideIn {
      from {
        transform: translateX(100%);
        opacity: 0;
      }
      to {
        transform: translateX(0);
        opacity: 1;
      }
    }

    @media (max-width: 480px) {
      .notification-container {
        top: 1rem;
        right: 1rem;
        left: 1rem;
      }
      
      .notification {
        min-width: auto;
      }
    }
  `]
})
export class NotificationComponent implements OnInit {
  notifications: Notification[] = [];

  constructor(private notificationService: NotificationService) {}

  ngOnInit(): void {
    this.notificationService.notifications$.subscribe(
      notifications => this.notifications = notifications
    );
  }

  getNotificationClass(type: Notification['type']): string {
    return `notification-${type}`;
  }

  getIcon(type: Notification['type']): string {
    const icons = {
      success: '✓',
      error: '✕',
      warning: '⚠',
      info: 'ℹ'
    };
    return icons[type];
  }

  removeNotification(id: string): void {
    this.notificationService.removeNotification(id);
  }
}