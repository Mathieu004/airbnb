import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { environment } from '../../environments/environment';

interface AuthResponse {
  token: string;
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  private apiUrl = environment.apiUrl;

  constructor(private http: HttpClient) {}

  login(username: string, password: string): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.apiUrl}/auth/login`, { username, password })
      .pipe(tap(res => this.persistSession(res.token, username)));
  }

  register(username: string, email: string, password: string): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.apiUrl}/auth/register`, { username, email, password })
      .pipe(tap(res => this.persistSession(res.token, username)));
  }

  logout(): void {
    localStorage.removeItem('token');
    localStorage.removeItem('currentUser');
  }

  getToken(): string | null {
    return localStorage.getItem('token');
  }

  getCurrentUser(): string | null {
    return localStorage.getItem('currentUser');
  }

  isLoggedIn(): boolean {
    return !!this.getToken();
  }

  private persistSession(token: string, username: string): void {
    localStorage.setItem('token', token);
    localStorage.setItem('currentUser', username);
  }
}
