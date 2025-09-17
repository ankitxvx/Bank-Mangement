import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet } from '@angular/router';
import { NotificationComponent } from './components/notification/notification.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterOutlet, NotificationComponent],
  template: `
    <app-notification></app-notification>
    <router-outlet></router-outlet>
  `
})
export class AppComponent {
  title = 'Angular Banking SPA';
}