import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Params, RouterLink } from '@angular/router';
import { catchError, forkJoin, map, of } from 'rxjs';
import { AuthService } from '../../core/auth.service';
import { BookingService } from '../bookings/bookingService';
import { isRangeAvailable, parseLocalDate, toBookingRanges } from '../bookings/booking-date.util';
import { Property } from '../properties/property.model';
import { PropertyService } from '../properties/propertyService';
import { Review } from '../reviews/review.model';
import { ReviewService } from '../reviews/reviewService';

@Component({
  selector: 'app-page-home',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './page-home.component.html',
  styleUrl: './page-home.component.css'
})
export class PageHomeComponent implements OnInit {
  allProperties: Property[] = [];
  featuredProperties: Property[] = [];
  isLoading = false;
  errorMessage = '';
  searchError = '';
  hasSearched = false;
  searchDestination = '';
  searchStartDate = '';
  searchEndDate = '';
  searchGuests: number | null = null;
  stats = {
    availableProperties: 0,
    happyTravelers: 0,
    coveredCities: 0,
    averageRating: null as number | null
  };
  private readonly fallbackImage = 'https://images.unsplash.com/photo-1505691938895-1758d7feb511?auto=format&fit=crop&w=1200&q=80';

  constructor(
    private propertyService: PropertyService,
    private bookingService: BookingService,
    private reviewService: ReviewService,
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

  getAverageRatingLabel(): string {
    return this.stats.averageRating != null
      ? `${this.stats.averageRating.toFixed(1)}/5`
      : 'N/A';
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

  searchProperties(): void {
    this.searchError = '';
    this.hasSearched = true;

    if ((this.searchStartDate && !this.searchEndDate) || (!this.searchStartDate && this.searchEndDate)) {
      this.searchError = 'Selectionnez une date d\'arrivée et une date de départ.';
      return;
    }

    const startDate = this.searchStartDate ? parseLocalDate(this.searchStartDate) : null;
    const endDate = this.searchEndDate ? parseLocalDate(this.searchEndDate) : null;

    if (startDate && endDate && endDate <= startDate) {
      this.searchError = 'La date de départ doit être après la date d\'arrivée.';
      return;
    }

    const destination = this.normalize(this.searchDestination);
    const guests = Number(this.searchGuests ?? 0);
    const candidates = this.allProperties.filter((property) => {
      if (property.isActive === false) return false;

      const haystack = this.normalize([
        property.name,
        property.address,
        property.city,
        property.country
      ].filter(Boolean).join(' '));

      return (!destination || haystack.includes(destination))
        && (!guests || (property.maxGuests ?? 0) >= guests);
    });

    if (!startDate || !endDate || !candidates.length) {
      this.featuredProperties = candidates;
      return;
    }

    this.isLoading = true;
    forkJoin(
      candidates.map((property) =>
        this.bookingService.getByPropertyId(property.id).pipe(
          map((bookings) => ({
            property,
            isAvailable: isRangeAvailable(startDate, endDate, toBookingRanges(bookings ?? []))
          }))
        )
      )
    ).subscribe({
      next: (results) => {
        this.featuredProperties = results
          .filter((result) => result.isAvailable)
          .map((result) => result.property);
        this.isLoading = false;
      },
      error: () => {
        this.searchError = 'Impossible de verifier les disponibilités pour le moment.';
        this.featuredProperties = candidates;
        this.isLoading = false;
      }
    });
  }

  resetSearch(): void {
    this.searchDestination = '';
    this.searchStartDate = '';
    this.searchEndDate = '';
    this.searchGuests = null;
    this.searchError = '';
    this.hasSearched = false;
    this.featuredProperties = this.getFeaturedProperties(this.allProperties);
  }

  private loadFeaturedProperties(): void {
    this.isLoading = true;
    this.errorMessage = '';

    forkJoin({
      properties: this.propertyService.getAll(),
      reviews: this.reviewService.getAll().pipe(catchError(() => of([] as Review[])))
    }).subscribe({
      next: ({ properties, reviews }) => {
        this.allProperties = properties ?? [];
        this.featuredProperties = this.getFeaturedProperties(this.allProperties);
        this.updateStats(this.allProperties, reviews ?? []);
        this.isLoading = false;
      },
      error: () => {
        this.errorMessage = 'Impossible de charger les logements populaires pour le moment.';
        this.stats = {
          availableProperties: 0,
          happyTravelers: 0,
          coveredCities: 0,
          averageRating: null
        };
        this.isLoading = false;
      }
    });
  }

  private updateStats(properties: Property[], reviews: Review[]): void {
    const activeProperties = properties.filter((property) => property.isActive !== false);
    const coveredCities = new Set(
      activeProperties
        .map((property) => this.normalize(property.city ?? ''))
        .filter(Boolean)
    );
    const satisfiedReviewerIds = new Set(
      reviews
        .filter((review) => (review.rating ?? 0) >= 4 && review.reviewer?.id != null)
        .map((review) => review.reviewer.id)
    );
    const ratings = reviews
      .map((review) => review.rating)
      .filter((rating): rating is number => typeof rating === 'number');

    this.stats = {
      availableProperties: activeProperties.length,
      happyTravelers: satisfiedReviewerIds.size,
      coveredCities: coveredCities.size,
      averageRating: ratings.length
        ? ratings.reduce((sum, rating) => sum + rating, 0) / ratings.length
        : null
    };
  }

  private getFeaturedProperties(properties: Property[]): Property[] {
    return [...properties]
      .filter((property) => property.isActive !== false)
      .sort((left, right) => this.getSortScore(right) - this.getSortScore(left))
      .slice(0, 3);
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

  private normalize(value: string): string {
    return value
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .toLowerCase()
      .trim();
  }
}
