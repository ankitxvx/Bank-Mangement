import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, AbstractControl } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { NotificationService } from '../../services/notification.service';
import { CustomerRegistration } from '../../models/user.model';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  template: `
    <div class="container">
      <div class="register-container">
        <div class="card">
          <div class="card-header text-center">
            <h1 class="text-2xl font-bold">Customer Registration</h1>
            <p class="mt-2">Create your banking account</p>
          </div>
          
          <div class="card-body">
            <form [formGroup]="registerForm" (ngSubmit)="onRegister()">
              <div class="grid grid-cols-2">
                <div class="form-group">
                  <label class="form-label">SSN *</label>
                  <input 
                    type="text" 
                    class="form-control"
                    [class.error]="registerForm.get('ssn')?.invalid && registerForm.get('ssn')?.touched"
                    formControlName="ssn"
                    placeholder="1234567"
                  />
                  <div class="error-message" 
                       *ngIf="registerForm.get('ssn')?.invalid && registerForm.get('ssn')?.touched">
                    <div *ngIf="registerForm.get('ssn')?.errors?.['required']">SSN is required</div>
                    <div *ngIf="registerForm.get('ssn')?.errors?.['pattern']">SSN must be 7 digits</div>
                  </div>
                </div>

                <div class="form-group">
                  <label class="form-label">Email *</label>
                  <input 
                    type="email" 
                    class="form-control"
                    [class.error]="registerForm.get('email')?.invalid && registerForm.get('email')?.touched"
                    formControlName="email"
                    placeholder="john@example.com"
                  />
                  <div class="error-message" 
                       *ngIf="registerForm.get('email')?.invalid && registerForm.get('email')?.touched">
                    <div *ngIf="registerForm.get('email')?.errors?.['required']">Email is required</div>
                    <div *ngIf="registerForm.get('email')?.errors?.['email']">Invalid email format</div>
                  </div>
                </div>
              </div>

              <div class="grid grid-cols-2">
                <div class="form-group">
                  <label class="form-label">First Name *</label>
                  <input 
                    type="text" 
                    class="form-control"
                    [class.error]="registerForm.get('firstName')?.invalid && registerForm.get('firstName')?.touched"
                    formControlName="firstName"
                    placeholder="John"
                  />
                  <div class="error-message" 
                       *ngIf="registerForm.get('firstName')?.invalid && registerForm.get('firstName')?.touched">
                    First name is required
                  </div>
                </div>

                <div class="form-group">
                  <label class="form-label">Last Name *</label>
                  <input 
                    type="text" 
                    class="form-control"
                    [class.error]="registerForm.get('lastName')?.invalid && registerForm.get('lastName')?.touched"
                    formControlName="lastName"
                    placeholder="Doe"
                  />
                  <div class="error-message" 
                       *ngIf="registerForm.get('lastName')?.invalid && registerForm.get('lastName')?.touched">
                    Last name is required
                  </div>
                </div>
              </div>

              <div class="grid grid-cols-2">
                <div class="form-group">
                  <label class="form-label">Password *</label>
                  <input 
                    type="password" 
                    class="form-control"
                    [class.error]="registerForm.get('password')?.invalid && registerForm.get('password')?.touched"
                    formControlName="password"
                    placeholder="Enter password"
                  />
                  <div class="error-message" 
                       *ngIf="registerForm.get('password')?.invalid && registerForm.get('password')?.touched">
                    <div *ngIf="registerForm.get('password')?.errors?.['required']">Password is required</div>
                    <div *ngIf="registerForm.get('password')?.errors?.['minlength']">Password must be at least 6 characters</div>
                  </div>
                </div>

                <div class="form-group">
                  <label class="form-label">Confirm Password *</label>
                  <input 
                    type="password" 
                    class="form-control"
                    [class.error]="registerForm.get('confirmPassword')?.invalid && registerForm.get('confirmPassword')?.touched"
                    formControlName="confirmPassword"
                    placeholder="Confirm password"
                  />
                  <div class="error-message" 
                       *ngIf="registerForm.get('confirmPassword')?.invalid && registerForm.get('confirmPassword')?.touched">
                    <div *ngIf="registerForm.get('confirmPassword')?.errors?.['required']">Confirm password is required</div>
                    <div *ngIf="registerForm.get('confirmPassword')?.errors?.['passwordMismatch']">Passwords do not match</div>
                  </div>
                </div>
              </div>

              <div class="form-group">
                <label class="form-label">Address *</label>
                <textarea 
                  class="form-control"
                  [class.error]="registerForm.get('address')?.invalid && registerForm.get('address')?.touched"
                  formControlName="address"
                  rows="3"
                  placeholder="Enter your full address"
                ></textarea>
                <div class="error-message" 
                     *ngIf="registerForm.get('address')?.invalid && registerForm.get('address')?.touched">
                  Address is required
                </div>
              </div>

              <div class="form-group">
                <label class="form-label">Contact Number *</label>
                <input 
                  type="tel" 
                  class="form-control"
                  [class.error]="registerForm.get('contactNo')?.invalid && registerForm.get('contactNo')?.touched"
                  formControlName="contactNo"
                  placeholder="9876543210"
                />
                <div class="error-message" 
                     *ngIf="registerForm.get('contactNo')?.invalid && registerForm.get('contactNo')?.touched">
                  <div *ngIf="registerForm.get('contactNo')?.errors?.['required']">Contact number is required</div>
                  <div *ngIf="registerForm.get('contactNo')?.errors?.['pattern']">Contact number must be 10 digits</div>
                </div>
              </div>

              <div class="form-group">
                <button 
                  type="submit" 
                  class="btn btn-primary w-full"
                  [disabled]="registerForm.invalid || isLoading"
                >
                  <span *ngIf="isLoading">Creating Account...</span>
                  <span *ngIf="!isLoading">Register</span>
                </button>
              </div>
            </form>

            <div class="text-center mt-4">
              <p class="text-gray-600">
                Already have an account? 
                <a routerLink="/login" class="text-blue-600 hover:underline font-semibold">
                  Login here
                </a>
              </p>
            </div>
          </div>
        </div>

        <!-- Success Card -->
        <div class="card mt-4" *ngIf="registrationSuccess && newCustomer">
          <div class="card-header">
            <h2 class="text-xl font-bold text-green-600">Registration Successful!</h2>
          </div>
          <div class="card-body">
            <div class="success-details">
              <p><strong>User ID:</strong> {{ newCustomer.id }}</p>
              <p><strong>Username:</strong> {{ newCustomer.username || newCustomer.ssn }}</p>
              <p><strong>Name:</strong> {{ newCustomer.firstName }} {{ newCustomer.lastName }}</p>
              <p><strong>Email:</strong> {{ newCustomer.email }}</p>
              <p><strong>Role:</strong> {{ newCustomer.role }}</p>
            </div>
            <div class="mt-4">
              <button class="btn btn-primary" (click)="goToLogin()">
                Proceed to Login
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .register-container {
      min-height: 100vh;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 2rem 1rem;
    }

    .card {
      width: 100%;
      max-width: 600px;
    }

    .success-details p {
      margin-bottom: 0.5rem;
      padding: 0.5rem;
      background-color: #f0fdf4;
      border-radius: 4px;
      border-left: 4px solid #22c55e;
    }

    .text-green-600 {
      color: #16a34a;
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

    @media (max-width: 768px) {
      .grid-cols-2 {
        grid-template-columns: 1fr;
      }
    }
  `]
})
export class RegisterComponent {
  registerForm: FormGroup;
  isLoading = false;
  registrationSuccess = false;
  newCustomer: any = null;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private notificationService: NotificationService,
    private router: Router
  ) {
    this.registerForm = this.fb.group({
  ssn: ['', [Validators.required, Validators.pattern(/^\d{7}$/)]],
      firstName: ['', Validators.required],
      lastName: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      confirmPassword: ['', Validators.required],
      address: ['', Validators.required],
      contactNo: ['', [Validators.required, Validators.pattern(/^\d{10}$/)]]
    }, { validators: this.passwordMatchValidator });
  }

  passwordMatchValidator(control: AbstractControl): {[key: string]: any} | null {
    const password = control.get('password');
    const confirmPassword = control.get('confirmPassword');

    if (!password || !confirmPassword) {
      return null;
    }

    const errors = { ...(confirmPassword.errors || {}) } as any;

    if (password.value !== confirmPassword.value) {
      errors['passwordMismatch'] = true;
      confirmPassword.setErrors(errors);
      return { passwordMismatch: true };
    } else {
      if ('passwordMismatch' in errors) {
        delete errors['passwordMismatch'];
        if (Object.keys(errors).length === 0) {
          confirmPassword.setErrors(null);
        } else {
          confirmPassword.setErrors(errors);
        }
      }
      return null;
    }
  }

  onRegister(): void {
    if (this.registerForm.valid) {
      this.isLoading = true;
      
      const registration: CustomerRegistration = this.registerForm.value;

      this.authService.register(registration).subscribe({
        next: (customer) => {
          this.isLoading = false;
          this.registrationSuccess = true;
          this.newCustomer = customer;
          this.notificationService.showSuccess('Registration successful! Your account has been created.');
          // Optionally, navigate to login after 1.5s
          setTimeout(() => this.goToLogin(), 1500);
        },
        error: (error) => {
          this.isLoading = false;
          this.notificationService.showError(error.message || 'Registration failed. Please try again.');
        }
      });
    }
  }

  goToLogin(): void {
    this.router.navigate(['/login']);
  }
}