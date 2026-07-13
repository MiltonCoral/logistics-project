import { Component } from '@angular/core';
import { RouterOutlet, Router } from '@angular/router';
import { AuthService } from '../security/services/auth.service';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [RouterOutlet],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent {
  vistaActiva: string = 'guias';

  constructor(public auth: AuthService, private router: Router) {}

  get nombreUsuario(): string {
    return this.auth.currentUser()?.nombre ?? 'Usuario';
  }

  get rolUsuario(): string {
    return this.auth.currentUser()?.rol ?? '';
  }

  navigateTo(view: string): void {
    this.vistaActiva = view;
    if (view === 'guias') {
      this.router.navigate(['/dashboard/guias']);
    }
  }

  logout() {
    this.auth.logout();
  }
}