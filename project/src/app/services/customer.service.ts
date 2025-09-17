import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, of, throwError, forkJoin } from 'rxjs';
import { map, switchMap, catchError, tap } from 'rxjs/operators';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments';
import { Customer, Transaction } from '../models/user.model';

@Injectable({
  providedIn: 'root'
})
export class CustomerService {
  private customersSubject = new BehaviorSubject<Customer[]>([]);
  public customers$ = this.customersSubject.asObservable();

  private transactionsSubject = new BehaviorSubject<Transaction[]>([]);
  public transactions$ = this.transactionsSubject.asObservable();

  // Use the global API base (proxied /api) so each resource resolves to the right microservice
  private readonly baseUrl = `${environment.apiBase}`;
 

 


  private mapBackendCustomer(c: any): Customer {
    if (!c) return c as Customer;
    const name: string = c.customerName || '';
    const [firstName, ...rest] = name.split(' ');
    const gender = c.gender === 'M' ? 'male' : c.gender === 'F' ? 'female' : 'other';
    const accountType = (c.accountType || '').toLowerCase();
    const mapped: any = {
      // User fields
      id: c.ssnId || c.id,
      ssn: c.ssnId || c.id,
      firstName: firstName || c.firstName || '',
      lastName: rest.join(' '),
      email: c.email || '',
      password: '',
      role: 'CUSTOMER',
      isActive: true,
      createdAt: new Date(),
      // Customer-specific
      accountNo: c.accountNumber || c.accountNo || '',
      ifscCode: c.ifscCode || '', // may be undefined in backend
      balance: typeof c.balance === 'number' ? c.balance : 0,
      aadhaarNo: c.aadharNumber || c.aadhaarNo || '',
      panNo: c.panNumber || c.panNo || '',
      dateOfBirth: c.dateOfBirth ? new Date(c.dateOfBirth) : undefined,
      gender,
      maritalStatus: 'single', // backend doesn't provide; default
      address: c.address || '',
      contactNo: c.contactNumber || c.contactNo || '',
      accountType: accountType === 'current' ? 'current' : accountType === 'savings' ? 'savings' : 'savings',
      city: c.city || '',
      age: typeof c.age === 'number' ? c.age : (c.dateOfBirth ? new Date().getFullYear() - new Date(c.dateOfBirth).getFullYear() : 0),
    };
    return mapped as Customer;
  }

  private mapBackendTransaction(t: any): Transaction {
    if (!t) return t as Transaction;
    const typeRaw = (t.type || t.transactionType || '').toString().toLowerCase();
    let type: 'deposit' | 'withdraw' | 'transfer' = 'deposit';
    if (typeRaw.includes('with')) type = 'withdraw';
    else if (typeRaw.includes('trans')) type = 'transfer';
    else type = 'deposit';
    return {
      id: t.id?.toString?.() || t.transactionId?.toString?.() || `${Date.now()}`,
      customerId: t.customerId?.toString?.() || '',
      accountNo: t.accountNo || t.accountNumber || t.sourceAccount || '',
      type,
      amount: Number(t.amount) || 0,
      balance: Number(t.balance) || Number(t.currentBalance) || 0,
      description: t.description || t.note || `${type.toUpperCase()} transaction`,
      timestamp: t.timestamp ? new Date(t.timestamp) : new Date(),
      toAccountNo: t.toAccountNo || t.destinationAccount,
      fromAccountNo: t.fromAccountNo || t.sourceAccount
    } as Transaction;
  }

  constructor(private http: HttpClient) {}

  getCustomers(page: number = 1, pageSize: number = 8): Observable<{customers: Customer[], total: number}> {
    return this.http.get<any[]>(`${this.baseUrl}/customers`).pipe(
      map(list => (list || []).map(c => this.mapBackendCustomer(c))),
      switchMap(customers => this.hydrateBalances(customers)),
      map(customersWithBalances => {
        this.customersSubject.next(customersWithBalances);
        const startIndex = (page - 1) * pageSize;
        const endIndex = startIndex + pageSize;
        const slice = (customersWithBalances || []).slice(startIndex, endIndex);
        return { customers: slice, total: (customersWithBalances || []).length };
      })
    );
  }

