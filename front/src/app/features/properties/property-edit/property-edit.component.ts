import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatIconModule } from '@angular/material/icon';
import { PropertyService } from '../propertyService';
import { Property } from '../property.model';
import { BookingService } from '../../bookings/bookingService';
import { Booking } from '../../bookings/booking.model';
import { BookingDateRange, isDateReserved, isRangeAvailable, startOfDay, toBookingRanges } from '../../bookings/booking-date.util';
import { AuthService } from '../../../core/auth.service';
import { ReviewService } from '../../reviews/reviewService';
import { Review } from '../../reviews/review.model';

@Component({
  selector: 'app-property-edit',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatIconModule
  ],
  templateUrl: './property-edit.component.html',
  styleUrl: './property-edit.component.css'
})
export class PropertyEditComponent implements OnInit {
  property?: Property;
  isLoading = true;
  errorMessage = '';
  amenities: string[] = [];
  arrivalDate: Date | null = null;
  departureDate: Date | null = null;
  selectedGuests = 1;
  includeCleaningService = false;
  successMessage = '';
  bookingError = '';
  private feedbackTimer?: ReturnType<typeof setTimeout>;
  private readonly fallbackImage = 'https://images.unsplash.com/photo-1505691938895-1758d7feb511?auto=format&fit=crop&w=1600&q=80';
  reviews: Review[] = [];
  reviewsError = '';
  reviewsLoading = false;
  propertyBookings: Booking[] = [];
  unavailableRanges: BookingDateRange[] = [];
  readonly minArrivalDate = startOfDay(new Date());
  readonly arrivalDateFilter = (date: Date | null): boolean => this.canSelectArrivalDate(date);
  readonly departureDateFilter = (date: Date | null): boolean => this.canSelectDepartureDate(date);
  readonly dateClass = (date: Date): string =>
    isDateReserved(date, this.unavailableRanges) ? 'property-edit__date--unavailable' : '';

  constructor(
    private route: ActivatedRoute,
    private propertyService: PropertyService,
    private bookingService: BookingService,
    private authService: AuthService,
    private reviewService: ReviewService
  ) {}

  ngOnInit(): void {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    const initial = history.state?.property as Property | undefined;

    if (initial && initial.id) {
      this.applyProperty(initial);
    }

    if (!id) {
      if (!this.property) {
        this.errorMessage = 'Logement introuvable.';
        this.isLoading = false;
      }
      return;
    }

    this.propertyService.getById(id).subscribe({
      next: data => this.applyProperty(data),
      error: () => {
        if (!this.property) {
          this.errorMessage = 'Impossible de charger ce logement.';
          this.isLoading = false;
        }
      }
    });
  }

  mainImageUrl = '';

