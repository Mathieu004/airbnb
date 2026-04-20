import { Component } from '@angular/core';
import { RouterLink, Router } from '@angular/router';
import { NgIf, AsyncPipe } from '@angular/common';
import { AuthService } from '../../core/auth.service';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [RouterLink, NgIf, AsyncPipe],
  templateUrl: './navbar.component.html',
  styleUrl: './navbar.component.css',
})
export class NavbarComponent {
  menuOpen = false;
  switchingRole = false;

  role$: Observable<string | null>;

  constructor(
    public auth: AuthService,
    private router: Router,
  ) {
    this.role$ = this.auth.role$;
  }

  getInitials(): string {
    const name = this.auth.getCurrentUser() ?? '';
    return (
      name
        .split(' ')
        .filter(Boolean)
        .map((word) => word[0]?.toUpperCase() ?? '')
        .slice(0, 2)
        .join('') || 'U'
    );
  }

  toggleMenu(): void {
    this.menuOpen = !this.menuOpen;
  }

  switchRole(): void {
    this.auth.toggleRole();
    this.menuOpen = false;
  }

  logout(): void {
    this.menuOpen = false;
    this.auth.logout();
    this.router.navigate(['/']);
  }
}
