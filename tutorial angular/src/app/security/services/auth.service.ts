import { Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { LoginRequest, LoginResponse, UsuarioAuth } from '../models/auth.models';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly API_URL = 'http://localhost:8080/api/auth';
  private readonly TOKEN_KEY = 'logistica_token';
  private readonly USER_KEY = 'logistica_user';

  // Signals reactivos para el estado de autenticación
  readonly isAuthenticated = signal<boolean>(this.hasToken());
  readonly currentUser = signal<UsuarioAuth | null>(this.getUserFromStorage());

  constructor(private http: HttpClient, private router: Router) {}

  login(credentials: LoginRequest) {
    return this.http.post<LoginResponse>(`${this.API_URL}/login`, credentials);
  }

  handleLoginSuccess(response: LoginResponse) {
    if (response.token && response.nombre && response.rol) {
      localStorage.setItem(this.TOKEN_KEY, response.token);
      
      const user: UsuarioAuth = {
        nombre: response.nombre,
        rol: response.rol as 'GERENTE' | 'ASISTENTE'
      };
      localStorage.setItem(this.USER_KEY, JSON.stringify(user));

      this.isAuthenticated.set(true);
      this.currentUser.set(user);
      
      this.router.navigate(['/dashboard']);
    }
  }

  logout() {
    localStorage.removeItem(this.TOKEN_KEY);
    localStorage.removeItem(this.USER_KEY);
    this.isAuthenticated.set(false);
    this.currentUser.set(null);
    this.router.navigate(['/']);
  }

  getToken(): string | null {
    return localStorage.getItem(this.TOKEN_KEY);
  }

  private hasToken(): boolean {
    return !!this.getToken();
  }

  private getUserFromStorage(): UsuarioAuth | null {
    const stored = localStorage.getItem(this.USER_KEY);
    return stored ? JSON.parse(stored) : null;
  }
}