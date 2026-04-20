import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-calendrier',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="placeholder-page">
      <div class="placeholder-icon">
        <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
          <rect x="3" y="4" width="18" height="18" rx="2"/>
          <line x1="16" y1="2" x2="16" y2="6"/>
          <line x1="8" y1="2" x2="8" y2="6"/>
          <line x1="3" y1="10" x2="21" y2="10"/>
        </svg>
      </div>
      <h2>Calendrier partagé</h2>
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
export class CalendrierComponent {}
