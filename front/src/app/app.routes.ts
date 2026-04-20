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
      import('./features/properties/property-list/property-list.component').then(m => m.PropertyListComponent)
  },
  {
    path: 'properties/:id',
    loadComponent: () =>
      import('./features/properties/property-detail/property-detail.component').then(m => m.PropertyDetailComponent)
  },
  {
    path: 'property/edit/:id',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./features/properties/property-edit/property-edit.component').then(m => m.PropertyEditComponent)
  },
  {
    path: 'dashboard',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./features/dashboard/dashboard.component').then(m => m.DashboardComponent)
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
  {
    path: 'calendrier',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./features/calendars/calendar.component').then(m => m.CalendrierComponent)
  },
  {
    path: 'messagerie',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./features/messages/message.component').then(m => m.MessagerieComponent)
  },
];
