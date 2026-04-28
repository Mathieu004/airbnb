import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { AuthService } from '../../../core/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css'
})
export class LoginComponent {
  username = '';
  password = '';
  error = '';
  rememberMe: boolean = false;
  showPassword: boolean = false;
  selectedRole: string = 'client';
  private returnUrl = '/properties';

  constructor(
    private auth: AuthService,
    private router: Router,
    private route: ActivatedRoute
  ) {
    this.returnUrl = this.route.snapshot.queryParamMap.get('returnUrl') || '/properties';
  }

  togglePassword() {
    this.showPassword = !this.showPassword;
  }

  selectRole(role: string) {
    this.selectedRole = role;
  }

  onSubmit() {
    this.error = '';
    this.auth.login(this.username, this.password).subscribe({
      next: () => this.router.navigateByUrl(this.returnUrl),
      error: (err) => {
        const serverMessage = err?.error?.message;

        if (serverMessage?.includes('Invalid credentials')) {
          this.error = 'Connexion impossible : nom d\'utilisateur ou mot de passe incorrect.';
          return;
        }

        if (err?.status === 0) {
          this.error = 'Connexion impossible : le serveur ne repond pas.';
          return;
        }

        this.error = 'Connexion impossible : identifiants incorrects.';
      }
    });
  }
}
