import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BookingService } from './bookingService';
import { Booking } from './booking.model';
import { AuthService } from '../../core/auth.service';

@Component({
  selector: 'app-bookings',
  standalone: true,
  imports: [CommonModule],
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
  showCancelModal = false;
  bookingToCancel: Booking | null = null;
  isCancelling = false;
  cancellationError = '';

  constructor(
    private bookingService: BookingService,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.loadBookings();
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
      if (!this.matchesTab(booking, this.selectedTab)) {
        return false;
      }

      if (!query) {
        return true;
      }

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
    if (tab === 'all') {
      return this.bookings.length;
    }
    return this.bookings.filter((booking) => this.matchesTab(booking, tab)).length;
  }

  trackByBooking(_: number, booking: Booking): number | string {
    return booking.id ?? `${booking.startDate}-${booking.endDate}`;
  }

  formatLocation(booking: Booking): string {
    const city = booking.property?.city;
    const country = booking.property?.country;
    if (city && country) {
      return `${city}, ${country}`;
    }
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
    if (status === 'cancelled') {
      return 'Annulee';
    }
    if (status === 'current') {
      return 'En cours';
    }
    if (status === 'upcoming') {
      return 'A venir';
    }
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

  openCancelModal(booking: Booking): void {
    this.bookingToCancel = booking;
    this.cancellationError = '';
    this.showCancelModal = true;
  }

  closeCancelModal(): void {
    if (this.isCancelling) {
      return;
    }
    this.showCancelModal = false;
    this.bookingToCancel = null;
    this.cancellationError = '';
  }

  confirmCancelBooking(): void {
    if (!this.bookingToCancel?.id || this.isCancelling) {
      return;
    }

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
        this.cancellationError = 'Impossible d annuler cette reservation. Merci de reessayer.';
        this.isCancelling = false;
      }
    });
  }

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

  private matchesTab(booking: Booking, tab: BookingTab): boolean {
    if (tab === 'all') {
      return true;
    }
    return this.getBookingStatus(booking) === tab;
  }

  private getBookingStatus(booking: Booking): Exclude<BookingTab, 'all'> {
    if (booking.status === 'CANCELLED') {
      return 'cancelled';
    }

    const today = this.startOfDay(new Date());
    const startDate = this.startOfDay(new Date(booking.startDate));
    const endDate = this.startOfDay(new Date(booking.endDate));

    if (Number.isNaN(startDate.getTime()) || Number.isNaN(endDate.getTime())) {
      return 'upcoming';
    }

    if (startDate <= today && endDate >= today) {
      return 'current';
    }

    if (startDate > today) {
      return 'upcoming';
    }

    return 'past';
  }

  private getNightCount(booking: Booking): number {
    const startDate = this.startOfDay(new Date(booking.startDate));
    const endDate = this.startOfDay(new Date(booking.endDate));
    const diff = endDate.getTime() - startDate.getTime();

    if (Number.isNaN(diff) || diff <= 0) {
      return 1;
    }

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
