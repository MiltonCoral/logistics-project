import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { AuthService } from '../security/services/auth.service';
import { HttpErrorResponse } from '@angular/common/http';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, RouterModule], // ← Sin FormsModule
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent {
  error = signal<string>('');

  constructor(private authService: AuthService) {}

  login(username: string, password: string) {
    this.error.set('');

    if (!username || !password) {
      this.error.set('Usuario y contraseña son obligatorios');
      return;
    }

    this.authService.login({ username, password }).subscribe({
      next: (res) => {
        if (res.success) {
          this.authService.handleLoginSuccess(res);
        } else {
          this.error.set(res.message || 'Error');
        }
      },
      error: (err: HttpErrorResponse) => {
        if (err.status === 0) {
          this.error.set('Error de servidor. Intenta más tarde.');
        } else if (err.status === 401 || err.status === 403) {
          this.error.set('Usuario o contraseña incorrectos');
        } else {
          this.error.set('Ocurrió un error inesperado');
        }
      }
    });
  }
}