import { Component, OnInit } from '@angular/core';
import { Router, RouterOutlet, NavigationEnd } from '@angular/router';
import { NavbarComponent } from './layout/navbar/navbar.component';
import { SidebarComponent } from './layout/sidebar/sidebar.component';
import { CommonModule } from '@angular/common';
import { filter } from 'rxjs/operators';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, NavbarComponent, SidebarComponent, CommonModule],
  template: `

    <ng-container *ngIf="isPublicPage">
      <app-navbar></app-navbar>
      <router-outlet></router-outlet>
    </ng-container>

    <div class="app-layout" *ngIf="!isPublicPage">
      <app-sidebar></app-sidebar>
      <div class="main">
        <router-outlet></router-outlet>
      </div>
    </div>
  `,
  styleUrl: './app.component.css'
})
export class AppComponent implements OnInit {
  isPublicPage = true;

  private publicRoutes = ['/', '/login', '/register', '/home'];

  constructor(private router: Router) {}

  ngOnInit(): void {
    this.isPublicPage = this.publicRoutes.includes(this.router.url);

    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd)
    ).subscribe((event: any) => {
      this.isPublicPage = this.publicRoutes.includes(event.urlAfterRedirects);
    });
  }
}
