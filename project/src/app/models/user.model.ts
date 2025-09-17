export interface User {
  id: string;
  ssn?: string;
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  role: 'CUSTOMER' | 'EMPLOYEE' | 'MANAGER' | 'ADMIN';
  isActive: boolean;
  createdAt: Date;
}

export interface Customer extends User {
  role: 'CUSTOMER';
  accountNo: string;
  ifscCode: string;
  balance: number;
  aadhaarNo: string;
  panNo: string;
  dateOfBirth: Date;
  gender: 'male' | 'female' | 'other';
  maritalStatus: 'single' | 'married' | 'divorced' | 'widowed';
  address: string;
  contactNo: string;
  accountType: 'savings' | 'current' | 'fd' | 'rd';
  city: string;
  age: number;
}

export interface Employee extends User {
  role: 'EMPLOYEE';
  empId: string;
  department: string;
  address: string;
  dateOfBirth: Date;
}

export interface Manager extends User {
  role: 'MANAGER';
  managerId: string;
  department: string;
}

export interface Transaction {
  id: string;
  customerId: string;
  accountNo: string;
  type: 'deposit' | 'withdraw' | 'transfer';
  amount: number;
  balance: number;
  description: string;
  timestamp: Date;
  toAccountNo?: string;
  fromAccountNo?: string;
}

export interface LoginRequest {
  identifier: string; // SSN for customer, userId for employee/manager
  password: string;
  role: 'CUSTOMER' | 'EMPLOYEE' | 'MANAGER';
}

export interface CustomerRegistration {
  ssn: string;
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  confirmPassword: string;
  address: string;
  contactNo: string;
}