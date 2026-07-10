import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { environment } from '../../environments/environment';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = environment.apiUrl;

  constructor(private http: HttpClient, private router: Router) { }

  // Método para hacer login
  login(username: string, password: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/auth/login`, { username, password });
  }

  // Guardar el token en el localStorage del navegador
  guardarToken(token: string): void {
    localStorage.setItem('token', token);
  }

  // Obtener el token (para mandarlo en futuras peticiones)
  obtenerToken(): string | null {
    return localStorage.getItem('token');
  }

  // Saber si el usuario ya está logueado
  estaLogueado(): boolean {
    return !!this.obtenerToken();
  }

  // Cerrar sesión
  logout(): void {
    localStorage.removeItem('token');
    this.router.navigate(['/login']);
  }

 // Cerrar sesion
  cerrarSesion() {
    localStorage.removeItem('token');
    localStorage.removeItem('nombre');
    localStorage.removeItem('rol');
  }

  // Obtener el nombre del usuario guardado
  obtenerNombre(): string {
    return localStorage.getItem('nombre') || '';
  }

  // Obtener el rol del usuario guardado
  obtenerRol(): string {
    return localStorage.getItem('rol') || '';
  }

  
}