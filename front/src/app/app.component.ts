import { Component } from '@angular/core';
import { Router, RouterOutlet } from '@angular/router';
import { NavbarComponent } from './layout/navbar/navbar.component';
import { SidebarComponent } from './layout/sidebar/sidebar.component';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, NavbarComponent, SidebarComponent, CommonModule],
  template: `
    <!-- Pages publiques : home, login, register → pas de sidebar -->
    <ng-container *ngIf="isPublicPage()">
      <app-navbar></app-navbar>
      <router-outlet></router-outlet>
    </ng-container>

    <!-- Pages privées : dashboard, properties... → avec sidebar -->
    <div class="app-layout" *ngIf="!isPublicPage()">
      <app-sidebar></app-sidebar>
      <div class="main">
        <router-outlet></router-outlet>
      </div>
    </div>
  `,
  styleUrl: './app.component.css'
})
export class AppComponent {
  constructor(private router: Router) {}

  isPublicPage(): boolean {
    const publicRoutes = ['/', '/login', '/register', '/home'];
    return publicRoutes.includes(this.router.url);
  }
}