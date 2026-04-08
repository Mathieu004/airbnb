import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReviewService } from '../reviewService';
import { Review } from '../review.model';

@Component({
  selector: 'app-mes-avis',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './mes-avis.component.html',
  styleUrls: ['./mes-avis.component.css']
})
export class MesAvisComponent implements OnInit {
  reviews: Review[] = [];
  loading = true;

  constructor(private reviewService: ReviewService) {}

  ngOnInit(): void {
    this.loadReviews();
  }

  private getUserId(): number | null {
    const token = localStorage.getItem('token');
    if (!token) return null;
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      return payload.uid;
    } catch {
      return null;
    }
  }

  loadReviews(): void {
    const userId = this.getUserId();
    if (!userId) {
      this.loading = false;
      return;
    }
    this.reviewService.getByUserId(userId).subscribe({
      next: (data) => {
        this.reviews = data;
        this.loading = false;
      },
      error: () => {
        this.loading = false;
      }
    });
  }

  deleteReview(id: number): void {
    if (!confirm('Voulez-vous vraiment supprimer cet avis ?')) return;
    this.reviewService.delete(id).subscribe({
      next: () => {
        this.reviews = this.reviews.filter(r => r.id !== id);
      }
    });
  }

  getStars(rating: number): boolean[] {
    return Array.from({ length: 5 }, (_, i) => i < rating);
  }

  formatDate(dateStr?: string): string {
    if (!dateStr) return '';
    return new Date(dateStr).toISOString().substring(0, 10);
  }
}