  getActiveCustomers(page: number = 1, pageSize: number = 8): Observable<{customers: Customer[], total: number}> {
    return this.getCustomers(page, pageSize); // No active flag in API; returning all for now
  }

  getCustomerById(id: string): Observable<Customer | null> {
    // Backend identifies customers by SSN; components pass id from mock user
    // Fetch customer, then ALWAYS hydrate balance from account-service if accountNo exists
    return this.http.get<any>(`${this.baseUrl}/customers/${id}`).pipe(
      map(c => (c ? this.mapBackendCustomer(c) : null)),
      switchMap((cust) => {
        if (!cust || !cust.accountNo) return of(cust);
        return this.http.get<{ balance: number }>(`${this.baseUrl}/accounts/${cust.accountNo}/balance`).pipe(
          map((res) => ({ ...cust, balance: typeof res.balance === 'number' ? res.balance : cust.balance } as Customer)),
          catchError(() => of(cust))
        );
      }),
      catchError(() => of(null))
    );
  }

  searchCustomerBySSN(ssn: string): Observable<Customer | null> {
    return this.http.get<any>(`${this.baseUrl}/customers/${ssn}`).pipe(
      map(c => (c ? this.mapBackendCustomer(c) : null)),
      catchError(() => of(null))
    );
  }

  checkAccountExists(accountNo: string): Observable<boolean> {
    if (!accountNo) return of(false);
    return this.http.get<boolean>(`${this.baseUrl}/customers/exists/account/${accountNo}`).pipe(
      catchError(() => of(false))
    );
  }

  createCustomer(customer: Partial<Customer>): Observable<Customer> {
    // Build backend payload mapping UI fields to service expectations
    const fullName = `${customer.firstName || ''} ${customer.lastName || ''}`.trim();
    // Normalize date to yyyy-MM-dd
    const dob = customer.dateOfBirth instanceof Date
      ? (customer.dateOfBirth as Date).toISOString().slice(0, 10)
      : (typeof customer.dateOfBirth === 'string' ? customer.dateOfBirth : undefined);
    // Gender M/F only
    const genderField = customer.gender === 'male' ? 'M' : customer.gender === 'female' ? 'F' : undefined;
    // Account type title case expected by backend
    const accountTypeField = customer.accountType === 'current' ? 'Current' : customer.accountType === 'savings' ? 'Savings' : undefined;
    // Helpers for normalization
    const onlyDigits = (v: any) => (v ?? '').toString().replace(/\D/g, '');
    const upperTrim = (v: any) => (v ?? '').toString().trim().toUpperCase();

    const payload: any = {
      ssnId: customer.ssn || customer.id,
      customerName: fullName || undefined,
      email: customer.email,
      contactNumber: onlyDigits(customer.contactNo).slice(-10),
      aadharNumber: onlyDigits(customer.aadhaarNo).slice(0, 12),
      panNumber: upperTrim(customer.panNo).slice(0, 10),
      dateOfBirth: dob,
      gender: genderField,
      address: (customer.address || '').toString().trim(),
      city: customer.city,
      age: customer.age,
      accountNumber: (customer.accountNo || '').toString().trim(),
      accountType: accountTypeField,
      initialDeposit: (customer as any).initialDeposit ?? (typeof customer.balance === 'number' && customer.balance > 0 ? customer.balance : undefined),
    };
    // Drop empty/undefined
    Object.keys(payload).forEach(k => (payload[k] == null || payload[k] === '') && delete payload[k]);

    // Validate required fields for creation
    const required = ['ssnId','customerName','email','address','contactNumber','aadharNumber','panNumber','accountNumber','initialDeposit'];
    const missing = required.filter(k => payload[k] === undefined);
    if (missing.length) {
      return throwError(() => new Error(`Missing required fields: ${missing.join(', ')}`));
    }

    return this.http.post<any>(`${this.baseUrl}/customers`, payload).pipe(
      switchMap((resp) => this.http.get<any>(`${this.baseUrl}/customers/${payload.ssnId}`)),
      map((created) => this.mapBackendCustomer(created))
    );
  }

