import { Component } from '@angular/core';
import { RouterLink, Router } from '@angular/router';
import { NgIf } from '@angular/common';
import { AuthService } from '../../core/auth.service';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [RouterLink, NgIf],
  templateUrl: './navbar.component.html',
  styleUrl: './navbar.component.css'
})
export class NavbarComponent {
  menuOpen = false;

  constructor(public auth: AuthService, private router: Router) {}

  getInitials(): string {
    const name = this.auth.getCurrentUser() ?? '';
    return name
      .split(' ')
      .filter(Boolean)
      .map(word => word[0]?.toUpperCase() ?? '')
      .slice(0, 2)
      .join('') || 'U';
  }

  toggleMenu(): void {
    this.menuOpen = !this.menuOpen;
  }

  logout(): void {
    this.menuOpen = false;
    this.auth.logout();
    this.router.navigate(['/']);
  }
}
