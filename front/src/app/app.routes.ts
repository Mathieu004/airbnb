import { Routes } from '@angular/router';
import { authGuard } from './core/auth.guard';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./features/home/page-home.component').then(m => m.PageHomeComponent)
  },
  {
    path: 'login',
    loadComponent: () =>
      import('./features/auth/login/login.component').then(m => m.LoginComponent)
  },
  {
    path: 'register',
    loadComponent: () =>
      import('./features/auth/register/register.component').then(m => m.RegisterComponent)
  },
  {
    path: 'properties',
    loadComponent: () =>
      import('./features/properties/property-list.component').then(m => m.PropertyListComponent)
  },
  {
    path: 'properties/:id',
    loadComponent: () =>
      import('./features/properties/property-detail.component').then(m => m.PropertyDetailComponent)
  },
  {
    path: 'dashboard',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./features/dashboard/dashboard.component').then(m => m.DashboardComponent)
  },
  {
    path: 'explorar',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./features/Explorar').then(m => m.ExplorarComponent)
  },
  {
    path: 'bookings',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./features/bookings/bookings').then(m => m.BookingsComponent)
  },
  {
    path: 'avis',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./features/reviews/mes-avis/mes-avis.component').then(m => m.MesAvisComponent)
  },
  {
    path: 'parametres',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./features/settings/parametres/parametres.component').then(m => m.ParametresComponent)
  },
];
