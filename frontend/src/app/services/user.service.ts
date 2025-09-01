import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { catchError } from 'rxjs/operators';

export interface User {
  id: number;
  firstName: string;
  lastName: string;
  userId: string;
  email: string;
  userType: number;
  createdAt: string;
  orderCount?: number;
}

@Injectable({
  providedIn: 'root'
})
export class UserService {
  private apiUrl = 'http://localhost:8081/user';

  constructor(private http: HttpClient) {}

  getAllUsers(): Observable<User[]> {
    return this.http.get<User[]>(this.apiUrl).pipe(
      catchError(error => {
        console.error('Error fetching users:', error);
        return of([]);
      })
    );
  }

  getUserById(id: number): Observable<User | null> {
    return this.http.get<User>(`${this.apiUrl}/${id}`).pipe(
      catchError(error => {
        console.error('Error fetching user:', error);
        return of(null);
      })
    );
  }

  updateUser(id: number, user: Partial<User>): Observable<User> {
    return this.http.put<User>(`${this.apiUrl}/profile/${id}`, user);
  }

  deleteUser(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  createAdminUser(user: Omit<User, 'id' | 'createdAt'>): Observable<User> {
    return this.http.post<User>(`${this.apiUrl}/admin`, user);
  }
}
