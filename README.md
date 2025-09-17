# Bank Management (Microservices + Angular UI)

A demo banking system built with Spring Boot microservices and an Angular frontend.

- Backend: Spring Boot 3.x microservices (Account, Customer, Employee, Auth, Common Lib)
- Frontend: Angular 15 (standalone components)
- Database: H2 (in-memory for demo)

## Repository layout

```
Bank-Mangement/
├─ Bank-Mangement-Microservice/
│  └─ bank-management-system/
│     ├─ account-service/
│     ├─ auth-service/
│     ├─ customer-service/
│     ├─ employee-service/
│     └─ common-lib/
└─ project/   # Angular frontend
```

## Prerequisites

- Java 17+
- Maven 3.8+
- Node.js 18+ and npm (Angular CLI in dev dependencies)
- Windows (scripts provided as .bat); Linux/Mac users can adapt commands

## Backend services

Default ports (configurable via application.properties):
- employee-service: 8081
- customer-service: 8082
- account-service: 8083
- auth-service: 8084

### Build all services

```cmd
cd Bank-Mangement-Microservice\bank-management-system
mvn -q -DskipTests clean package
```

### Run all services (Windows)

We provide helper scripts at `bank-management-system` root:

```cmd
run-all.bat    # builds (if needed) and starts all four services in separate windows
stop-all.bat   # stops the running Java processes for these services
```

Alternatively, run a single service jar (example for account-service):

```cmd
cd Bank-Mangement-Microservice\bank-management-system\account-service\target
java -jar account-service-1.0.0.jar
```

## Frontend (Angular)

From the `project` directory:

### Install and start the dev server

```cmd
cd project
npm install
npm start
```

- The app runs on http://localhost:4200
- The UI expects backend services on the ports listed above.

## Key features

- Customer dashboard: profile update, deposit/withdraw/transfer, recent transactions
- Manager dashboard: manage customers and employees
- Employee dashboard: staff operations
- Balance correctness: balances are hydrated from account-service to avoid staleness

## Important integration details

- Source of truth for balances is account-service. The frontend always fetches `/api/accounts/{accountNo}/balance` after updates and on init.
- Transactions returned by account-service don’t include a resulting balance. The frontend computes each transaction’s displayed balance using the latest account balance and applies deltas per transaction (deposit/withdraw/transfer with direction awareness).
- Customer identifiers: SSN is used as the primary identifier across services and UI.

## Troubleshooting

- Balance not updating after a transaction:
  - Ensure account-service (8083) is running.
  - Check that the customer has a valid `accountNumber` in customer-service.
  - The frontend calls `/api/accounts/{accountNo}/balance`—verify this endpoint returns the expected value.
- After refresh, old balance is shown:
  - The UI hydrates the logged-in user from account-service on startup. If you still see stale data, clear localStorage and reload.
- Cross-service connectivity:
  - Confirm all services are up and reachable: 8081–8084.

## Environment/config

- The Angular app uses a proxied `/api` base configured in `environment` files (see `project/src/app/environments`). Adjust if your backend ports differ.

## Scripts summary

- `bank-management-system/run-all.bat` — build and launch all microservices
- `bank-management-system/stop-all.bat` — stop all launched microservices
- `project`:
  - `npm start` — start Angular dev server (ng serve)
  - `npm run build` — production build

## Notes

- This project is for learning/demo. For production, consider:
  - Externalized configs and secrets
  - Persistent database (e.g., Postgres)
  - API gateway/service registry (e.g., Spring Cloud Gateway, Eureka)
  - Proper auth tokens (JWT/OAuth2)
  - CI/CD and test coverage
