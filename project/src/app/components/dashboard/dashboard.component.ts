import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { User } from '../../models/user.model';
import { CustomerDashboardComponent } from '../customer/customer-dashboard.component';
import { EmployeeDashboardComponent } from '../employee/employee-dashboard.component';
import { ManagerDashboardComponent } from '../manager/manager-dashboard.component';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    CommonModule, 
    CustomerDashboardComponent, 
    EmployeeDashboardComponent, 
    ManagerDashboardComponent
  ],
  template: `
    <div class="dashboard-layout">
      <!-- Navigation Bar -->
      <nav class="navbar">
        <div class="nav-brand">
          <h1>{{ getBankName() }}</h1>
        </div>
        <div class="nav-menu">
          <span class="welcome-text">Welcome, {{ getDisplayName() }}</span>
          <span class="role-badge">{{ getRoleDisplay() }}</span>
          <button class="btn btn-secondary" (click)="logout()">Logout</button>
        </div>
      </nav>

      <!-- Dashboard Content -->
      <div class="dashboard-content">
        <app-customer-dashboard *ngIf="currentUser?.role === 'CUSTOMER'"></app-customer-dashboard>
        <app-employee-dashboard *ngIf="currentUser?.role === 'EMPLOYEE'"></app-employee-dashboard>
        <app-manager-dashboard *ngIf="currentUser?.role === 'MANAGER'"></app-manager-dashboard>
      </div>
    </div>
  `,
  styles: [`
    .dashboard-layout {
      min-height: 100vh;
      background: linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%);
    }

    .navbar {
      background: white;
      box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
      padding: 1rem 2rem;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    .nav-brand h1 {
      color: #2563eb;
      font-size: 1.5rem;
      font-weight: bold;
      margin: 0;
    }

    .nav-menu {
      display: flex;
      align-items: center;
      gap: 1rem;
    }

    .welcome-text {
      font-weight: 600;
      color: #374151;
    }

    .role-badge {
      background-color: #3b82f6;
      color: white;
      padding: 0.25rem 0.75rem;
      border-radius: 1rem;
      font-size: 0.875rem;
      font-weight: 500;
      text-transform: capitalize;
    }

    .dashboard-content {
      padding: 2rem;
    }

    @media (max-width: 768px) {
      .navbar {
        padding: 1rem;
        flex-direction: column;
        gap: 1rem;
      }

      .nav-menu {
        flex-direction: column;
        gap: 0.5rem;
      }

      .dashboard-content {
        padding: 1rem;
      }
    }
  `]
})
export class DashboardComponent implements OnInit {
  currentUser: User | null = null;

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.authService.currentUser$.subscribe(user => {
      this.currentUser = user;
      if (!user) {
        this.router.navigate(['/login']);
      }
    });
  }

  getBankName(): string {
    return 'SecureBank';
  }

  getRoleDisplay(): string {
    if (!this.currentUser) return '';
    // Convert role to title case for display
    const role = this.currentUser.role.toLowerCase();
    return role.charAt(0).toUpperCase() + role.slice(1);
  }

  getDisplayName(): string {
    if (!this.currentUser) return '';
    return (
      (this.currentUser as any).firstName ||
      (this.currentUser as any).username ||
      (this.currentUser as any).ssn ||
      'User'
    );
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}