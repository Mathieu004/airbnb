import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap, BehaviorSubject } from 'rxjs';
import { environment } from '../../environments/environment';

interface AuthResponse {
  token: string;
  id?: number;
  role?: string;
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  private apiUrl = environment.apiUrl;
  private readonly defaultRole = 'CLIENT';

  private roleSubject = new BehaviorSubject<string | null>(
    localStorage.getItem('currentUserRole') || this.defaultRole
  );

  role$ = this.roleSubject.asObservable();

  constructor(private http: HttpClient) {}

  login(username: string, password: string): Observable<AuthResponse> {
    return this.http
      .post<AuthResponse>(`${this.apiUrl}/auth/login`, { username, password })
      .pipe(
        tap((res) =>
          this.persistSession(res.token, username, res.id, res.role),
        ),
      );
  }

  register(
    username: string,
    email: string,
    password: string,
  ): Observable<AuthResponse> {
    return this.http
      .post<AuthResponse>(`${this.apiUrl}/user`, {
        username,
        email,
        password,
      });
  }

  logout(): void {
    localStorage.removeItem('token');
    localStorage.removeItem('currentUser');
    localStorage.removeItem('currentUserId');
    this.updateLocalRole(this.defaultRole);
  }

  getToken(): string | null {
    return localStorage.getItem('token');
  }

  getCurrentUser(): string | null {
    return localStorage.getItem('currentUser');
  }

  getCurrentUserId(): number | null {
    const id = localStorage.getItem('currentUserId');
    if (id) {
      return parseInt(id, 10);
    }

    const token = this.getToken();
    if (!token) {
      return null;
    }

    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      const tokenUserId = payload?.uid;
      if (typeof tokenUserId === 'number') {
        localStorage.setItem('currentUserId', String(tokenUserId));
        return tokenUserId;
      }
      return null;
    } catch {
      return null;
    }
  }

  getCurrentUserRole(): string | null {
    return localStorage.getItem('currentUserRole') || this.defaultRole;
  }

  updateLocalRole(role: string): void {
    localStorage.setItem('currentUserRole', role);
    this.roleSubject.next(role);
  }

  isLoggedIn(): boolean {
    return !!this.getToken();
  }

  toggleRole(): void {
    const current = this.getCurrentUserRole();
    const next = current === 'HOST' ? 'CLIENT' : 'HOST';
    this.updateLocalRole(next);
  }

  private persistSession(
    token: string,
    username: string,
    id?: number,
    role?: string,
  ): void {
    localStorage.setItem('token', token);
    localStorage.setItem('currentUser', username);
    if (id != null) localStorage.setItem('currentUserId', String(id));

    const currentRole = localStorage.getItem('currentUserRole');
    const initialRole = currentRole === 'HOST' || currentRole === 'CLIENT'
      ? currentRole
      : this.defaultRole;
    this.updateLocalRole(initialRole);
  }
}