  get ratingLabel(): string {
    if (!this.property) {
      return 'Nouveau';
    }
    if ((this.property.reviewCount ?? 0) > 0 && this.property.reviewAverage != null) {
      const count = this.property.reviewCount ?? 0;
      return `${this.property.reviewAverage.toFixed(1)} (${count} avis)`;
    }
    const reviews = this.property.reviews ?? [];
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

  get canReserve(): boolean {
    return !!(
      this.property &&
      this.arrivalDate &&
      this.departureDate &&
      isRangeAvailable(this.arrivalDate, this.departureDate, this.unavailableRanges)
    );
  }

  get nights(): number {
    if (!this.arrivalDate || !this.departureDate) {
      return 0;
    }
    const diff = Math.round((this.departureDate.getTime() - this.arrivalDate.getTime()) / (24 * 60 * 60 * 1000));
    return Math.max(diff, 0);
  }

  get nightsLabel(): string {
    if (this.nights <= 0) {
      return '--';
    }
    return `${this.nights} nuit${this.nights > 1 ? 's' : ''}`;
  }

  get subtotalPrice(): number {
    if (!this.property) {
      return 0;
    }
    return Number(this.property.pricePerNight) * this.nights;
  }

  get serviceFee(): number {
    return Math.round(this.subtotalPrice * 0.1);
  }

  get cleaningFee(): number {
    if (!this.includeCleaningService) {
      return 0;
    }
    return Math.round(this.subtotalPrice * 0.1);
  }

  get totalDue(): number {
    return this.subtotalPrice + this.serviceFee + this.cleaningFee;
  }

  reserve(): void {
    if (!this.canReserve || !this.property) {
      this.bookingError = 'Les dates selectionnees ne sont pas disponibles.';
      return;
    }

    const payload = {
      propertyId: this.property.id,
      guestUsername: this.authService.getCurrentUser() ?? 'invite',
      startDate: this.arrivalDate!.toISOString().slice(0, 10),
      endDate: this.departureDate!.toISOString().slice(0, 10),
      totalPrice: this.computeTotalPrice()
    };

    this.clearFeedback();

    this.bookingService.create(payload as any).subscribe({
      next: () => {
        this.successMessage = 'Reservation confirmée.';
        this.refreshBookings();
        this.startFeedbackTimer();
      },
      error: (error) => {
        this.bookingError = error.error?.message || 'Impossible d\'enregistrer la reservation. Merci de reessayer.';
        this.startFeedbackTimer();
      }
    });
  }

  private computeTotalPrice(): number {
    return this.totalDue;
  }

  private parseAmenities(value?: string | null): string[] {
    if (!value) {
      return [];
    }
    return value.split(',')
      .map(item => item.trim())
      .filter(Boolean);
  }

  private applyProperty(data: Property): void {
    this.property = data;
    this.amenities = this.parseAmenities(data.includedFeatures);
    this.isLoading = false;
    this.errorMessage = '';
    this.mainImageUrl = this.computeMainImage();
    if (data.id) {
      this.loadPropertyBookings(data.id);
      this.loadReviews(data.id);
    }
  }

  onArrivalDateChange(date: Date | null): void {
    this.arrivalDate = date ? startOfDay(date) : null;
    if (this.arrivalDate && this.departureDate && !this.canSelectDepartureDate(this.departureDate)) {
      this.departureDate = null;
    }
    this.bookingError = '';
  }

  onDepartureDateChange(date: Date | null): void {
    this.departureDate = date ? startOfDay(date) : null;
    this.bookingError = '';
  }

  setMainImage(imageUrl: string): void {
    this.mainImageUrl = imageUrl || this.fallbackImage;
  }

  private computeMainImage(): string {
    if (this.property?.images?.length) {
      const main = this.property.images.find(image => image.isMain);
      return (main ?? this.property.images[0]).imageUrl;
    }
    return this.fallbackImage;
  }

  private clearFeedback(): void {
    this.successMessage = '';
    this.bookingError = '';
    if (this.feedbackTimer) {
      clearTimeout(this.feedbackTimer);
      this.feedbackTimer = undefined;
    }
  }

  private startFeedbackTimer(): void {
    this.feedbackTimer = setTimeout(() => {
      this.successMessage = '';
      this.bookingError = '';
    }, 4000);
  }

  getReviewInitials(name?: string | null): string {
    if (!name) {
      return 'RV';
    }
    return name.split(' ')
      .filter(Boolean)
      .map(part => part[0]?.toUpperCase() ?? '')
      .slice(0, 2)
      .join('');
  }

  private loadReviews(propertyId: number): void {
    this.reviewsLoading = true;
    this.reviewsError = '';
    this.reviewService.getByPropertyId(propertyId).subscribe({
      next: data => {
        this.reviews = data ?? [];
        this.updateReviewStatsFromList();
        this.reviewsLoading = false;
      },
      error: () => {
        this.reviewsError = 'Impossible de charger les avis.';
        this.reviewsLoading = false;
      }
    });
  }

  private updateReviewStatsFromList(): void {
    if (!this.property) {
      return;
    }
    const reviewCount = this.reviews.length;
    this.property.reviewCount = reviewCount;
    if (!reviewCount) {
      this.property.reviewAverage = undefined;
      return;
    }
    const totalRating = this.reviews.reduce((sum, review) => sum + (review.rating ?? 0), 0);
    this.property.reviewAverage = totalRating / reviewCount;
  }

  private loadPropertyBookings(propertyId: number): void {
    this.bookingService.getByPropertyId(propertyId).subscribe({
      next: (data) => {
        this.propertyBookings = data ?? [];
        this.unavailableRanges = toBookingRanges(this.propertyBookings);
      },
      error: () => {
        this.propertyBookings = [];
        this.unavailableRanges = [];
      }
    });
  }

  private refreshBookings(): void {
    if (this.property?.id) {
      this.loadPropertyBookings(this.property.id);
    }
  }

  private canSelectArrivalDate(date: Date | null): boolean {
    if (!date) {
      return false;
    }

    const normalized = startOfDay(date);
    return normalized >= this.minArrivalDate && !isDateReserved(normalized, this.unavailableRanges);
  }

  private canSelectDepartureDate(date: Date | null): boolean {
    if (!date || !this.arrivalDate) {
      return false;
    }

    const normalized = startOfDay(date);
    return normalized > this.arrivalDate && isRangeAvailable(this.arrivalDate, normalized, this.unavailableRanges);
  }
}
