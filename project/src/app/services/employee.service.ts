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

  getEmployees(page: number = 1, pageSize: number = 8): Observable<{employees: Employee[], total: number}> {
    return this.http.get<Employee[]>(`${this.baseUrl}`).pipe(
      map(list => {
        this.employeesSubject.next(list || []);
        const startIndex = (page - 1) * pageSize;
        const endIndex = startIndex + pageSize;
        const slice = (list || []).slice(startIndex, endIndex);
        return { employees: slice, total: (list || []).length };
      })
    );
  }

  getEmployeeById(id: string): Observable<Employee | null> {
    return this.http.get<Employee>(`${this.baseUrl}/${id}`).pipe(map(e => e || null));
  }

  createEmployee(employee: Partial<Employee>): Observable<Employee> {
    return this.http.post<Employee>(`${this.baseUrl}`, employee as any);
  }

  updateEmployee(id: string, updates: Partial<Employee>): Observable<Employee> {
    const payload = { ...updates } as any;
    delete (payload as any).id;
    delete (payload as any).role;
    return this.http.put<Employee>(`${this.baseUrl}/${id}`, payload);
  }

  deleteEmployee(id: string): Observable<boolean> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`).pipe(map(() => true));
  }
}