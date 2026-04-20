import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-messagerie',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="placeholder-page">
      <div class="placeholder-icon">
        <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
          <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"/>
        </svg>
      </div>
      <h2>Messagerie</h2>
      <p>Cette fonctionnalité est en cours de développement.</p>
    </div>
  `,
  styles: [`
    .placeholder-page {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      height: 60vh;
      gap: 16px;
      color: #1e3a5f;
      text-align: center;
    }
    .placeholder-icon {
      opacity: 0.3;
    }
    h2 {
      font-size: 1.5rem;
      font-weight: 700;
      margin: 0;
    }
    p {
      color: #6b7280;
      margin: 0;
    }
  `]
})
export class MessagerieComponent {}
