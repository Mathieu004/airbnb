import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../../core/auth.service';
import { NgIf } from '@angular/common';
import {MatIcon} from '@angular/material/icon';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [FormsModule, RouterLink, NgIf, MatIcon],
  templateUrl: './register.component.html',
  styleUrl: './register.component.css'
})
export class RegisterComponent {
  username = '';
  email = '';
  password = '';
  confirmPassword = '';
  error = '';
  showPassword = false;
  showConfirmPassword = false;
  successMessage = '';
  errorMessage = '';


  constructor(private auth: AuthService, private router: Router) {}

  togglePassword() {
    this.showPassword = !this.showPassword;
  }

  toggleConfirmPassword() {
    this.showConfirmPassword = !this.showConfirmPassword;
  }

  onSubmit() {
    if (this.password !== this.confirmPassword) {
      this.errorMessage = 'Les mots de passe ne correspondent pas';

      setTimeout(() => {
        this.errorMessage = '';
      }, 3000);

      return;
    }

    this.auth.register(this.username, this.email, this.password).subscribe({
      next: () => {
        this.successMessage = 'Veillez maintenant vous connecter';
        setTimeout(() => {
          this.router.navigate(['/login']);
        }, 3000);
      },
      error: () => {
          setTimeout(() => {
            this.errorMessage = 'Vous n\'avez pas pu vous inscrire! Verifiez si votre mot de passe est conforme.';
          }, 3000);
        }
    });
  }
}
