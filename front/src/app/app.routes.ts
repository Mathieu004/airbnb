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
  { path: '**', redirectTo: '' }
];