  updateCustomer(id: string, updates: Partial<Customer>): Observable<Customer> {
    // Merge current backend record with updates and map to backend keys
    return this.http.get<any>(`${this.baseUrl}/customers/${id}`).pipe(
      catchError(() => of(null)),
      map((existing) => existing || {}),
      map((existing) => {
        const current = Object.keys(existing).length ? this.mapBackendCustomer(existing) : ({} as Partial<Customer>);
        const merged: Partial<Customer> = { ...current, ...updates };
        // Normalize date to yyyy-MM-dd string if Date
        const dob = merged.dateOfBirth instanceof Date
          ? (merged.dateOfBirth as Date).toISOString().slice(0, 10)
          : merged.dateOfBirth;
        const fullName = `${merged.firstName || ''} ${merged.lastName || ''}`.trim();
        // Map gender to backend constraints (M|F only). Omit if other/unknown.
        const genderField = merged.gender === 'male' ? 'M' : merged.gender === 'female' ? 'F' : undefined;
        // Map accountType to backend expected casing (Current|Savings)
        const accountTypeField = merged.accountType === 'current' ? 'Current' : merged.accountType === 'savings' ? 'Savings' : undefined;
        // Ensure required field initialDeposit is present for backend @Valid
        const initialDeposit = existing?.initialDeposit ?? (typeof merged.balance === 'number' ? merged.balance : 1);
        const backendPayload: any = {
          ssnId: merged.ssn || merged.id,
          customerName: fullName || undefined,
          email: merged.email,
          contactNumber: merged.contactNo,
          aadharNumber: merged.aadhaarNo,
          panNumber: merged.panNo,
          dateOfBirth: dob,
          gender: genderField,
          address: merged.address,
          city: merged.city,
          age: merged.age,
          accountNumber: merged.accountNo,
          accountType: accountTypeField,
          balance: merged.balance,
          initialDeposit,
        };
        Object.keys(backendPayload).forEach(k => (backendPayload[k] == null || backendPayload[k] === '') && delete backendPayload[k]);
        return backendPayload;
      }),
      switchMap((payload) =>
        this.http.put<any>(`${this.baseUrl}/customers/${id}`, payload).pipe(
          // Always fetch latest after update to ensure we have the current state
          switchMap(() => this.http.get<any>(`${this.baseUrl}/customers/${id}`)),
          // If PUT fails (e.g., 404 Not Found), try creating instead
          catchError((err) => {
            // Only attempt creation if required fields are present
            // Required by backend: ssnId, customerName, email, address, contactNumber, aadharNumber, panNumber, accountNumber, initialDeposit (>0)
            const createPayload: any = { ...payload };
            // Derive initialDeposit from balance if provided and > 0
            if (typeof createPayload.initialDeposit === 'undefined' && typeof createPayload.balance === 'number' && createPayload.balance > 0) {
              createPayload.initialDeposit = createPayload.balance;
            }
            // Validate minimal creation fields
            const required = ['ssnId','customerName','email','address','contactNumber','aadharNumber','panNumber','accountNumber','initialDeposit'];
            const hasAll = required.every(k => createPayload[k] !== undefined && createPayload[k] !== '');
            if (hasAll) {
              // Remove balance if initialDeposit will set balance at creation
              if (createPayload.initialDeposit) delete createPayload.balance;
              return this.http.post<any>(`${this.baseUrl}/customers`, createPayload).pipe(
                switchMap(() => this.http.get<any>(`${this.baseUrl}/customers/${id}`))
              );
            }
            // If not enough data to create, rethrow so component can show a helpful message
            throw err;
          })
        )
      ),
      map((updated) => this.mapBackendCustomer(updated))
    );
  }

  deleteCustomer(id: string): Observable<boolean> {
    return this.http.delete<void>(`${this.baseUrl}/customers/${id}`).pipe(
      map(() => true)
    );
  }

