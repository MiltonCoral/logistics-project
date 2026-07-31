import { Routes } from '@angular/router';
import { LoginComponent } from './login/login.component';
import { DashboardComponent } from './dashboard/dashboard.component';
import { ClientesComponent } from './guias-cliente/guias-cliente.component';
import { ListaGuiasComponent } from './guias-cliente/lista-guias/lista-guias.component';
import { authGuard, noAuthGuard } from './security/guards/auth.guard';
import { SubirGuiaComponent } from './guias-cliente/forms/subir-guia/subir-guia.component';

export const routes: Routes = [
  { path: '', component: LoginComponent, canActivate: [noAuthGuard] },
  {
    path: 'dashboard',
    component: DashboardComponent,
    canActivate: [authGuard],
    children: [
      { path: 'guias', component: ClientesComponent },
      { path: 'guias/cliente/:idCliente', component: ListaGuiasComponent },
      { path: 'guias/cliente/:idCliente/nuevo', component: SubirGuiaComponent }
    ]
  }
];