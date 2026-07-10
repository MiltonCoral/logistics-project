import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../services/auth';
import { Router } from '@angular/router';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './login.html',
  styleUrls: ['./login.css']
})
export class LoginComponent {
  username: string = '';
  password: string = '';
  errorMensaje: string = '';
  cargando: boolean = false;

  constructor(private authService: AuthService, private router: Router) { }

  iniciarSesion() {
    this.cargando = true;
    this.errorMensaje = '';

    this.authService.login(this.username, this.password).subscribe({
      next: (response: any) => {
        // Si el backend dice que fue exitoso
        if (response.success) {
          this.authService.guardarToken(response.token);
          alert('Bienvenido ' + response.nombre); // Modo junior: una alerta simple jaja
          this.router.navigate(['/dashboard']); // Ir a una página protegida
        } else {
          this.errorMensaje = response.message;
        }
        this.cargando = false;
      },
      error: (err) => {
        // Si el backend responde con error (ej. contraseña incorrecta)
        this.errorMensaje = 'Usuario o contraseña incorrectos.';
        this.cargando = false;
        console.error('Error en login:', err);
      }
    });
  }
}