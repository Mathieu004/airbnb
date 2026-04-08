import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { PropertyService } from './propertyService';
import { Property } from './property.model';
import { ReviewService } from '../reviews/reviewService';

@Component({
  selector: 'app-property-detail',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './property-detail.component.html',
  styleUrl: './property-detail.component.css'
})
export class PropertyDetailComponent implements OnInit {
  property?: Property;
  isLoading = true;
  errorMessage = '';
  amenities: string[] = [];
  private readonly fallbackImage = 'https://images.unsplash.com/photo-1505691938895-1758d7feb511?auto=format&fit=crop&w=1600&q=80';

  // Review form state
  showReviewForm = false;
  selectedRating = 0;
  hoverRating = 0;
  reviewComment = '';
  reviewError = '';
  reviewSuccess = '';
  submittingReview = false;

  constructor(
    private route: ActivatedRoute,
    private propertyService: PropertyService,
    private reviewService: ReviewService
  ) {}

  ngOnInit(): void {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    if (!id) {
      this.errorMessage = 'Logement introuvable.';
      this.isLoading = false;
      return;
    }
    this.propertyService.getById(id).subscribe({
      next: data => {
        this.property = data;
        this.amenities = this.buildAmenities(data.includedFeatures);
        this.isLoading = false;
      },
      error: () => {
        this.errorMessage = 'Impossible de charger le logement.';
        this.isLoading = false;
      }
    });
  }

  get mainImage(): string {
    if (this.property?.images && this.property.images.length) {
      const main = this.property.images.find(image => image.isMain);
      return (main ?? this.property.images[0]).imageUrl;
    }
    return this.fallbackImage;
  }

  get ratingLabel(): string {
    const reviews = this.property?.reviews ?? [];
    if (!reviews.length) {
      return 'Nouveau';
    }
    const total = reviews.reduce((sum, review) => sum + (review.rating ?? 0), 0);
    const average = total / reviews.length;
    return `${average.toFixed(1)} (${reviews.length} avis)`;
  }

  getGuestOptions(): number[] {
    const count = this.property?.maxGuests ?? 1;
    return Array.from({ length: Math.max(count, 1) }, (_, index) => index + 1);
  }

  private buildAmenities(value?: string | null): string[] {
    if (!value) {
      return [];
    }
    return value.split(',')
      .map(item => item.trim())
      .filter(Boolean);
  }

  isLoggedIn(): boolean {
    return !!localStorage.getItem('token');
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

  cancelReview(): void {
    this.showReviewForm = false;
    this.selectedRating = 0;
    this.hoverRating = 0;
    this.reviewComment = '';
    this.reviewError = '';
    this.reviewSuccess = '';
  }

  submitReview(): void {
    this.reviewError = '';
    this.reviewSuccess = '';

    if (this.selectedRating === 0) {
      this.reviewError = 'Veuillez sélectionner une note';
      return;
    }
    if (!this.reviewComment.trim()) {
      this.reviewError = 'Veuillez écrire un commentaire';
      return;
    }

    const userId = this.getUserId();
    if (!userId || !this.property) {
      this.reviewError = 'Vous devez être connecté';
      return;
    }

    this.submittingReview = true;
    this.reviewService.create({
      propertyId: this.property.id,
      userId: userId,
      rating: this.selectedRating,
      comment: this.reviewComment.trim()
    }).subscribe({
      next: () => {
        this.reviewSuccess = 'Avis publié avec succès !';
        this.submittingReview = false;
        // Reload property to refresh review list
        this.propertyService.getById(this.property!.id).subscribe({
          next: data => {
            this.property = data;
            this.showReviewForm = false;
            this.selectedRating = 0;
            this.reviewComment = '';
            this.reviewSuccess = '';
          }
        });
      },
      error: (err) => {
        this.submittingReview = false;
        this.reviewError = err.error?.message || 'Erreur lors de l\'envoi de l\'avis';
      }
    });
  }
}
