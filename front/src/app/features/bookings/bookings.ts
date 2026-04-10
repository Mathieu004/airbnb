import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BookingService } from './bookingService';
import { Booking } from './booking.model';

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

  constructor(private bookingService: BookingService) {}

  ngOnInit(): void {
    this.loadBookings();
  }

  private loadBookings(): void {
    this.isLoading = true;
    this.errorMessage = '';
    this.bookingService.getAll().subscribe({
      next: data => {
        this.bookings = data;
        this.isLoading = false;
      },
      error: () => {
        this.errorMessage = 'Impossible de charger vos reservations.';
        this.isLoading = false;
      }
    });
  }

  formatLocation(booking: Booking): string {
    const city = booking.property?.city;
    const country = booking.property?.country;
    if (city && country) {
      return `${city}, ${country}`;
    }
    return city || country || 'Lieu non renseigne';
  }

  getStatusLabel(): string {
    return 'En attente de validation';
  }
}
