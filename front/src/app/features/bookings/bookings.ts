import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { BookingService } from './bookingService';
import { Booking } from './booking.model';
import { AuthService } from '../../core/auth.service';
import { ReviewService } from '../reviews/reviewService';

@Component({
  selector: 'app-bookings',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './bookings_client.html',
  styleUrls: ['./bookings_client.css']
})
export class BookingsComponent implements OnInit {
  bookings: Booking[] = [];
  isLoading = false;
  errorMessage = '';
  searchTerm = '';
  selectedTab: BookingTab = 'all';
  readonly tabs: ReadonlyArray<{ key: BookingTab; label: string }> = [
    { key: 'all', label: 'Toutes' },
    { key: 'current', label: 'En cours' },
    { key: 'upcoming', label: 'A venir' },
    { key: 'past', label: 'Passees' }
  ];

  // Annulation
  showCancelModal = false;
  bookingToCancel: Booking | null = null;
  isCancelling = false;
  cancellationError = '';

  // Avis
  showReviewModal = false;
  bookingToReview: Booking | null = null;
  reviewRating = 0;
  reviewHover = 0;
  reviewComment = '';
  reviewError = '';
  reviewSuccess = false;
  isSubmittingReview = false;
  reviewedPropertyIds = new Set<number>();

  constructor(
    private bookingService: BookingService,
    private authService: AuthService,
    private reviewService: ReviewService
  ) {}

  ngOnInit(): void {
    this.loadBookings();
    this.loadAlreadyReviewed();
  }

  setSelectedTab(tab: BookingTab): void {
    this.selectedTab = tab;
  }

  updateSearchTerm(event: Event): void {
    const target = event.target as HTMLInputElement | null;
    this.searchTerm = target?.value ?? '';
  }

  get filteredBookings(): Booking[] {
    const query = this.normalize(this.searchTerm);

    return this.bookings.filter((booking) => {
      if (!this.matchesTab(booking, this.selectedTab)) return false;
      if (!query) return true;

      const haystack = this.normalize([
        booking.property?.name,
        booking.property?.city,
        booking.property?.country,
        this.formatLocation(booking)
      ].filter(Boolean).join(' '));

      return haystack.includes(query);
    });
  }

  getTabCount(tab: BookingTab): number {
    if (tab === 'all') return this.bookings.length;
    return this.bookings.filter((booking) => this.matchesTab(booking, tab)).length;
  }

  trackByBooking(_: number, booking: Booking): number | string {
    return booking.id ?? `${booking.startDate}-${booking.endDate}`;
  }

  formatLocation(booking: Booking): string {
    const city = booking.property?.city;
    const country = booking.property?.country;
    if (city && country) return `${city}, ${country}`;
    return city || country || 'Lieu non renseigne';
  }

  getBookingTitle(booking: Booking): string {
    return booking.property?.name || `Logement #${booking.property?.id ?? booking.id}`;
  }

  getBookingInitials(booking: Booking): string {
    const source = this.getBookingTitle(booking);
    return source
      .split(' ')
      .filter(Boolean)
      .map((word) => word[0]?.toUpperCase() ?? '')
      .slice(0, 2)
      .join('') || 'RE';
  }

  getBookingStatusLabel(booking: Booking): string {
    const status = this.getBookingStatus(booking);
    if (status === 'cancelled') return 'Annulee';
    if (status === 'current') return 'En cours';
    if (status === 'upcoming') return 'A venir';
    return 'Terminee';
  }

  getBookingStatusClass(booking: Booking): string {
    return `booking-status--${this.getBookingStatus(booking)}`;
  }

  getDurationLabel(booking: Booking): string {
    const nights = this.getNightCount(booking);
    return `${nights} ${nights > 1 ? 'nuits' : 'nuit'}`;
  }

  isCancelled(booking: Booking): boolean {
    return this.getBookingStatus(booking) === 'cancelled';
  }

  canCancel(booking: Booking): boolean {
    return this.getBookingStatus(booking) === 'upcoming';
  }

  canReview(booking: Booking): boolean {
    const propertyId = booking.property?.id;
    if (!propertyId) return false;
    return this.getBookingStatus(booking) === 'past'
      && !this.reviewedPropertyIds.has(propertyId);
  }

  // ─── Modal avis ───

  openReviewModal(booking: Booking): void {
    this.bookingToReview = booking;
    this.reviewRating = 0;
    this.reviewHover = 0;
    this.reviewComment = '';
    this.reviewError = '';
    this.reviewSuccess = false;
    this.showReviewModal = true;
  }

  closeReviewModal(): void {
    if (this.isSubmittingReview) return;
    this.showReviewModal = false;
    this.bookingToReview = null;
  }

  setReviewRating(rating: number): void {
    this.reviewRating = rating;
  }

