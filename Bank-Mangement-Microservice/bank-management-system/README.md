# Bank Management System

This is a Java 17 Spring Boot microservices project for managing bank operations such as employee and customer management, account operations, authentication, fund transfer, and more.

## Microservices Structure
- **employee-service** (Port 8081) - Employee registration and management
- **customer-service** (Port 8082) - Customer registration and management  
- **account-service** (Port 8083) - Account CRUD operations, fund transfers, balance inquiry
- **auth-service** (Port 8084) - Authentication and authorization
- **common-lib** - Shared models and utilities

## Requirements
- Java 17
- Maven 3.8+

## Features Implemented
✅ Employee registration and management (US001-US003)
✅ Customer registration and management with collection operations
✅ Account management using inheritance (Savings/Current accounts)
✅ Fund transfer between accounts
✅ Balance inquiry
✅ Exception handling (InsufficientFunds, AccountNotFound)
✅ Authentication with login/logout and session management
✅ REST APIs for all operations

## How to Run

### Prerequisites Check:
```cmd
java -version          # Should show Java 17
mvn -version          # Should show Maven version
```

### Method 1: Build and Run All Services
1. Build the entire project:
   ```cmd
   mvn clean install
   ```

2. Run each service in separate terminals:
   ```cmd
   # Terminal 1 - Employee Service
   cd employee-service
   ../mvnw.cmd spring-boot:run

   # Terminal 2 - Customer Service  
   cd customer-service
   mvn spring-boot:run

   # Terminal 3 - Account Service
   cd account-service
   mvn spring-boot:run

   # Terminal 4 - Auth Service
   cd auth-service
   mvn spring-boot:run
   ```

### Method 2: Use VS Code Tasks
1. Open Command Palette (Ctrl+Shift+P)
2. Type "Tasks: Run Task"
3. Select "Run All Services" or individual services

3. Access H2 consoles for testing:
   - Employee Service: http://localhost:8081/h2-console
   - Customer Service: http://localhost:8082/h2-console
   - Account Service: http://localhost:8083/h2-console
   - Auth Service: http://localhost:8084/h2-console

## API Endpoints

### Employee Service (8081)
- GET /api/employees - Get all employees
- POST /api/employees - Create employee
- PUT /api/employees/{id} - Update employee
- DELETE /api/employees/{id} - Delete employee
- PUT /api/employees/salary/clerk/add/{amount} - Add salary to clerks
- PUT /api/employees/salary/manager/percentage/{percentage} - Add percentage to managers

### Customer Service (8082)
- GET /api/customers - Get all customers
- POST /api/customers - Create customer
- PUT /api/customers/{ssnId} - Update customer
- DELETE /api/customers/{ssnId} - Delete customer
- GET /api/customers/account/{accountNumber} - Get customer by account

### Account Service (8083)
- GET /api/accounts - Get all accounts
- POST /api/accounts - Create account
- GET /api/accounts/{accountNumber}/balance - Get balance
- POST /api/accounts/transfer - Transfer funds
- POST /api/accounts/{accountNumber}/deposit - Deposit
- POST /api/accounts/{accountNumber}/withdraw - Withdraw

### Auth Service (8084)
- POST /api/auth/register - Register user
- POST /api/auth/login - Login
- POST /api/auth/logout - Logout
- GET /api/auth/session - Get session info
- POST /api/auth/validate - Validate credentials

## Default Users
- admin/password (ADMIN)
- manager1/password (MANAGER)
- customer1/password (CUSTOMER)
- employee1/password (EMPLOYEE)

## Database
Each service uses H2 in-memory database with demo data pre-loaded.
