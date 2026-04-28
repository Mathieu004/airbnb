import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { BookingService } from './bookingService';
import { AuthService } from '../../core/auth.service';
import { Booking, BookingStatus } from './booking.model';

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
  activeFilter: BookingStatus | 'ALL' = 'ALL';
  loading = false;
  error: string | null = null;

  readonly filters: Array<{ label: string; value: BookingStatus | 'ALL' }> = [
    { label: 'Tous', value: 'ALL' },
    { label: 'En attente', value: 'PENDING' },
    { label: 'Confirm\u00e9es', value: 'CONFIRMED' },
    { label: 'Annul\u00e9es', value: 'CANCELLED' },
    { label: 'Termin\u00e9es', value: 'COMPLETED' }
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
        this.error = 'Impossible de charger les r\u00e9servations.';
        this.loading = false;
      }
    });
  }

  applyFilters(): void {
    let result = this.bookings;
    if (this.activeFilter !== 'ALL') {
      result = result.filter(b => b.status === this.activeFilter);
    }
    if (this.searchQuery.trim()) {
      const q = this.searchQuery.toLowerCase();
      result = result.filter(b =>
        b.guest?.username?.toLowerCase().includes(q) ||
        b.property?.name?.toLowerCase().includes(q)
      );
    }
    this.filteredBookings = result;
  }

  setFilter(filter: BookingStatus | 'ALL'): void {
    this.activeFilter = filter;
    this.applyFilters();
  }

  onSearchChange(): void {
    this.applyFilters();
  }

  updateStatus(booking: Booking, status: BookingStatus): void {
    if (!booking.id) return;
    this.bookingService.updateStatus(booking.id, status).subscribe({
      next: (updated) => {
        booking.status = updated.status;
        this.applyFilters();
      }
    });
  }

  getInitials(username?: string): string {
    if (!username) return '?';
    return username.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2);
  }

  getStatusLabel(status?: BookingStatus): string {
    switch (status) {
      case 'PENDING':
        return 'En attente';
      case 'CONFIRMED':
        return 'Confirm\u00e9e';
      case 'CANCELLED':
        return 'Annul\u00e9e';
      case 'COMPLETED':
        return 'Termin\u00e9e';
      default:
        return '';
    }
  }
}
