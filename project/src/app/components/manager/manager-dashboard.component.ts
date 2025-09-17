import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { CustomerService } from '../../services/customer.service';
import { EmployeeService } from '../../services/employee.service';
import { NotificationService } from '../../services/notification.service';
import { Customer, Employee } from '../../models/user.model';

@Component({
  selector: 'app-manager-dashboard',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <div class="manager-dashboard">
      <div class="dashboard-header">
        <h2 class="text-2xl font-bold">Manager Dashboard</h2>
        <p class="text-gray-600">Comprehensive management of customers and employees</p>
      </div>

      <!-- Summary Cards -->
      <div class="grid grid-cols-4 mb-4">
        <div class="card stats-card">
          <div class="card-body text-center">
            <div class="stats-number">{{ totalCustomers }}</div>
            <div class="stats-label">Total Customers</div>
          </div>
        </div>
        
        <div class="card stats-card">
          <div class="card-body text-center">
            <div class="stats-number">{{ totalEmployees }}</div>
            <div class="stats-label">Total Employees</div>
          </div>
        </div>
        
        <div class="card stats-card">
          <div class="card-body text-center">
            <div class="stats-number">{{ totalBalance | number:'1.0-0' }}</div>
            <div class="stats-label">Total Balance (₹)</div>
          </div>
        </div>
        
        <div class="card stats-card">
          <div class="card-body text-center">
            <div class="stats-number">{{ activeCustomers }}</div>
            <div class="stats-label">Active Customers</div>
          </div>
        </div>
      </div>

      <!-- Tab Navigation -->
      <div class="tabs">
        <div class="tab" [class.active]="activeTab === 'customers'" (click)="setActiveTab('customers')">
          Customers
        </div>
        <div class="tab" [class.active]="activeTab === 'employees'" (click)="setActiveTab('employees')">
          Employees
        </div>
      </div>

      <!-- Customers Tab -->
      <div *ngIf="activeTab === 'customers'">
        <!-- Customer Action Cards -->
        <div class="grid grid-cols-4 mb-4">
          <div class="card action-card" (click)="showCustomerCreateForm()">
            <div class="card-body text-center">
              <div class="action-icon">➕</div>
              <h4>Register Customer</h4>
              <p>Create New Account</p>
            </div>
          </div>
          
          <div class="card action-card" (click)="loadCustomers()">
            <div class="card-body text-center">
              <div class="action-icon">👥</div>
              <h4>View Customers</h4>
              <p>See All Accounts</p>
            </div>
          </div>
          
          <div class="card action-card" (click)="showCustomerSearchForm()">
            <div class="card-body text-center">
              <div class="action-icon">🔍</div>
              <h4>Search Customer</h4>
              <p>Find by SSN</p>
            </div>
          </div>
          
          <div class="card action-card" (click)="refreshCustomerData()">
            <div class="card-body text-center">
              <div class="action-icon">🔄</div>
              <h4>Refresh</h4>
              <p>Update Data</p>
            </div>
          </div>
        </div>

        <!-- Customer List -->
        <div class="card" *ngIf="customers.length > 0 && !searchCustomerResult">
          <div class="card-header">
            <h3 class="text-xl font-semibold">Customers ({{ totalCustomers }})</h3>
          </div>
          <div class="card-body">
            <div class="grid grid-cols-2 customers-grid">
              <div class="customer-card" *ngFor="let customer of customers">
                <div class="customer-info">
                  <h4>{{ customer.firstName }} {{ customer.lastName }}</h4>
                  <p><strong>SSN:</strong> {{ customer.ssn }}</p>
                  <p><strong>Email:</strong> {{ customer.email }}</p>
                  <p><strong>Account No:</strong> {{ customer.accountNo }}</p>
                  <p><strong>Balance:</strong> ₹{{ customer.balance | number:'1.2-2' }}</p>
                  <p><strong>Account Type:</strong> {{ customer.accountType | titlecase }}</p>
                  <p><strong>City:</strong> {{ customer.city || 'Not specified' }}</p>
                </div>
                <div class="customer-actions">
                  <button class="btn btn-primary" (click)="editCustomer(customer)">Update</button>
                  <button class="btn btn-danger" (click)="deleteCustomer(customer)">Delete</button>
                </div>
              </div>
            </div>

            <!-- Customer Pagination -->
            <div class="pagination" *ngIf="customerTotalPages > 1">
              <button (click)="customerPreviousPage()" [disabled]="customerCurrentPage === 1">Previous</button>
              <span *ngFor="let page of getCustomerPageNumbers()" 
                    class="page-number" 
                    [class.active]="page === customerCurrentPage"
                    (click)="goToCustomerPage(page)">
                {{ page }}
              </span>
              <button (click)="customerNextPage()" [disabled]="customerCurrentPage === customerTotalPages">Next</button>
            </div>
          </div>
        </div>

        <!-- Customer Search Result -->
        <div class="card" *ngIf="searchCustomerResult">
          <div class="card-header">
            <h3 class="text-xl font-semibold">Customer Search Result</h3>
            <button class="btn btn-secondary" (click)="clearCustomerSearch()">Clear Search</button>
          </div>
          <div class="card-body">
            <div class="customer-card">
              <div class="customer-info">
                <h4>{{ searchCustomerResult.firstName }} {{ searchCustomerResult.lastName }}</h4>
                <p><strong>SSN:</strong> {{ searchCustomerResult.ssn }}</p>
                <p><strong>Email:</strong> {{ searchCustomerResult.email }}</p>
                <p><strong>Account No:</strong> {{ searchCustomerResult.accountNo }}</p>
                <p><strong>Balance:</strong> ₹{{ searchCustomerResult.balance | number:'1.2-2' }}</p>
                <p><strong>Account Type:</strong> {{ searchCustomerResult.accountType | titlecase }}</p>
                <p><strong>City:</strong> {{ searchCustomerResult.city || 'Not specified' }}</p>
                <p><strong>Age:</strong> {{ searchCustomerResult.age || 'Not specified' }}</p>
              </div>
              <div class="customer-actions">
                <button class="btn btn-primary" (click)="editCustomer(searchCustomerResult)">Update</button>
                <button class="btn btn-danger" (click)="deleteCustomer(searchCustomerResult)">Delete</button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Employees Tab -->
      <div *ngIf="activeTab === 'employees'">
        <!-- Employee Action Cards -->
        <div class="grid grid-cols-4 mb-4">
          <div class="card action-card" (click)="showEmployeeCreateForm()">
            <div class="card-body text-center">
              <div class="action-icon">👨‍💼</div>
              <h4>Register Employee</h4>
              <p>Add New Staff</p>
            </div>
          </div>
          
          <div class="card action-card" (click)="loadEmployees()">
            <div class="card-body text-center">
              <div class="action-icon">👥</div>
              <h4>View Employees</h4>
              <p>See All Staff</p>
            </div>
          </div>
          
          <div class="card action-card" (click)="showEmployeeUpdateForm()">
            <div class="card-body text-center">
              <div class="action-icon">✏️</div>
              <h4>Update Employee</h4>
              <p>Modify Details</p>
            </div>
          </div>
          
          <div class="card action-card" (click)="refreshEmployeeData()">
            <div class="card-body text-center">
              <div class="action-icon">🔄</div>
              <h4>Refresh</h4>
              <p>Update Data</p>
            </div>
          </div>
        </div>

        <!-- Employee List -->
        <div class="card" *ngIf="employees.length > 0">
          <div class="card-header">
            <h3 class="text-xl font-semibold">Employees ({{ totalEmployees }})</h3>
          </div>
          <div class="card-body">
            <div class="grid grid-cols-2 employees-grid">
              <div class="employee-card" *ngFor="let employee of employees">
                <div class="employee-info">
                  <h4>{{ employee.firstName }} {{ employee.lastName }}</h4>
                  <p><strong>Emp ID:</strong> {{ employee.empId }}</p>
                  <p><strong>Email:</strong> {{ employee.email }}</p>
                  <p><strong>Department:</strong> {{ employee.department }}</p>
                  <p><strong>DOB:</strong> {{ employee.dateOfBirth | date:'mediumDate' }}</p>
                  <p><strong>Address:</strong> {{ employee.address }}</p>
                  <p><strong>Status:</strong> 
                    <span [class]="employee.isActive ? 'status-active' : 'status-inactive'">
                      {{ employee.isActive ? 'Active' : 'Inactive' }}
                    </span>
                  </p>
                </div>
                <div class="employee-actions">
                  <button class="btn btn-primary" (click)="editEmployee(employee)">Update</button>
                  <button class="btn btn-danger" (click)="deleteEmployee(employee)">Delete</button>
                </div>
              </div>
            </div>

            <!-- Employee Pagination -->
            <div class="pagination" *ngIf="employeeTotalPages > 1">
              <button (click)="employeePreviousPage()" [disabled]="employeeCurrentPage === 1">Previous</button>
              <span *ngFor="let page of getEmployeePageNumbers()" 
                    class="page-number" 
                    [class.active]="page === employeeCurrentPage"
                    (click)="goToEmployeePage(page)">
                {{ page }}
              </span>
              <button (click)="employeeNextPage()" [disabled]="employeeCurrentPage === employeeTotalPages">Next</button>
            </div>
          </div>
        </div>
      </div>

      <!-- Customer Create/Edit Modal -->
      <div class="modal" [class.show]="showCustomerCreate || showCustomerEdit" *ngIf="showCustomerCreate || showCustomerEdit">
        <div class="modal-content">
          <div class="card">
            <div class="card-header">
              <h3 class="text-xl font-semibold">
                {{ showCustomerCreate ? 'Register New Customer' : 'Update Customer' }}
              </h3>
            </div>
            <div class="card-body">
              <form [formGroup]="customerForm">
                <div class="grid grid-cols-2">
                  <div class="form-group">
                    <label class="form-label">SSN *</label>
          <input type="text" class="form-control" formControlName="ssn" 
            placeholder="1234567">
                    <div class="error-message" *ngIf="customerForm.get('ssn')?.invalid && customerForm.get('ssn')?.touched">
                      Valid SSN is required
                    </div>
                  </div>
                  <div class="form-group">
                    <label class="form-label">Email *</label>
                    <input type="email" class="form-control" formControlName="email" 
                           placeholder="customer@email.com">
                  </div>
                </div>
                
                <div class="grid grid-cols-2">
                  <div class="form-group">
                    <label class="form-label">First Name *</label>
                    <input type="text" class="form-control" formControlName="firstName" placeholder="John">
                  </div>
                  <div class="form-group">
                    <label class="form-label">Last Name *</label>
                    <input type="text" class="form-control" formControlName="lastName" placeholder="Doe">
                  </div>
                </div>

                <div class="grid grid-cols-2">
                  <div class="form-group">
                    <label class="form-label">Age</label>
                    <input type="number" class="form-control" formControlName="age" placeholder="25">
                  </div>
                  <div class="form-group">
                    <label class="form-label">Account Number</label>
                    <input type="text" class="form-control" formControlName="accountNo" placeholder="ACC123456">
                  </div>
                </div>

                <div class="grid grid-cols-2">
                  <div class="form-group">
                    <label class="form-label">Aadhaar Number</label>
                    <input type="text" class="form-control" formControlName="aadhaarNo" placeholder="1234-5678-9012">
                  </div>
                  <div class="form-group">
                    <label class="form-label">PAN Number</label>
                    <input type="text" class="form-control" formControlName="panNo" placeholder="ABCDE1234F">
                  </div>
                </div>

                <div class="grid grid-cols-2">
                  <div class="form-group">
                    <label class="form-label">City</label>
                    <input type="text" class="form-control" formControlName="city" placeholder="Mumbai">
                  </div>
                  <div class="form-group">
                    <label class="form-label">Gender</label>
                    <select class="form-control" formControlName="gender">
                      <option value="male">Male</option>
                      <option value="female">Female</option>
                      <option value="other">Other</option>
                    </select>
                  </div>
                </div>

                <div class="grid grid-cols-2">
                  <div class="form-group">
                    <label class="form-label">Balance</label>
                    <input type="number" class="form-control" formControlName="balance" placeholder="10000">
                  </div>
                  <div class="form-group">
                    <label class="form-label">Account Type</label>
                    <select class="form-control" formControlName="accountType">
                      <option value="savings">Savings</option>
                      <option value="current">Current</option>
                      <option value="fd">Fixed Deposit</option>
                      <option value="rd">Recurring Deposit</option>
                    </select>
                  </div>
                </div>

                <div class="grid grid-cols-2">
                  <div class="form-group">
                    <label class="form-label">Contact Number *</label>
                    <input type="tel" class="form-control" formControlName="contactNo" placeholder="9876543210">
                    <div class="error-message" *ngIf="customerForm.get('contactNo')?.invalid && customerForm.get('contactNo')?.touched">
                      Valid 10-digit contact number is required
                    </div>
                  </div>
                  <div class="form-group">
                    <label class="form-label">Initial Deposit *</label>
                    <input type="number" class="form-control" formControlName="initialDeposit" placeholder="1000" min="1">
                    <div class="error-message" *ngIf="customerForm.get('initialDeposit')?.invalid && customerForm.get('initialDeposit')?.touched">
                      Initial deposit must be at least 1
                    </div>
                  </div>
                </div>

                <div class="form-group">
                  <label class="form-label">Address *</label>
                  <textarea class="form-control" formControlName="address" rows="2" placeholder="Enter full address"></textarea>
                  <div class="error-message" *ngIf="customerForm.get('address')?.invalid && customerForm.get('address')?.touched">
                    Address is required
                  </div>
                </div>

                <div class="form-group">
                  <label class="form-label">Date of Birth</label>
                  <input type="date" class="form-control" formControlName="dateOfBirth">
                </div>
              </form>
            </div>
            <div class="card-footer">
              <button type="button" class="btn btn-secondary" (click)="hideCustomerForm()">Cancel</button>
              <button type="button" class="btn btn-success" (click)="onCustomerSubmit()" 
                      [disabled]="customerForm.invalid || isLoading">
                {{ showCustomerCreate ? 'Register Customer' : 'Update Customer' }}
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Customer Search Modal -->
      <div class="modal" [class.show]="showCustomerSearch" *ngIf="showCustomerSearch">
        <div class="modal-content">
          <div class="card">
            <div class="card-header">
              <h3 class="text-xl font-semibold">Search Customer by SSN</h3>
            </div>
            <div class="card-body">
              <form [formGroup]="customerSearchForm">
                <div class="form-group">
                  <label class="form-label">SSN</label>
                  <input type="text" class="form-control" formControlName="ssn" 
                         placeholder="Enter customer SSN">
                </div>
              </form>
            </div>
            <div class="card-footer">
              <button type="button" class="btn btn-secondary" (click)="hideCustomerSearch()">Cancel</button>
              <button type="button" class="btn btn-primary" (click)="onCustomerSearch()" 
                      [disabled]="customerSearchForm.invalid || isLoading">
                Search
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Employee Create/Edit Modal -->
      <div class="modal" [class.show]="showEmployeeCreate || showEmployeeEdit" *ngIf="showEmployeeCreate || showEmployeeEdit">
        <div class="modal-content">
          <div class="card">
            <div class="card-header">
              <h3 class="text-xl font-semibold">
                {{ showEmployeeCreate ? 'Register New Employee' : 'Update Employee' }}
              </h3>
            </div>
            <div class="card-body">
              <form [formGroup]="employeeForm">
                <div class="grid grid-cols-2">
                  <div class="form-group">
                    <label class="form-label">Employee ID *</label>
          <input type="text" class="form-control" formControlName="empId" 
            placeholder="EMP12345">
                  </div>
                  <div class="form-group">
                    <label class="form-label">Email *</label>
                    <input type="email" class="form-control" formControlName="email" 
                           placeholder="employee@bank.com">
                  </div>
                </div>
                
                <div class="grid grid-cols-2">
                  <div class="form-group">
                    <label class="form-label">First Name *</label>
                    <input type="text" class="form-control" formControlName="firstName" placeholder="Jane">
                  </div>
                  <div class="form-group">
                    <label class="form-label">Last Name *</label>
                    <input type="text" class="form-control" formControlName="lastName" placeholder="Smith">
                  </div>
                </div>

                <div class="form-group">
                  <label class="form-label">Department *</label>
                  <select class="form-control" formControlName="department">
                    <option value="">Select Department</option>
                    <option value="Customer Service">Customer Service</option>
                    <option value="Loan Department">Loan Department</option>
                    <option value="Operations">Operations</option>
                    <option value="IT">IT</option>
                    <option value="HR">HR</option>
                    <option value="Finance">Finance</option>
                  </select>
                </div>

                <div class="form-group">
                  <label class="form-label">Status *</label>
                  <select class="form-control" formControlName="isActive">
                    <option [ngValue]="true">Active</option>
                    <option [ngValue]="false">Inactive</option>
                  </select>
                </div>

                <div class="form-group">
                  <label class="form-label">Date of Birth</label>
                  <input type="date" class="form-control" formControlName="dateOfBirth">
                </div>

                <div class="form-group">
                  <label class="form-label">Address</label>
                  <textarea class="form-control" formControlName="address" rows="3" 
                            placeholder="Enter full address"></textarea>
                </div>
              </form>
            </div>
            <div class="card-footer">
              <button type="button" class="btn btn-secondary" (click)="hideEmployeeForm()">Cancel</button>
              <button type="button" class="btn btn-success" (click)="onEmployeeSubmit()" 
                      [disabled]="employeeForm.invalid || isLoading">
                {{ showEmployeeCreate ? 'Register Employee' : 'Update Employee' }}
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Loading State -->
      <div class="card text-center" *ngIf="isLoading">
        <div class="card-body">
          <div class="spinner"></div>
          <p>Loading...</p>
        </div>
      </div>

      <!-- Empty State -->
      <div class="card text-center" *ngIf="!isLoading && activeTab === 'customers' && customers.length === 0 && !searchCustomerResult">
        <div class="card-body">
          <div class="empty-icon">📋</div>
          <h3>No customers found</h3>
          <p>Click "View Customers" to load customer data or register a new customer.</p>
        </div>
      </div>

      <div class="card text-center" *ngIf="!isLoading && activeTab === 'employees' && employees.length === 0">
        <div class="card-body">
          <div class="empty-icon">👥</div>
          <h3>No employees found</h3>
          <p>Click "View Employees" to load employee data or register a new employee.</p>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .manager-dashboard {
      max-width: 1400px;
      margin: 0 auto;
    }

    .dashboard-header {
      margin-bottom: 2rem;
    }

    .stats-card {
      text-align: center;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      transition: transform 0.2s ease;
    }

    .stats-card:hover {
      transform: translateY(-4px);
    }

    .stats-number {
      font-size: 2.5rem;
      font-weight: bold;
      margin-bottom: 0.5rem;
    }

    .stats-label {
      font-size: 0.875rem;
      opacity: 0.9;
    }

    .action-card {
      cursor: pointer;
      transition: all 0.2s ease;
    }

    .action-card:hover {
      transform: translateY(-4px);
      box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15);
    }

    .action-icon {
      font-size: 2rem;
      margin-bottom: 1rem;
    }

    .action-card h4 {
      font-weight: 600;
      margin-bottom: 0.5rem;
    }

    .action-card p {
      color: #6b7280;
      font-size: 0.875rem;
    }

    .modal {
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background-color: rgba(0, 0, 0, 0.5);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 1000;
      opacity: 0;
      visibility: hidden;
      transition: all 0.3s ease;
    }

    .modal.show {
      opacity: 1;
      visibility: visible;
    }

    .modal-content {
      max-width: 800px;
      width: 90%;
      max-height: 90vh;
      overflow-y: auto;
    }

    .customer-card, .employee-card {
      padding: 1.5rem;
      border: 1px solid #e5e7eb;
      border-radius: 8px;
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      transition: all 0.2s ease;
      margin-bottom: 1rem;
    }

    .customer-card:hover, .employee-card:hover {
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
    }

    .customer-info, .employee-info {
      flex: 1;
    }

    .customer-info h4, .employee-info h4 {
      font-weight: 600;
      font-size: 1.125rem;
      margin-bottom: 0.75rem;
      color: #1f2937;
    }

    .customer-info p, .employee-info p {
      margin-bottom: 0.5rem;
      color: #6b7280;
      font-size: 0.875rem;
    }

    .customer-actions, .employee-actions {
      display: flex;
      flex-direction: column;
      gap: 0.5rem;
      min-width: 120px;
    }

    .customer-actions button, .employee-actions button {
      font-size: 0.875rem;
      padding: 0.5rem 1rem;
    }

    .status-active {
      color: #059669;
      font-weight: 600;
    }

    .status-inactive {
      color: #dc2626;
      font-weight: 600;
    }

    .customers-grid .customer-card, .employees-grid .employee-card {
      margin-bottom: 0;
    }

    .pagination {
      display: flex;
      justify-content: center;
      align-items: center;
      gap: 0.5rem;
      margin-top: 2rem;
      flex-wrap: wrap;
    }

    .pagination button,
    .page-number {
      padding: 0.5rem 1rem;
      border: 1px solid #d1d5db;
      background: white;
      cursor: pointer;
      border-radius: 6px;
      transition: all 0.2s ease;
      font-size: 0.875rem;
    }

    .pagination button:hover:not(:disabled),
    .page-number:hover {
      background-color: #f3f4f6;
    }

    .page-number.active {
      background-color: #2563eb;
      color: white;
      border-color: #2563eb;
    }

    .pagination button:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }

    .empty-icon {
      font-size: 4rem;
      margin-bottom: 1rem;
      opacity: 0.5;
    }

    @media (max-width: 1024px) {
      .grid-cols-4 {
        grid-template-columns: repeat(2, 1fr);
      }
      
      .customers-grid, .employees-grid {
        grid-template-columns: 1fr;
      }
    }

    @media (max-width: 768px) {
      .grid-cols-4 {
        grid-template-columns: 1fr;
      }
      
      .grid-cols-2 {
        grid-template-columns: 1fr;
      }

      .customer-card, .employee-card {
        flex-direction: column;
        gap: 1rem;
      }

      .customer-actions, .employee-actions {
        flex-direction: row;
        justify-content: flex-start;
        min-width: auto;
      }

      .stats-number {
        font-size: 2rem;
      }
    }
  `]
})
export class ManagerDashboardComponent implements OnInit {
  activeTab: 'customers' | 'employees' = 'customers';
  
  // Data arrays
  customers: Customer[] = [];
  employees: Employee[] = [];
  searchCustomerResult: Customer | null = null;
  selectedCustomer: Customer | null = null;
  selectedEmployee: Employee | null = null;
  
  // Statistics
  totalCustomers = 0;
  totalEmployees = 0;
  totalBalance = 0;
  activeCustomers = 0;
  
  // Pagination - Customers
  customerCurrentPage = 1;
  customerTotalPages = 0;
  customerPageSize = 8;
  
  // Pagination - Employees
  employeeCurrentPage = 1;
  employeeTotalPages = 0;
  employeePageSize = 8;
  
  // Modal states
  showCustomerCreate = false;
  showCustomerEdit = false;
  showCustomerSearch = false;
  showEmployeeCreate = false;
  showEmployeeEdit = false;
  isLoading = false;
  
  // Forms
  customerForm: FormGroup;
  employeeForm: FormGroup;
  customerSearchForm: FormGroup;

  constructor(
    private fb: FormBuilder,
    private customerService: CustomerService,
    private employeeService: EmployeeService,
    private notificationService: NotificationService
  ) {
    this.customerForm = this.fb.group({
      ssn: ['', [Validators.required, Validators.pattern(/^\d{7}$/)]],
      firstName: ['', Validators.required],
      lastName: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      age: [''],
      accountNo: [''],
      aadhaarNo: [''],
      panNo: [''],
      city: [''],
      gender: ['male'],
      balance: [0],
      accountType: ['savings'],
      dateOfBirth: [''],
      // Newly added fields required by backend on creation
      contactNo: [''],
      address: [''],
      initialDeposit: [null]
    });

    this.employeeForm = this.fb.group({
      empId: ['', Validators.required],
      firstName: ['', Validators.required],
      lastName: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      department: ['', Validators.required],
      dateOfBirth: [''],
      address: [''],
      isActive: [true]
    });

    this.customerSearchForm = this.fb.group({
      ssn: ['', [Validators.required, Validators.pattern(/^\d{7}$/)]]
    });
  }

  ngOnInit(): void {
    this.loadStatistics();
  }

  setActiveTab(tab: 'customers' | 'employees'): void {
    this.activeTab = tab;
    this.clearSearchResults();
  }

  // Statistics
  loadStatistics(): void {
    // Load customer statistics
    this.customerService.getCustomers(1, 1000).subscribe({
      next: (result) => {
        this.totalCustomers = result.total;
        this.activeCustomers = result.customers.filter(c => c.isActive).length;
        this.totalBalance = result.customers.reduce((sum, c) => sum + c.balance, 0);
      }
    });

    // Load employee statistics
    this.employeeService.getEmployees(1, 1000).subscribe({
      next: (result) => {
        this.totalEmployees = result.total;
        // If employees already loaded on another tab, keep list consistent when total > current length
        if (this.employees.length && this.employees.length !== result.total) {
          // Optionally refresh current page if discrepancy detected
          if (this.employeeCurrentPage === 1) {
            this.employees = result.employees.slice(0, this.employeePageSize);
          }
        }
      }
    });
  }

  // Customer operations
  loadCustomers(): void {
    this.isLoading = true;
    this.searchCustomerResult = null;
    this.customerCurrentPage = 1;
    
    this.customerService.getCustomers(this.customerCurrentPage, this.customerPageSize).subscribe({
      next: (result) => {
        this.isLoading = false;
        this.customers = result.customers;
        this.totalCustomers = result.total;
        this.customerTotalPages = Math.ceil(this.totalCustomers / this.customerPageSize);
        this.notificationService.showSuccess(`Loaded ${result.customers.length} customers`);
      },
      error: (error) => {
        this.isLoading = false;
        this.notificationService.showError('Failed to load customers');
      }
    });
  }

  showCustomerCreateForm(): void {
    this.customerForm.reset();
    this.customerForm.patchValue({
      gender: 'male',
      balance: 0,
      accountType: 'savings'
    });
    // Ensure SSN is enabled when creating a new customer
    this.customerForm.get('ssn')?.enable({ emitEvent: false });
    // Set validators required for creation
    this.customerForm.get('accountNo')?.setValidators([Validators.required]);
    this.customerForm.get('aadhaarNo')?.setValidators([Validators.required]);
    this.customerForm.get('panNo')?.setValidators([Validators.required]);
    this.customerForm.get('contactNo')?.setValidators([Validators.required, Validators.pattern(/^\d{10}$/)]);
    this.customerForm.get('address')?.setValidators([Validators.required]);
    this.customerForm.get('initialDeposit')?.setValidators([Validators.required, Validators.min(1)]);
    ['accountNo','aadhaarNo','panNo','contactNo','address','initialDeposit'].forEach(c => this.customerForm.get(c)?.updateValueAndValidity());
    this.showCustomerCreate = true;
  }

  showCustomerSearchForm(): void {
    this.showCustomerSearch = true;
  }

  hideCustomerForm(): void {
    this.showCustomerCreate = false;
    this.showCustomerEdit = false;
    this.selectedCustomer = null;
    this.customerForm.reset();
  }

  hideCustomerSearch(): void {
    this.showCustomerSearch = false;
    this.customerSearchForm.reset();
  }

  onCustomerSearch(): void {
    if (this.customerSearchForm.valid) {
      this.isLoading = true;
      const ssn = this.customerSearchForm.value.ssn;
      
      this.customerService.searchCustomerBySSN(ssn).subscribe({
        next: (customer) => {
          this.isLoading = false;
          this.searchCustomerResult = customer;
          this.customers = [];
          if (customer) {
            this.notificationService.showSuccess('Customer found successfully!');
          } else {
            this.notificationService.showWarning('No customer found with this SSN');
          }
          this.hideCustomerSearch();
        },
        error: (error) => {
          this.isLoading = false;
          this.notificationService.showError('Search failed');
        }
      });
    }
  }

  clearCustomerSearch(): void {
    this.searchCustomerResult = null;
    this.loadCustomers();
  }

  editCustomer(customer: Customer): void {
    this.selectedCustomer = customer;
    this.customerForm.patchValue({
      ssn: customer.ssn,
      firstName: customer.firstName,
      lastName: customer.lastName,
      email: customer.email,
      age: customer.age,
      accountNo: customer.accountNo,
      aadhaarNo: customer.aadhaarNo,
      panNo: customer.panNo,
      city: customer.city,
      gender: customer.gender,
      balance: customer.balance,
      accountType: customer.accountType,
      dateOfBirth: customer.dateOfBirth ? this.formatDateForInput(customer.dateOfBirth) : '',
      contactNo: customer.contactNo,
      address: customer.address
    });
    // Relax validators for edit (not all fields are mandatory on update)
    this.customerForm.get('accountNo')?.clearValidators();
    this.customerForm.get('aadhaarNo')?.clearValidators();
    this.customerForm.get('panNo')?.clearValidators();
    this.customerForm.get('contactNo')?.setValidators([Validators.pattern(/^\d{10}$/)]);
    this.customerForm.get('address')?.clearValidators();
    this.customerForm.get('initialDeposit')?.clearValidators();
    ['accountNo','aadhaarNo','panNo','contactNo','address','initialDeposit'].forEach(c => this.customerForm.get(c)?.updateValueAndValidity());
    this.showCustomerEdit = true;
  }

  onCustomerSubmit(): void {
    if (this.customerForm.valid) {
      this.isLoading = true;
      
      if (this.showCustomerCreate) {
        const data = this.customerForm.value;
        // Pre-check: ensure account number is unique to avoid 400 from backend unique constraint
        this.customerService.checkAccountExists(data.accountNo).subscribe({
          next: (exists) => {
            if (exists) {
              this.isLoading = false;
              this.notificationService.showError('Account number already exists. Please use a different account number.');
              return;
            }
            this.customerService.createCustomer(data).subscribe({
              next: (customer) => {
                this.isLoading = false;
                this.hideCustomerForm();
                this.notificationService.showSuccess(`Customer registered successfully! Account: ${customer.accountNo}`);
                this.loadCustomers();
                this.loadStatistics();
              },
              error: (error) => {
                this.isLoading = false;
                this.notificationService.showError(error.message || 'Failed to create customer');
              }
            });
          },
          error: () => {
            // If the check fails, proceed with create but warn
            this.customerService.createCustomer(data).subscribe({
              next: (customer) => {
                this.isLoading = false;
                this.hideCustomerForm();
                this.notificationService.showSuccess(`Customer registered successfully! Account: ${customer.accountNo}`);
                this.loadCustomers();
                this.loadStatistics();
              },
              error: (error) => {
                this.isLoading = false;
                this.notificationService.showError(error.message || 'Failed to create customer');
              }
            });
          }
        });
      } else if (this.showCustomerEdit && this.selectedCustomer) {
        this.customerService.updateCustomer(this.selectedCustomer.id, this.customerForm.value).subscribe({
          next: (updatedCustomer) => {
            this.isLoading = false;
            this.hideCustomerForm();
            this.notificationService.showSuccess('Customer updated successfully!');
            
            // Update the customer in the list or search result
            if (this.searchCustomerResult && this.searchCustomerResult.id === updatedCustomer.id) {
              this.searchCustomerResult = updatedCustomer;
            }
            
            const index = this.customers.findIndex(c => c.id === updatedCustomer.id);
            if (index !== -1) {
              this.customers[index] = updatedCustomer;
            }
            this.loadStatistics();
          },
          error: (error) => {
            this.isLoading = false;
            this.notificationService.showError(error.message || 'Failed to update customer');
          }
        });
      }
    }
  }

  deleteCustomer(customer: Customer): void {
    if (confirm(`Are you sure you want to delete customer ${customer.firstName} ${customer.lastName}?`)) {
      this.isLoading = true;
      
      this.customerService.deleteCustomer(customer.id).subscribe({
        next: () => {
          this.isLoading = false;
          this.notificationService.showSuccess('Customer deleted successfully!');
          
          if (this.searchCustomerResult && this.searchCustomerResult.id === customer.id) {
            this.searchCustomerResult = null;
          }
          
          this.customers = this.customers.filter(c => c.id !== customer.id);
          this.totalCustomers--;
          this.loadStatistics();
        },
        error: (error) => {
          this.isLoading = false;
          this.notificationService.showError(error.message || 'Failed to delete customer');
        }
      });
    }
  }

  // Employee operations
  loadEmployees(): void {
    this.isLoading = true;
    this.employeeCurrentPage = 1;
    
    this.employeeService.getEmployees(this.employeeCurrentPage, this.employeePageSize).subscribe({
      next: (result) => {
        this.isLoading = false;
        this.employees = result.employees;
        this.totalEmployees = result.total;
        this.employeeTotalPages = Math.ceil(this.totalEmployees / this.employeePageSize);
        // Use total (all employees) rather than current page slice length to avoid confusing count (e.g., 8 shown when 10 exist)
        this.notificationService.showSuccess(`Loaded ${this.totalEmployees} employees`);
      },
      error: (error) => {
        this.isLoading = false;
        this.notificationService.showError('Failed to load employees');
      }
    });
  }

  showEmployeeCreateForm(): void {
    this.employeeForm.reset();
    // Ensure default active status when creating a new employee
    this.employeeForm.patchValue({ isActive: true });
    this.showEmployeeCreate = true;
  }

  showEmployeeUpdateForm(): void {
    if (this.employees.length === 0) {
      this.notificationService.showWarning('Please load employees first');
      return;
    }
    // For simplicity, edit the first employee. In real app, user would select one.
    if (this.employees.length > 0) {
      this.editEmployee(this.employees[0]);
    }
  }

  editEmployee(employee: Employee): void {
    this.selectedEmployee = employee;
    this.employeeForm.patchValue({
      empId: employee.empId,
      firstName: employee.firstName,
      lastName: employee.lastName,
      email: employee.email,
      department: employee.department,
      dateOfBirth: employee.dateOfBirth ? this.formatDateForInput(employee.dateOfBirth) : '',
      address: employee.address,
      isActive: employee.isActive
    });
    this.showEmployeeEdit = true;
  }

  hideEmployeeForm(): void {
    this.showEmployeeCreate = false;
    this.showEmployeeEdit = false;
    this.selectedEmployee = null;
    this.employeeForm.reset();
  }

  onEmployeeSubmit(): void {
    if (this.employeeForm.valid) {
      this.isLoading = true;
      
      if (this.showEmployeeCreate) {
        this.employeeService.createEmployee(this.employeeForm.value).subscribe({
          next: (employee) => {
            this.isLoading = false;
            this.hideEmployeeForm();
            this.notificationService.showSuccess(`Employee registered successfully! ID: ${employee.empId}`);
            this.loadEmployees();
            this.loadStatistics();
          },
          error: (error) => {
            this.isLoading = false;
            this.notificationService.showError(error.message || 'Failed to create employee');
          }
        });
      } else if (this.showEmployeeEdit && this.selectedEmployee) {
        this.employeeService.updateEmployee(this.selectedEmployee.id, this.employeeForm.value).subscribe({
          next: (updatedEmployee) => {
            this.isLoading = false;
            this.hideEmployeeForm();
            this.notificationService.showSuccess('Employee updated successfully!');
            
            const index = this.employees.findIndex(e => e.id === updatedEmployee.id);
            if (index !== -1) {
              this.employees[index] = updatedEmployee;
            }
          },
          error: (error) => {
            this.isLoading = false;
            this.notificationService.showError(error.message || 'Failed to update employee');
          }
        });
      }
    }
  }

  deleteEmployee(employee: Employee): void {
    if (confirm(`Are you sure you want to delete employee ${employee.firstName} ${employee.lastName}?`)) {
      this.isLoading = true;
      
      this.employeeService.deleteEmployee(employee.id).subscribe({
        next: () => {
          this.isLoading = false;
          this.notificationService.showSuccess('Employee deleted successfully!');
          this.employees = this.employees.filter(e => e.id !== employee.id);
          this.totalEmployees--;
          this.loadStatistics();
        },
        error: (error) => {
          this.isLoading = false;
          this.notificationService.showError(error.message || 'Failed to delete employee');
        }
      });
    }
  }

  // Pagination - Customers
  goToCustomerPage(page: number): void {
    if (page >= 1 && page <= this.customerTotalPages) {
      this.customerCurrentPage = page;
      this.loadCustomersForPage();
    }
  }

  customerPreviousPage(): void {
    if (this.customerCurrentPage > 1) {
      this.customerCurrentPage--;
      this.loadCustomersForPage();
    }
  }

  customerNextPage(): void {
    if (this.customerCurrentPage < this.customerTotalPages) {
      this.customerCurrentPage++;
      this.loadCustomersForPage();
    }
  }

  private loadCustomersForPage(): void {
    this.isLoading = true;
    
    this.customerService.getCustomers(this.customerCurrentPage, this.customerPageSize).subscribe({
      next: (result) => {
        this.isLoading = false;
        this.customers = result.customers;
      },
      error: (error) => {
        this.isLoading = false;
        this.notificationService.showError('Failed to load customers');
      }
    });
  }

  getCustomerPageNumbers(): number[] {
    const pages: number[] = [];
    for (let i = 1; i <= this.customerTotalPages; i++) {
      pages.push(i);
    }
    return pages;
  }

  // Pagination - Employees
  goToEmployeePage(page: number): void {
    if (page >= 1 && page <= this.employeeTotalPages) {
      this.employeeCurrentPage = page;
      this.loadEmployeesForPage();
    }
  }

  employeePreviousPage(): void {
    if (this.employeeCurrentPage > 1) {
      this.employeeCurrentPage--;
      this.loadEmployeesForPage();
    }
  }

  employeeNextPage(): void {
    if (this.employeeCurrentPage < this.employeeTotalPages) {
      this.employeeCurrentPage++;
      this.loadEmployeesForPage();
    }
  }

  private loadEmployeesForPage(): void {
    this.isLoading = true;
    
    this.employeeService.getEmployees(this.employeeCurrentPage, this.employeePageSize).subscribe({
      next: (result) => {
        this.isLoading = false;
        this.employees = result.employees;
      },
      error: (error) => {
        this.isLoading = false;
        this.notificationService.showError('Failed to load employees');
      }
    });
  }

  getEmployeePageNumbers(): number[] {
    const pages: number[] = [];
    for (let i = 1; i <= this.employeeTotalPages; i++) {
      pages.push(i);
    }
    return pages;
  }

  // Utility methods
  formatDateForInput(date: Date): string {
    const d = new Date(date);
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  refreshCustomerData(): void {
    if (this.customers.length > 0 || this.searchCustomerResult) {
      if (this.searchCustomerResult) {
        this.clearCustomerSearch();
      } else {
        this.loadCustomers();
      }
      this.loadStatistics();
    } else {
      this.notificationService.showInfo('Click "View Customers" to load data');
    }
  }

  refreshEmployeeData(): void {
    if (this.employees.length > 0) {
      this.loadEmployees();
      this.loadStatistics();
    } else {
      this.notificationService.showInfo('Click "View Employees" to load data');
    }
  }

  clearSearchResults(): void {
    this.searchCustomerResult = null;
  }
}