import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments';
import { Employee } from '../models/user.model';

@Injectable({
  providedIn: 'root'
})
export class EmployeeService {
  private employeesSubject = new BehaviorSubject<Employee[]>([]);
  public employees$ = this.employeesSubject.asObservable();
  private readonly baseUrl = `${environment.apiBase}/employees`;

  constructor(private http: HttpClient) {}

  private mapBackendEmployee(e: any): Employee {
    if (!e) return e as Employee;
    const mapped: any = {
      // Ensure a generic id used by components
      id: (e.employeeId ?? e.id)?.toString?.() || e.employeeId || e.id,
      empId: (e.employeeId ?? e.id)?.toString?.() || '',
      firstName: e.firstName || '',
      lastName: e.lastName || '',
      email: e.email || '',
      // Frontend uses 'department' for display; backend uses 'designation'
      department: e.designation || '',
      // Extra fields from backend (may not exist in UI model but useful for edit)
      contactNo: e.contactNumber || '',
      salary: typeof e.salary === 'number' ? e.salary : (e.salary ? Number(e.salary) : 0),
      // UI-only defaults
      address: (e as any).address || '',
      dateOfBirth: (e as any).dateOfBirth,
      isActive: (e as any).isActive ?? true,
    };
    return mapped as Employee;
  }

  private mapToBackendPayload(updates: Partial<Employee>): any {
    const onlyDigits = (v: any) => (v ?? '').toString().replace(/\D/g, '').slice(-10);
    const designation = (updates as any).designation || (updates as any).department || '';
    const salaryVal = (updates as any).salary;
    const payload: any = {
      firstName: updates.firstName,
      lastName: updates.lastName,
      email: updates.email,
      contactNumber: onlyDigits((updates as any).contactNo || (updates as any).contactNumber),
      designation: designation,
      salary: typeof salaryVal === 'number' ? salaryVal : (salaryVal ? Number(salaryVal) : undefined),
    };
    // Drop empty
    Object.keys(payload).forEach(k => (payload[k] == null || payload[k] === '') && delete payload[k]);
    return payload;
  }

  getEmployees(page: number = 1, pageSize: number = 8): Observable<{employees: Employee[], total: number}> {
    return this.http.get<any[]>(`${this.baseUrl}`).pipe(
      map(list => (list || []).map(e => this.mapBackendEmployee(e))),
      map(mapped => {
        this.employeesSubject.next(mapped);
        const startIndex = (page - 1) * pageSize;
        const endIndex = startIndex + pageSize;
        const slice = (mapped || []).slice(startIndex, endIndex);
        return { employees: slice, total: (mapped || []).length };
      })
    );
  }

  getEmployeeById(id: string): Observable<Employee | null> {
    return this.http.get<any>(`${this.baseUrl}/${id}`).pipe(map(e => e ? this.mapBackendEmployee(e) : null));
  }

  createEmployee(employee: Partial<Employee>): Observable<Employee> {
    const payload = this.mapToBackendPayload(employee);
    return this.http.post<any>(`${this.baseUrl}`, payload).pipe(
      map(resp => this.mapBackendEmployee(resp))
    );
  }

  updateEmployee(id: string, updates: Partial<Employee>): Observable<Employee> {
    const payload = this.mapToBackendPayload(updates);
    return this.http.put<any>(`${this.baseUrl}/${id}`, payload).pipe(
      map(resp => this.mapBackendEmployee(resp))
    );
  }

  deleteEmployee(id: string): Observable<boolean> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`).pipe(map(() => true));
  }
}