import { Routes } from '@angular/router';
import { LoginComponent } from './components/login/login';
import { DashboardComponent } from './dashboard/dashboard';
import { ChecklistFormComponent } from './checklist/checklist-form/checklist-form';
import { ChecklistListComponent } from './checklist/checklist-list/checklist-list';

import { GuiaClientesComponent } from './guias/guia-clientes/guia-clientes';
import { GuiaListComponent } from './guias/guia-list/guia-list';
import { GuiaFormComponent } from './guias/guia-form/guia-form';

import { ExportacionComponent } from './exportacion/exportacion/exportacion';

/*export const routes: Routes = [
  { path: '', redirectTo: '/login', pathMatch: 'full' },
  { path: 'login', component: LoginComponent },
  // Aquí pondré el dashboard más tarde
];*/




// Como el login ya esta hecho, asumo que el componente de login
// ya existe en su propio archivo. Aqui solo pongo las rutas nuevas.

export const routes: Routes = [
  {
    path: '',
    // Si no esta logueado, va al login
    // Esto lo hice con un guard simple o directamente en el componente
    redirectTo: 'dashboard',
    pathMatch: 'full'
  },
  {
    path: 'dashboard',
    component: DashboardComponent,
    children: [
      {
        path: '',
        redirectTo: 'checklist',
        pathMatch: 'full'
      },
      {
        path: 'checklist',
        children: [
          {
            path: '',
            component: ChecklistListComponent
          },
          {
            path: 'nuevo',
            component: ChecklistFormComponent
          }
        ]
      },
      // ===== GUIAS POR CLIENTE (NUEVO) =====
      {
        path: 'guias',
        children: [
          {
            // Panel principal: lista de clientes
            path: '',
            component: GuiaClientesComponent
          },
          {
            // Dentro de un cliente: lista de guias
            // :idCliente viene de la URL, ej: /dashboard/guias/cliente/3
            path: 'cliente/:idCliente',
            component: GuiaListComponent
          },
          {
            // Formulario para nueva guia dentro de un cliente
            path: 'cliente/:idCliente/nuevo',
            component: GuiaFormComponent
          }
        ]
      }
    ]
  },
  {
    // Ruta por defecto si escriben algo que no existe
    path: '**',
    redirectTo: 'dashboard'
  },

  // ... dentro de children del dashboard:
      // ===== EXPORTACION E IMPRESION (NUEVO) =====
  {
    path: 'exportacion',
    component: ExportacionComponent
  }
  
];