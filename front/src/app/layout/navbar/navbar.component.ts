import { Component } from '@angular/core';
import { RouterLink, Router } from '@angular/router';
import { NgIf } from '@angular/common';
import { AuthService } from '../../core/auth.service';
import { UserService } from '../../features/users/userService';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [RouterLink, NgIf],
  templateUrl: './navbar.component.html',
  styleUrl: './navbar.component.css',
})
export class NavbarComponent {
  menuOpen = false;
  switchingRole = false;

  constructor(
    public auth: AuthService,
    private router: Router,
    private userService: UserService,
  ) {}

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

  isHost(): boolean {
    return this.auth.getCurrentUserRole() === 'HOST';
  }

  toggleMenu(): void {
    this.menuOpen = !this.menuOpen;
  }

  switchRole(): void {
    const userId = this.auth.getCurrentUserId();
    if (!userId || this.switchingRole) return;
    this.switchingRole = true;
    this.userService.switchRole(userId).subscribe({
      next: (res: any) => {
        this.auth.updateLocalRole(res.role);
        this.switchingRole = false;
        this.menuOpen = false;
      },
      error: () => {
        this.switchingRole = false;
      },
    });
  }

  logout(): void {
    this.menuOpen = false;
    this.auth.logout();
    this.router.navigate(['/']);
  }
}
