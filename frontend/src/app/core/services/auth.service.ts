import { Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { tap } from 'rxjs/operators';
import { User, AuthResponse } from '../models/user.model';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private apiUrl = 'http://localhost:3000/api';
  currentUser = signal<User | null>(this.loadUser());

  constructor(private http: HttpClient, private router: Router) {}

  login(email: string, password: string) {
    return this.http.post<AuthResponse>(`${this.apiUrl}/auth/login`, { email, password }).pipe(
      tap((res) => {
        localStorage.setItem('access_token', res.access_token);
        localStorage.setItem('current_user', JSON.stringify(res.user));
        this.currentUser.set(res.user);
      }),
    );
  }

  logout() {
    localStorage.removeItem('access_token');
    localStorage.removeItem('current_user');
    this.currentUser.set(null);
    this.router.navigate(['/login']);
  }

  getToken(): string | null {
    return localStorage.getItem('access_token');
  }

  isLoggedIn(): boolean {
    return !!this.getToken();
  }

  private loadUser(): User | null {
    const u = localStorage.getItem('current_user');
    return u ? JSON.parse(u) : null;
  }
}
