import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../../core/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [FormsModule, RouterLink],
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

  constructor(private auth: AuthService, private router: Router) {}
  togglePassword() {
    this.showPassword = !this.showPassword;
  }

  selectRole(role: string) {
    this.selectedRole = role;
  }

  onSubmit() {
    this.auth.login(this.username, this.password).subscribe({
      next: () => this.router.navigate(['/explorar']),
      error: () => this.error = 'Identifiants incorrects'
    });
  }
}