  // Helper to ensure an account exists in account-service before transactions
  private ensureAccountExists(cust: Customer): Observable<Customer> {
    const getUrl = `${this.baseUrl}/accounts/${cust.accountNo}`;
    return this.http.get<any>(getUrl).pipe(
      map(() => cust),
      catchError(() => {
        const accountType = cust.accountType === 'current' ? 'Current' : 'Savings';
        const body = {
          accountType,
          accountNumber: cust.accountNo,
          accountHolderName: `${cust.firstName || ''} ${cust.lastName || ''}`.trim() || 'Customer',
          initialBalance: typeof cust.balance === 'number' ? cust.balance : 0,
          customerSsn: cust.ssn
        };
        return this.http.post<any>(`${this.baseUrl}/accounts`, body).pipe(map(() => cust));
      })
    );
  }

  // Banking operations
  deposit(customerId: string, amount: number): Observable<{customer: Customer, transaction: Transaction}> {
    return this.getCustomerById(customerId).pipe(
      switchMap((cust) => {
        if (!cust || !cust.accountNo) throw new Error('Customer not found or missing account');
        return this.ensureAccountExists(cust);
      }),
      switchMap((cust) => {
        const url = `${this.baseUrl}/accounts/${cust.accountNo}/deposit`;
        const body = { amount };
        return this.http.post<any>(url, body).pipe(
          map((tx: any) => this.mapBackendTransaction(tx)),
          switchMap((normalized) =>
            this.http.get<{balance: number}>(`${this.baseUrl}/accounts/${cust.accountNo}/balance`).pipe(
              map(res => ({ normalized, latestBalance: typeof res.balance === 'number' ? res.balance : (cust.balance + amount) })),
              catchError(() => of({ normalized, latestBalance: (cust.balance + amount) }))
            )
          ),
          map(({ normalized, latestBalance }) => {
            const updatedCustomer = { ...cust, balance: latestBalance } as Customer;
            this.patchCustomer(updatedCustomer);
            return { customer: updatedCustomer, transaction: normalized };
          })
        );
      })
    );
  }

  withdraw(customerId: string, amount: number): Observable<{customer: Customer, transaction: Transaction}> {
    return this.getCustomerById(customerId).pipe(
      switchMap((cust) => {
        if (!cust || !cust.accountNo) throw new Error('Customer not found or missing account');
        return this.ensureAccountExists(cust);
      }),
      switchMap((cust) => {
        const url = `${this.baseUrl}/accounts/${cust.accountNo}/withdraw`;
        const body = { amount };
        return this.http.post<any>(url, body).pipe(
          map((tx: any) => this.mapBackendTransaction(tx)),
          switchMap((normalized) =>
            this.http.get<{balance: number}>(`${this.baseUrl}/accounts/${cust.accountNo}/balance`).pipe(
              map(res => ({ normalized, latestBalance: typeof res.balance === 'number' ? res.balance : (cust.balance - amount) })),
              catchError(() => of({ normalized, latestBalance: (cust.balance - amount) }))
            )
          ),
          map(({ normalized, latestBalance }) => {
            const updatedCustomer = { ...cust, balance: latestBalance } as Customer;
            this.patchCustomer(updatedCustomer);
            return { customer: updatedCustomer, transaction: normalized };
          })
        );
      })
    );
  }

  transfer(fromCustomerId: string, toAccountNo: string, amount: number): Observable<{fromCustomer: Customer, transaction: Transaction}> {
    return this.getCustomerById(fromCustomerId).pipe(
      switchMap((fromCust) => {
        if (!fromCust || !fromCust.accountNo) throw new Error('Source customer not found or missing account');
        return this.ensureAccountExists(fromCust);
      }),
      switchMap((fromCust) => {
        const url = `${this.baseUrl}/accounts/transfer`;
        const body = { sourceAccount: fromCust.accountNo, destinationAccount: toAccountNo, amount };
        return this.http.post<any>(url, body).pipe(
          map((tx: any) => this.mapBackendTransaction(tx)),
          switchMap((normalized) =>
            this.http.get<{balance: number}>(`${this.baseUrl}/accounts/${fromCust.accountNo}/balance`).pipe(
              map(res => ({ normalized, latestBalance: typeof res.balance === 'number' ? res.balance : (fromCust.balance - amount) })),
              catchError(() => of({ normalized, latestBalance: (fromCust.balance - amount) }))
            )
          ),
          map(({ normalized, latestBalance }) => {
            const updatedCustomer = { ...fromCust, balance: latestBalance } as Customer;
            this.patchCustomer(updatedCustomer);
            return { fromCustomer: updatedCustomer, transaction: normalized };
          })
        );
      })
    );
  }

