import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../environments/environment';

@Component({
  selector: 'app-parametres',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './parametres.component.html',
  styleUrls: ['./parametres.component.css']
})
export class ParametresComponent implements OnInit {
  private apiUrl = environment.apiUrl;
  userId: number | null = null;

  firstName = '';
  lastName = '';
  email = '';
  profileMessage = '';
  profileError = '';
  savingProfile = false;

  currentPassword = '';
  newPassword = '';
  confirmPassword = '';
  passwordMessage = '';
  passwordError = '';
  savingPassword = false;

  constructor(private http: HttpClient) {}

  ngOnInit(): void {
    this.loadUser();
  }

  private decodeToken(): any {
    const token = localStorage.getItem('token');
    if (!token) return null;
    try {
      return JSON.parse(atob(token.split('.')[1]));
    } catch {
      return null;
    }
  }

  private loadUser(): void {
    const payload = this.decodeToken();
    if (!payload) return;
    this.userId = payload.uid;

    this.http.get<any>(`${this.apiUrl}/users/${this.userId}`).subscribe({
      next: (user) => {
        const parts = (user.username || '').split(' ');
        this.firstName = parts[0] || '';
        this.lastName = parts.slice(1).join(' ') || '';
        this.email = user.email || '';
      }
    });
  }

  saveProfile(): void {
    this.profileMessage = '';
    this.profileError = '';

    if (!this.firstName.trim()) {
      this.profileError = 'Le pr\u00e9nom est requis';
      return;
    }
    if (!this.email.trim() || !this.email.includes('@')) {
      this.profileError = 'Email invalide';
      return;
    }

    this.savingProfile = true;
    const username = this.lastName.trim()
      ? `${this.firstName.trim()} ${this.lastName.trim()}`
      : this.firstName.trim();

    this.http.patch<any>(`${this.apiUrl}/users/${this.userId}/profile`, {
      username,
      email: this.email.trim()
    }).subscribe({
      next: () => {
        this.profileMessage = 'Profil mis \u00e0 jour avec succ\u00e8s';
        this.savingProfile = false;
      },
      error: (err) => {
        this.profileError = err.error?.message || 'Erreur lors de la mise \u00e0 jour';
        this.savingProfile = false;
      }
    });
  }

  changePassword(): void {
    this.passwordMessage = '';
    this.passwordError = '';

    if (!this.currentPassword) {
      this.passwordError = 'Le mot de passe actuel est requis';
      return;
    }
    if (!this.newPassword || this.newPassword.length < 4) {
      this.passwordError = 'Le nouveau mot de passe doit contenir au moins 4 caract\u00e8res';
      return;
    }
    if (this.newPassword !== this.confirmPassword) {
      this.passwordError = 'Les mots de passe ne correspondent pas';
      return;
    }

    this.savingPassword = true;
    this.http.patch<any>(`${this.apiUrl}/users/${this.userId}/password`, {
      currentPassword: this.currentPassword,
      newPassword: this.newPassword
    }).subscribe({
      next: () => {
        this.passwordMessage = 'Mot de passe modifi\u00e9 avec succ\u00e8s';
        this.currentPassword = '';
        this.newPassword = '';
        this.confirmPassword = '';
        this.savingPassword = false;
      },
      error: (err) => {
        this.passwordError = err.error?.message || 'Erreur lors du changement de mot de passe';
        this.savingPassword = false;
      }
    });
  }
}
