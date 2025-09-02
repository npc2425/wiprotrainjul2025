import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { BehaviorSubject, Observable, throwError } from 'rxjs';
import { tap, catchError } from 'rxjs/operators';
import { Router } from '@angular/router';

export interface LoginResponse {
  token: string;
  userId: string;
  userType: number;
  success?: boolean;
  message?: string;
  avatar?: string;
  firstName?: string;
  lastName?: string;
  id: number;
}

export interface UserData {
  token: string;
  userId: string;
  userType: number;
  avatar?: string;
  firstName?: string;
  lastName?: string;
  id: number;
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  private userSubject = new BehaviorSubject<UserData | null>(null);
  user$ = this.userSubject.asObservable();

  constructor(private http: HttpClient, private router: Router) {
    const user = localStorage.getItem('user_data');
    if (user) {
      this.userSubject.next(JSON.parse(user));
    }
  }

  login(credentials: any): Observable<LoginResponse> {
    return this.http.post<LoginResponse>('http://localhost:8081/user/login', credentials).pipe(
      tap(response => {
        const userData: UserData = {
          token: response.token,
          userId: response.userId,
          userType: response.userType,
          avatar: response.avatar,
          firstName: response.firstName,
          lastName: response.lastName,
          id: response.id
        };
        console.log(userData);
        localStorage.setItem('user_data', JSON.stringify(userData));
        this.userSubject.next(userData);
      }),
      catchError((error: HttpErrorResponse) => {
        let errorMessage = 'Login failed. Please try again.';
        
        if (error.status === 401 || error.status === 403) {
          errorMessage = 'Invalid username or password. Please check your credentials.';
        } else if (error.status === 0) {
          errorMessage = 'Unable to connect to server. Please check your internet connection.';
        } else if (error.error?.message) {
          errorMessage = error.error.message;
        }
        
        return throwError(() => ({ message: errorMessage, status: error.status }));
      })
    );
  }

  register(user: any): Observable<any> {
    return this.http.post<any>('http://localhost:8081/user/register', user).pipe(
      catchError((error: HttpErrorResponse) => {
        let errorMessage = 'Registration failed. Please try again.';
        
        if (error.status === 400) {
          errorMessage = 'Username already exists or invalid data provided.';
        } else if (error.error?.message) {
          errorMessage = error.error.message;
        }
        
        return throwError(() => ({ message: errorMessage, status: error.status }));
      })
    );
  }

  logout(): void {
    localStorage.removeItem('user_data');
    this.userSubject.next(null);
    this.router.navigate(['/login']);
  }

  getToken(): string  {
    const user = this.userSubject.getValue();
    return user?.token || 'test-token';
  }

  isLoggedIn(): boolean {
    return !!this.userSubject.getValue();
  }

  isAdmin(): boolean {
    const user = this.userSubject.getValue();
    return !!(user && user.userType === 0);
  }

  isCustomer(): boolean {
    const user = this.userSubject.getValue();
    return !!(user && user.userType === 1);
  }

  currentUser(): UserData | null {
    return this.userSubject.getValue();
  }

  checkUsername(username: string): Observable<any> {
    return this.http.post<any>('http://localhost:8081/user/check-username', { userId: username  });
  }

  redirectToDashboard(): void {
    const user = this.currentUser();
    if (user) {
      if (this.isAdmin()) {
        this.router.navigate(['/dashboard']);
      } else {
        this.router.navigate(['/']);
      }
    }
  }
}
