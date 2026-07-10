import { Component } from '@angular/core';
//import { Router, RouterOutlet } from '@angular/router';
import { RouterOutlet, RouterLink, RouterLinkActive, Router } from '@angular/router';
import { AuthService } from '../services/auth';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [RouterOutlet, RouterLink, RouterLinkActive],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.css'
})
export class DashboardComponent {

  nombreUsuario: string = '';
  rolUsuario: string = '';

  constructor(
    private router: Router,
    private authService: AuthService
  ) {
    // Obtener datos del usuario logueado
    this.nombreUsuario = this.authService.obtenerNombre();
    this.rolUsuario = this.authService.obtenerRol();
  }

  // Cerrar sesion y volver al login
  logout() {
    this.authService.cerrarSesion();
    this.router.navigate(['/login']); // asumo que esta ruta ya existe
  }
}