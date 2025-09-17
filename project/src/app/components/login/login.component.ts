import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { NotificationService } from '../../services/notification.service';
import { LoginRequest } from '../../models/user.model';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <div class="container">
      <div class="login-container">
        <div class="card">
          <div class="card-header text-center">
            <h1 class="text-2xl font-bold">Bank Login</h1>
            <p class="mt-2">Please select your role and enter your credentials</p>
          </div>
          
          <div class="card-body">
            <!-- Role Tabs -->
            <div class="tabs">
              <div class="tab" 
                   [class.active]="selectedRole === 'customer'"
                   (click)="selectRole('customer')">
                Customer
              </div>
              <div class="tab" 
                   [class.active]="selectedRole === 'employee'"
                   (click)="selectRole('employee')">
                Employee
              </div>
              <div class="tab" 
                   [class.active]="selectedRole === 'manager'"
                   (click)="selectRole('manager')">
                Manager
              </div>
            </div>

            <!-- Login Form -->
            <form [formGroup]="loginForm" (ngSubmit)="onLogin()">
              <div class="form-group">
                <label class="form-label">
                  {{ selectedRole === 'customer' ? 'SSN' : 'User ID (Email)' }}
                </label>
                <input 
                  type="text" 
                  class="form-control"
                  [class.error]="loginForm.get('identifier')?.invalid && loginForm.get('identifier')?.touched"
                  formControlName="identifier"
                  [placeholder]="selectedRole === 'customer' ? 'Enter your SSN' : 'Enter your email'"
                />
                <div class="error-message" 
                     *ngIf="loginForm.get('identifier')?.invalid && loginForm.get('identifier')?.touched">
                  This field is required
                </div>
              </div>

              <div class="form-group">
                <label class="form-label">Password</label>
                <input 
                  type="password" 
                  class="form-control"
                  [class.error]="loginForm.get('password')?.invalid && loginForm.get('password')?.touched"
                  formControlName="password"
                  placeholder="Enter your password"
                />
                <div class="error-message" 
                     *ngIf="loginForm.get('password')?.invalid && loginForm.get('password')?.touched">
                  Password is required
                </div>
                <div class="mt-1" *ngIf="selectedRole === 'employee' || selectedRole === 'manager'">
                  <small class="text-gray-600">
                    Password must be at least 10 characters with 1 uppercase, 1 number, and 1 special character
                  </small>
                </div>
              </div>

              <div class="form-group">
                <button 
                  type="submit" 
                  class="btn btn-primary w-full"
                  [disabled]="loginForm.invalid || isLoading"
                >
                  <span *ngIf="isLoading">Logging in...</span>
                  <span *ngIf="!isLoading">Login</span>
                </button>
              </div>
            </form>

            <!-- Customer Registration Link -->
            <div class="text-center mt-4" *ngIf="selectedRole === 'customer'">
              <p class="text-gray-600">
                Don't have an account? 
                <a routerLink="/register" class="text-blue-600 hover:underline font-semibold">
                  Register here
                </a>
              </p>
            </div>

            <!-- Demo Credentials -->
            <div class="demo-credentials">
              <h3 class="font-semibold mb-2">Demo Credentials:</h3>
              <div class="demo-item" *ngIf="selectedRole === 'customer'">
                <strong>Customer:</strong> SSN: 1234567, Password: password123
              </div>
              <div class="demo-item" *ngIf="selectedRole === 'employee'">
                <strong>Employee:</strong> Email: jane.smith@bank.com, Password: Employee@123
              </div>
              <div class="demo-item" *ngIf="selectedRole === 'manager'">
                <strong>Manager:</strong> Email: bob.johnson@bank.com, Password: Manager@456
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .login-container {
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 2rem 1rem;
    }

    .card {
      width: 100%;
      max-width: 480px;
    }

    .demo-credentials {
      margin-top: 2rem;
      padding: 1rem;
      background-color: #f8fafc;
      border-radius: 8px;
      border: 1px solid #e2e8f0;
    }

    .demo-item {
      margin-bottom: 0.5rem;
      font-size: 0.875rem;
      color: #475569;
    }

    .text-gray-600 {
      color: #4b5563;
    }

    .text-blue-600 {
      color: #2563eb;
    }

    .hover\\:underline:hover {
      text-decoration: underline;
    }
  `]
})
export class LoginComponent implements OnInit {
  loginForm: FormGroup;
  // UI role state (lowercase for display)
  selectedRole: 'customer' | 'employee' | 'manager' = 'customer';
  
  // Helper to convert UI role to backend role format
  private toBackendRole(role: 'customer' | 'employee' | 'manager'): 'CUSTOMER' | 'EMPLOYEE' | 'MANAGER' {
    const roleMap = {
      'customer': 'CUSTOMER',
      'employee': 'EMPLOYEE',
      'manager': 'MANAGER'
    } as const;
    
    return roleMap[role] || 'CUSTOMER'; // Default to CUSTOMER if role not found
  }
  isLoading = false;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private notificationService: NotificationService,
    private router: Router
  ) {
    this.loginForm = this.fb.group({
      identifier: ['', Validators.required],
      password: ['', Validators.required]
    });
  }

  ngOnInit(): void {
    // Redirect if already logged in
    if (this.authService.isAuthenticated()) {
      this.router.navigate(['/dashboard']);
    }
  }

  selectRole(role: 'customer' | 'employee' | 'manager'): void {
    this.selectedRole = role;
    this.loginForm.reset();
  }

  onLogin(): void {
    if (this.loginForm.valid) {
      this.isLoading = true;
      
      // Create the login request with the properly formatted role
      const loginRequest: LoginRequest = {
        identifier: this.loginForm.value.identifier,
        password: this.loginForm.value.password,
        role: this.toBackendRole(this.selectedRole)
      };

      this.authService.login(loginRequest).subscribe({
        next: (user) => {
          this.isLoading = false;
          this.notificationService.showSuccess(`Welcome back, ${user.firstName}!`);
          this.router.navigate(['/dashboard']);
        },
        error: (error) => {
          this.isLoading = false;
          this.notificationService.showError(error.message || 'Login failed. Please try again.');
        }
      });
    }
  }
}