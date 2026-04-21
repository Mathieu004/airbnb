import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { environment } from '../../../environments/environment';
import { AuthService } from '../../core/auth.service';
import { Booking } from '../bookings/booking.model';
import { Property } from '../properties/property.model';

type ChartBar = {
  label: string;
  value: number;
  height: number;
};

type RecentReservation = Booking & {
  statusLabel: string;
  statusClass: string;
};

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.css'
})
export class DashboardComponent implements OnInit {
  readonly pendingCleaning = 3;
  readonly unreadMessages = 3;

  propertiesCount = 0;
  upcomingReservationsCount = 0;
  weeklyRevenueTotal = 0;
  chartBars: ChartBar[] = [];
  recentReservations: RecentReservation[] = [];

  private readonly dayLabels = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

  constructor(
    public auth: AuthService,
    private http: HttpClient
  ) {}

  ngOnInit(): void {
    this.loadProperties();
    this.loadBookings();
  }

  get displayName(): string {
    return this.auth.getCurrentUser() || 'Jean';
  }

  formatCurrency(value: number): string {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'EUR',
      maximumFractionDigits: 0
    }).format(value);
  }

  formatDateRange(booking: Booking): string {
    return `${booking.startDate} -> ${booking.endDate}`;
  }

  private loadProperties(): void {
    const userId = this.auth.getCurrentUserId();
    const url = userId
      ? `${environment.apiUrl}/property?userId=${userId}&role=host`
      : `${environment.apiUrl}/property`;

    this.http.get<Property[]>(url).subscribe({
      next: (properties) => {
        this.propertiesCount = properties.length;
      },
      error: () => {
        this.propertiesCount = 0;
      }
    });
  }

  private loadBookings(): void {
    this.http.get<Booking[]>(`${environment.apiUrl}/bookings`).subscribe({
      next: (bookings) => {
        this.upcomingReservationsCount = this.countUpcomingReservations(bookings);
        this.chartBars = this.buildWeeklyRevenueChart(bookings);
        this.recentReservations = this.buildRecentReservations(bookings);
      },
      error: () => {
        this.upcomingReservationsCount = 0;
        this.chartBars = this.buildWeeklyRevenueChart([]);
        this.recentReservations = [];
      }
    });
  }

  private countUpcomingReservations(bookings: Booking[]): number {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    return bookings.filter((booking) => {
      const startDate = this.parseDate(booking.startDate);
      return startDate != null && startDate >= today;
    }).length;
  }

  private buildWeeklyRevenueChart(bookings: Booking[]): ChartBar[] {
    const weekStart = this.getCurrentWeekStart();
    const totals = new Array(7).fill(0) as number[];

    bookings.forEach((booking) => {
      const startDate = this.parseDate(booking.startDate);
      if (!startDate) return;

      const diffInDays = Math.floor(
        (startDate.getTime() - weekStart.getTime()) / (1000 * 60 * 60 * 24)
      );

      if (diffInDays >= 0 && diffInDays < 7) {
        totals[diffInDays] += Number(booking.totalPrice || 0);
      }
    });

    this.weeklyRevenueTotal = totals.reduce((sum, value) => sum + value, 0);
    const max = Math.max(...totals, 1);

    return totals.map((value, index) => ({
      label: this.dayLabels[index],
      value,
      height: Math.max(8, Math.round((value / max) * 100))
    }));
  }

  private buildRecentReservations(bookings: Booking[]): RecentReservation[] {
    return [...bookings]
      .sort((left, right) => this.getBookingTimestamp(right) - this.getBookingTimestamp(left))
      .slice(0, 4)
      .map((booking, index) => ({
        ...booking,
        statusLabel: index === 1 ? 'pending' : index === 3 ? 'completed' : 'confirmed',
        statusClass: index === 1 ? 'pending' : index === 3 ? 'completed' : 'confirmed'
      }));
  }

  private getCurrentWeekStart(): Date {
    const now = new Date();
    const day = now.getDay();
    const diff = day === 0 ? -6 : 1 - day;
    const monday = new Date(now);
    monday.setDate(now.getDate() + diff);
    monday.setHours(0, 0, 0, 0);
    return monday;
  }

  private getBookingTimestamp(booking: Booking): number {
    const reservationDate = booking.reservationDate ? this.parseDate(booking.reservationDate) : null;
    const startDate = this.parseDate(booking.startDate);
    return (reservationDate || startDate || new Date(0)).getTime();
  }

  private parseDate(value?: string): Date | null {
    if (!value) return null;
    const date = new Date(value);
    return Number.isNaN(date.getTime()) ? null : date;
  }
}
