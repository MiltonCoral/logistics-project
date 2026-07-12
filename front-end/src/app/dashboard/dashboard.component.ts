import { Component } from '@angular/core';
import { ClientesComponent } from '../guias-cliente/guias-cliente.component';
import { AuthService } from '../security/services/auth.service';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [ClientesComponent],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent {
  vistaActiva: string = '';

  constructor(public auth: AuthService) {}

  get nombreUsuario(): string {
    return this.auth.currentUser()?.nombre ?? 'Usuario';
  }

  get rolUsuario(): string {
    return this.auth.currentUser()?.rol ?? '';
  }

  logout() {
    this.auth.logout();
  }
}