  submitReview(): void {
    if (!this.bookingToReview || this.reviewRating === 0 || this.isSubmittingReview) return;

    const userId = this.authService.getCurrentUserId();
    const propertyId = this.bookingToReview.property?.id;

    if (!userId || !propertyId) {
      this.reviewError = 'Impossible de récupérer les informations nécessaires.';
      return;
    }

    this.isSubmittingReview = true;
    this.reviewError = '';

    this.reviewService.create({
      userId,
      propertyId,
      rating: this.reviewRating,
      comment: this.reviewComment.trim() || ' '
    }).subscribe({
      next: () => {
        this.reviewedPropertyIds.add(propertyId);
        this.isSubmittingReview = false;
        this.reviewSuccess = true;
        setTimeout(() => this.closeReviewModal(), 1500);
      },
      error: (err) => {
        this.isSubmittingReview = false;
        const msg = err?.error?.message || err?.error;
        if (typeof msg === 'string' && msg.includes('déjà')) {
          this.reviewError = 'Vous avez déjà laissé un avis pour ce logement.';
          this.reviewedPropertyIds.add(propertyId);
        } else {
          this.reviewError = 'Impossible de publier votre avis. Veuillez réessayer.';
        }
      }
    });
  }

  // ─── Modal annulation ───

  openCancelModal(booking: Booking): void {
    this.bookingToCancel = booking;
    this.cancellationError = '';
    this.showCancelModal = true;
  }

  closeCancelModal(): void {
    if (this.isCancelling) return;
    this.showCancelModal = false;
    this.bookingToCancel = null;
    this.cancellationError = '';
  }

  confirmCancelBooking(): void {
    if (!this.bookingToCancel?.id || this.isCancelling) return;

    const bookingId = this.bookingToCancel.id;
    this.isCancelling = true;
    this.cancellationError = '';

    this.bookingService.cancel(bookingId).subscribe({
      next: (updatedBooking) => {
        this.bookings = this.bookings.map((booking) =>
          booking.id === updatedBooking.id ? updatedBooking : booking
        );
        this.isCancelling = false;
        this.showCancelModal = false;
        this.bookingToCancel = null;
      },
      error: () => {
        this.cancellationError = "Impossible d'annuler cette reservation. Merci de reessayer.";
        this.isCancelling = false;
      }
    });
  }

  // ─── Privé ───

  private loadBookings(): void {
    const currentUserId = this.authService.getCurrentUserId();
    if (currentUserId == null) {
      this.bookings = [];
      this.errorMessage = 'Utilisateur non connecte.';
      return;
    }

    this.isLoading = true;
    this.errorMessage = '';
    this.bookingService.getByGuestId(currentUserId).subscribe({
      next: (data) => {
        this.bookings = data;
        this.isLoading = false;
      },
      error: () => {
        this.errorMessage = 'Impossible de charger vos reservations.';
        this.isLoading = false;
      }
    });
  }

  private loadAlreadyReviewed(): void {
    const userId = this.authService.getCurrentUserId();
    if (!userId) return;

    this.reviewService.getByUserId(userId).subscribe({
      next: (reviews) => {
        reviews.forEach(r => {
          if (r.property?.id) this.reviewedPropertyIds.add(r.property.id);
        });
      },
      error: () => { /* silencieux */ }
    });
  }

  private matchesTab(booking: Booking, tab: BookingTab): boolean {
    if (tab === 'all') return true;
    return this.getBookingStatus(booking) === tab;
  }

  private getBookingStatus(booking: Booking): Exclude<BookingTab, 'all'> {
    if (booking.status === 'CANCELLED') return 'cancelled';

    const today = this.startOfDay(new Date());
    const startDate = this.startOfDay(new Date(booking.startDate));
    const endDate = this.startOfDay(new Date(booking.endDate));

    if (Number.isNaN(startDate.getTime()) || Number.isNaN(endDate.getTime())) return 'upcoming';
    if (startDate <= today && endDate >= today) return 'current';
    if (startDate > today) return 'upcoming';
    return 'past';
  }

  private getNightCount(booking: Booking): number {
    const startDate = this.startOfDay(new Date(booking.startDate));
    const endDate = this.startOfDay(new Date(booking.endDate));
    const diff = endDate.getTime() - startDate.getTime();
    if (Number.isNaN(diff) || diff <= 0) return 1;
    return Math.round(diff / 86400000);
  }

  private startOfDay(date: Date): Date {
    return new Date(date.getFullYear(), date.getMonth(), date.getDate());
  }

  private normalize(value: string): string {
    return value
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .toLowerCase()
      .trim();
  }
}

type BookingTab = 'all' | 'current' | 'upcoming' | 'past' | 'cancelled';
