import { Component, OnInit } from '@angular/core';
import { Router, RouterOutlet, NavigationEnd } from '@angular/router';
import { NavbarComponent } from './layout/navbar/navbar.component';
import { SidebarComponent } from './layout/sidebar/sidebar.component';
import { CommonModule } from '@angular/common';
import { filter } from 'rxjs/operators';
import { AuthService } from './core/auth.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, NavbarComponent, SidebarComponent, CommonModule],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent implements OnInit {
  isMinimalPage = false;
  isSidebarCollapsed = false;


  private minimalRoutes = ['/', '/login', '/register'];

  constructor(
    private router: Router,
    public auth: AuthService
  ) {}

  private checkIfMinimalRoute(url: string): boolean {
    return this.minimalRoutes.includes(url);
  }

  ngOnInit(): void {
    this.isMinimalPage = this.checkIfMinimalRoute(this.router.url);

    this.router.events
      .pipe(filter(event => event instanceof NavigationEnd))
      .subscribe((event: NavigationEnd) => {
        this.isMinimalPage = this.checkIfMinimalRoute(event.urlAfterRedirects);
      });
  }
  onSidebarToggle(collapsed: boolean) {
    this.isSidebarCollapsed = collapsed;
  }

}
