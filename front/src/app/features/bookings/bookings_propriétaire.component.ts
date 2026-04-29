import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { BookingService } from './bookingService';
import { AuthService } from '../../core/auth.service';
import { Booking } from './booking.model';

@Component({
  selector: 'app-bookings-owner',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './bookings_propietaire.html',
  styleUrls: ['./bookings_propietaire.css']
})
export class BookingsProprietaireComponent implements OnInit {
  bookings: Booking[] = [];
  filteredBookings: Booking[] = [];
  searchQuery = '';
  activeFilter: OwnerBookingFilter = 'all';
  loading = false;
  error: string | null = null;

  readonly filters: ReadonlyArray<{ label: string; value: OwnerBookingFilter }> = [
    { label: 'Tous', value: 'all' },
    { label: 'En cours', value: 'current' },
    { label: 'A venir', value: 'upcoming' },
    { label: 'Passees', value: 'past' }
  ];

  constructor(
    private bookingService: BookingService,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    const ownerId = this.authService.getCurrentUserId();
    if (!ownerId) return;

    this.loading = true;
    this.bookingService.getByOwnerId(ownerId).subscribe({
      next: (data) => {
        this.bookings = data;
        this.applyFilters();
        this.loading = false;
      },
      error: () => {
        this.error = 'Impossible de charger les reservations.';
        this.loading = false;
      }
    });
  }

  applyFilters(): void {
    let result = this.bookings;

    if (this.activeFilter !== 'all') {
      result = result.filter(booking => this.getBookingPeriod(booking) === this.activeFilter);
    }

    if (this.searchQuery.trim()) {
      const query = this.normalize(this.searchQuery);
      result = result.filter(booking =>
        this.normalize(booking.guest?.username ?? '').includes(query) ||
        this.normalize(booking.property?.name ?? '').includes(query)
      );
    }

    this.filteredBookings = result;
  }

  setFilter(filter: OwnerBookingFilter): void {
    this.activeFilter = filter;
    this.applyFilters();
  }

  onSearchChange(): void {
    this.applyFilters();
  }

  getInitials(username?: string): string {
    if (!username) return '?';
    return username.split(' ').map(word => word[0]).join('').toUpperCase().slice(0, 2);
  }

  getPeriodLabel(booking: Booking): string {
    const period = this.getBookingPeriod(booking);
    if (period === 'cancelled') return 'Annulee';
    if (period === 'current') return 'En cours';
    if (period === 'upcoming') return 'A venir';
    return 'Passee';
  }

  getPeriodClass(booking: Booking): string {
    return `booking-status--${this.getBookingPeriod(booking)}`;
  }

  private getBookingPeriod(booking: Booking): Exclude<OwnerBookingFilter, 'all'> | 'cancelled' {
    if (booking.status === 'CANCELLED') return 'cancelled';

    const today = this.startOfDay(new Date());
    const startDate = this.startOfDay(new Date(booking.startDate));
    const endDate = this.startOfDay(new Date(booking.endDate));

    if (Number.isNaN(startDate.getTime()) || Number.isNaN(endDate.getTime())) return 'upcoming';
    if (startDate <= today && endDate >= today) return 'current';
    if (startDate > today) return 'upcoming';
    return 'past';
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

type OwnerBookingFilter = 'all' | 'current' | 'upcoming' | 'past';