  getTransactions(customerId: string, page: number = 1, pageSize: number = 10): Observable<{transactions: Transaction[], total: number}> {
    return this.getCustomerById(customerId).pipe(
      switchMap((cust) => {
        if (!cust || !cust.accountNo) {
          return of({ transactions: [], total: 0 });
        }
        const accountNo = cust.accountNo;
        const url = `${this.baseUrl}/accounts/${accountNo}/transactions`;

        return forkJoin({
          txs: this.http.get<any[]>(url).pipe(catchError(() => of([]))),
          bal: this.http.get<{balance: number}>(`${this.baseUrl}/accounts/${accountNo}/balance`).pipe(
            catchError(() => of({ balance: 0 }))
          )
        }).pipe(
          map(({ txs, bal }) => {
            const normalized = (txs || []).map(t => this.mapBackendTransaction(t));
            // Ensure newest first (desc) by timestamp
            const sorted = [...normalized].sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

            // Compute running balances from current balance backwards
            let running = typeof bal.balance === 'number' ? bal.balance : 0;
            const withBalances = sorted.map((tx) => {
              const signedDelta = (() => {
                if (tx.type === 'deposit') return +tx.amount;
                if (tx.type === 'withdraw') return -tx.amount;
                // transfer: sign depends on direction relative to this account
                if (tx.type === 'transfer') {
                  if (tx.fromAccountNo && tx.fromAccountNo === accountNo) return -tx.amount;
                  if (tx.toAccountNo && tx.toAccountNo === accountNo) return +tx.amount;
                }
                return 0;
              })();
              const txWithBal: Transaction = { ...tx, balance: running };
              // Move running balance backwards for the next (older) transaction
              running = running - signedDelta;
              return txWithBal;
            });

            const startIndex = (page - 1) * pageSize;
            const endIndex = startIndex + pageSize;
            const slice = withBalances.slice(startIndex, endIndex) as Transaction[];
            return { transactions: slice, total: withBalances.length };
          }),
          catchError(() => of({ transactions: [], total: 0 }))
        );
      }),
      catchError(() => of({ transactions: [], total: 0 }))
    );
  }

  // --- New helpers for keeping balance in sync with account-service ---
  private hydrateBalances(customers: Customer[]): Observable<Customer[]> {
    if (!customers || customers.length === 0) return of(customers);
    const requests = customers
      .filter(c => !!c.accountNo)
      .map(c => this.http.get<{balance: number}>(`${this.baseUrl}/accounts/${c.accountNo}/balance`).pipe(
        map(res => ({ accountNo: c.accountNo, balance: typeof res.balance === 'number' ? res.balance : c.balance })),
        catchError(() => of({ accountNo: c.accountNo, balance: c.balance }))
      ));
    if (requests.length === 0) return of(customers);
    return forkJoin(requests).pipe(
      map(results => {
        const balanceMap = new Map(results.map(r => [r.accountNo, r.balance]));
        return customers.map(c => balanceMap.has(c.accountNo) ? { ...c, balance: balanceMap.get(c.accountNo)! } : c);
      })
    );
  }

  private patchCustomer(updated: Customer): void {
    const list = this.customersSubject.getValue();
    const idx = list.findIndex(c => c.id === updated.id);
    if (idx !== -1) {
      const newList = [...list];
      newList[idx] = updated;
      this.customersSubject.next(newList);
    }
  }

  refreshCustomerBalance(customerId: string): Observable<Customer | null> {
    return this.getCustomerById(customerId).pipe(
      switchMap(cust => {
        if (!cust || !cust.accountNo) return of(cust);
        return this.http.get<{balance: number}>(`${this.baseUrl}/accounts/${cust.accountNo}/balance`).pipe(
          map(res => ({ ...cust, balance: res.balance } as Customer)),
          catchError(() => of(cust))
        );
      }),
      tap(updated => { if (updated) this.patchCustomer(updated); }),
      catchError(() => of(null))
    );
  }
}