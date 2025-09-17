import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { map, switchMap, catchError } from 'rxjs/operators';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments';
import { User, Customer, Employee, Manager, LoginRequest, CustomerRegistration } from '../models/user.model';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private currentUserSubject = new BehaviorSubject<User | null>(null);
  public currentUser$ = this.currentUserSubject.asObservable();
  
  private isLoggedInSubject = new BehaviorSubject<boolean>(false);
  public isLoggedIn$ = this.isLoggedInSubject.asObservable();

  private readonly baseUrl = `${environment.apiBase}`;

  constructor(private http: HttpClient) {
    // Check if user is already logged in
    const savedUser = localStorage.getItem('currentUser');
    if (savedUser) {
      const user = JSON.parse(savedUser);
      this.currentUserSubject.next(user);
      this.isLoggedInSubject.next(true);
      // Post-load enrichment for customer if name data is missing
      if (user?.role === 'CUSTOMER') {
        const ssn = user.ssn || user.id;
        if (ssn) {
          this.http.get<any>(`${this.baseUrl}/customers/${ssn}`).pipe(
            switchMap((customer) => {
              const customerName: string | undefined = customer?.customerName;
              const [firstName, ...rest] = (customerName || '').split(' ');
              const mapped: any = {
                ...user,
                id: ssn,
                ssn,
                firstName: firstName || user.firstName,
                lastName: rest?.join(' ') || user.lastName,
                email: customer?.email ?? user.email,
                address: customer?.address,
                contactNo: customer?.contactNumber,
                accountNo: customer?.accountNumber,
                balance: customer?.balance,
                accountType: customer?.accountType,
                city: customer?.city,
                role: 'CUSTOMER'
              } as User;
              // Hydrate balance from account-service if accountNo available
              if (mapped.accountNo) {
                return this.http.get<{balance: number}>(`${this.baseUrl}/accounts/${mapped.accountNo}/balance`).pipe(
                  map((res) => ({ ...mapped, balance: typeof res.balance === 'number' ? res.balance : mapped.balance }) as User),
                  catchError(() => of(mapped as User))
                );
              }
              return of(mapped as User);
            }),
            map((finalUser) => {
              localStorage.setItem('currentUser', JSON.stringify(finalUser));
              this.currentUserSubject.next(finalUser);
              return finalUser;
            })
          ).subscribe({ next: () => {}, error: () => {} });
        }
      }
    }
  }

  login(loginRequest: LoginRequest): Observable<User> {
    // Convert role to uppercase to match backend expectations
    const role = loginRequest.role.toUpperCase() as 'CUSTOMER' | 'EMPLOYEE' | 'MANAGER';
    
    const body = {
      username: loginRequest.identifier, 
      password: loginRequest.password,
      role: role
    };

    return this.http.post<any>(`${this.baseUrl}/auth/login`, body, { withCredentials: true }).pipe(
      switchMap(res => {
        const user = res?.user as User;
        if (!user) {
          throw new Error('Login failed');
        }
        // If customer, enrich from customer-service using SSN identifier
        if (role === 'CUSTOMER') {
          const ssn = loginRequest.identifier;
          return this.http.get<any>(`${this.baseUrl}/customers/${ssn}`).pipe(
            switchMap((customer) => {
              // Map backend Customer entity fields to frontend expectations
              const customerName: string | undefined = customer?.customerName;
              const [firstName, ...rest] = (customerName || '').split(' ');
              const mapped: any = {
                ...user,
                // ensure id aligns with how components query customers (SSN-based)
                id: ssn,
                ssn,
                // prefer backend values where available
                firstName: firstName || user.firstName,
                lastName: rest?.join(' ') || user.lastName,
                email: customer?.email ?? user.email,
                address: customer?.address,
                contactNo: customer?.contactNumber,
                accountNo: customer?.accountNumber,
                balance: customer?.balance,
                accountType: customer?.accountType,
                city: customer?.city,
                // keep role uppercase as enforced in the model
                role: 'CUSTOMER'
              };
              if (mapped.accountNo) {
                return this.http.get<{balance: number}>(`${this.baseUrl}/accounts/${mapped.accountNo}/balance`).pipe(
                  map((res) => ({ ...mapped, balance: typeof res.balance === 'number' ? res.balance : mapped.balance }) as User),
                  catchError(() => of(mapped as User))
                );
              }
              return of(mapped as User);
            }),
            map((finalUser) => {
              localStorage.setItem('currentUser', JSON.stringify(finalUser));
              this.currentUserSubject.next(finalUser);
              this.isLoggedInSubject.next(true);
              return finalUser;
            }),
            catchError(() => {
              // If enrichment fails (e.g., no customer record yet), proceed with auth user
              const fallback: User = { ...(user as any), id: ssn } as User;
              (fallback as any).ssn = ssn;
              localStorage.setItem('currentUser', JSON.stringify(fallback));
              this.currentUserSubject.next(fallback);
              this.isLoggedInSubject.next(true);
              return of(fallback);
            })
          );
        }
        // else employees/managers - store as-is
  localStorage.setItem('currentUser', JSON.stringify(user));
  this.currentUserSubject.next(user);
  this.isLoggedInSubject.next(true);
  return of(user);
      }),
      // Flatten in case of non-customer branch above
      map((u: any) => (Array.isArray(u) ? (u[0] as User) : (u as User)))
    );
  }

  register(registration: CustomerRegistration): Observable<User> {
    const payload = {
      username: registration.ssn,
      password: registration.password,
      firstName: registration.firstName,
      lastName: registration.lastName,
      email: registration.email,
      role: 'CUSTOMER' // Convert role to uppercase to match backend expectations
    };

    return this.http.post<any>(`${this.baseUrl}/auth/register`, payload).pipe(
      map(res => res.user as User)
    );
  }

  logout(): void {
    // Inform backend to clear session, but also clear local cache regardless of response
    this.http.post(`${this.baseUrl}/auth/logout`, {}, { withCredentials: true })
      .subscribe({ next: () => {}, error: () => {} });
    localStorage.removeItem('currentUser');
    this.currentUserSubject.next(null);
    this.isLoggedInSubject.next(false);
  }

  getCurrentUser(): User | null {
    return this.currentUserSubject.value;
  }

  isAuthenticated(): boolean {
    return this.isLoggedInSubject.value;
  }

  hasRole(role: string): boolean {
    const user = this.getCurrentUser();
    return user ? user.role === role : false;
  }

  private validateEmployeePassword(password: string): boolean {
    // Password requirements: ≥10 chars, 1 upper, 1 number, 1 special
    const minLength = password.length >= 10;
    const hasUpper = /[A-Z]/.test(password);
    const hasNumber = /\d/.test(password);
    const hasSpecial = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password);
    
    return minLength && hasUpper && hasNumber && hasSpecial;
  }

  // Update and persist current user (e.g., after transactions update balance)
  updateCurrentUser(patch: Partial<User | Customer>): void {
    const current = this.currentUserSubject.value;
    if (!current) return;
    const merged = { ...current, ...patch } as User;
    localStorage.setItem('currentUser', JSON.stringify(merged));
    this.currentUserSubject.next(merged);
  }
}