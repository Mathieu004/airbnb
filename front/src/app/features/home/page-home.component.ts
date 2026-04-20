import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { Params, RouterLink } from '@angular/router';
import { AuthService } from '../../core/auth.service';
import { Property } from '../properties/property.model';
import { PropertyService } from '../properties/propertyService';

@Component({
  selector: 'app-page-home',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './page-home.component.html',
  styleUrl: './page-home.component.css'
})
export class PageHomeComponent implements OnInit {
  featuredProperties: Property[] = [];
  isLoading = false;
  errorMessage = '';
  private readonly fallbackImage = 'https://images.unsplash.com/photo-1505691938895-1758d7feb511?auto=format&fit=crop&w=1200&q=80';

  constructor(
    private propertyService: PropertyService,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.loadFeaturedProperties();
  }

  getMainImage(property: Property): string {
    if (property.images?.length) {
      const mainImage = property.images.find((image) => image.isMain);
      return (mainImage ?? property.images[0]).imageUrl;
    }

    return this.fallbackImage;
  }

  getDisplayType(property: Property): string {
    const value = property.propertyType?.toLowerCase() ?? '';

    switch (value) {
      case 'apartment':
        return 'Appartement';
      case 'house':
        return 'Maison';
      case 'studio':
        return 'Studio';
      case 'villa':
        return 'Villa';
      default:
        return value ? value.charAt(0).toUpperCase() + value.slice(1) : 'Logement';
    }
  }

  getLocation(property: Property): string {
    const parts = [property.city, property.country].filter(Boolean);
    return parts.join(', ') || 'Localisation inconnue';
  }

  getRatingValue(property: Property): string {
    const average = this.getAverageRating(property);
    return average > 0 ? average.toFixed(1) : 'Nouveau';
  }

  getReviewLabel(property: Property): string {
    const count = property.reviewCount ?? property.reviews?.length ?? 0;

    if (count === 0) {
      return 'Aucun avis';
    }

    return count === 1 ? '1 avis' : `${count} avis`;
  }

  getPropertyLink(property: Property): string[] {
    return this.authService.isLoggedIn()
      ? ['/property/edit', String(property.id)]
      : ['/login'];
  }

  getPropertyQueryParams(property: Property): Params | null {
    if (this.authService.isLoggedIn()) {
      return null;
    }

    return {
      returnUrl: `/property/edit/${property.id}`
    };
  }

  private loadFeaturedProperties(): void {
    this.isLoading = true;
    this.errorMessage = '';

    this.propertyService.getAll().subscribe({
      next: (properties) => {
        this.featuredProperties = [...properties]
          .sort((left, right) => this.getSortScore(right) - this.getSortScore(left))
          .slice(0, 3);
        this.isLoading = false;
      },
      error: () => {
        this.errorMessage = 'Impossible de charger les logements populaires pour le moment.';
        this.isLoading = false;
      }
    });
  }

  private getSortScore(property: Property): number {
    const average = this.getAverageRating(property);
    const count = property.reviewCount ?? property.reviews?.length ?? 0;
    return average * 1000 + count;
  }

  private getAverageRating(property: Property): number {
    if ((property.reviewCount ?? 0) > 0 && property.reviewAverage != null) {
      return property.reviewAverage;
    }

    if (!property.reviews?.length) {
      return 0;
    }

    const total = property.reviews.reduce((sum, review) => sum + (review.rating ?? 0), 0);
    return total / property.reviews.length;
  }
}
