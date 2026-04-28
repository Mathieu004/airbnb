import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { environment } from '../../../environments/environment';
import { AuthService } from '../../core/auth.service';
import { Booking } from '../bookings/booking.model';
import { Property } from '../properties/property.model';

type RevenueTimeline = 'week' | 'month' | 'year';

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
  revenueTotal = 0;
  selectedTimeline: RevenueTimeline = 'week';
  chartBars: ChartBar[] = [];
  recentReservations: RecentReservation[] = [];

  private readonly dayLabels = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  private readonly monthLabels = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  private bookings: Booking[] = [];

  constructor(
    public auth: AuthService,
    private http: HttpClient
  ) {}

  ngOnInit(): void {
    if (this.isHostMode) {
      this.loadDashboard();
    }
  }

  get displayName(): string {
    return this.auth.getCurrentUser() || 'Jean';
  }

  get isHostMode(): boolean {
    return this.auth.getCurrentUserRole() === 'HOST';
  }

  switchToHost(): void {
    this.auth.updateLocalRole('HOST');
    this.loadDashboard();
  }

  selectTimeline(timeline: RevenueTimeline): void {
    this.selectedTimeline = timeline;
    this.chartBars = this.buildRevenueChart(this.bookings);
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

  private loadDashboard(): void {
    this.loadProperties();
    this.loadBookings();
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
    const ownerId = this.auth.getCurrentUserId();
    if (!ownerId) return;

    this.http.get<Booking[]>(`${environment.apiUrl}/bookings/owner/${ownerId}`).subscribe({
      next: (bookings) => {
        this.bookings = bookings;
        this.upcomingReservationsCount = this.countUpcomingReservations(bookings);
        this.chartBars = this.buildRevenueChart(bookings);
        this.recentReservations = this.buildRecentReservations(bookings);
      },
      error: () => {
        this.bookings = [];
        this.upcomingReservationsCount = 0;
        this.chartBars = this.buildRevenueChart([]);
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

  private buildRevenueChart(bookings: Booking[]): ChartBar[] {
    return this.selectedTimeline === 'month'
      ? this.buildMonthlyRevenueChart(bookings)
      : this.selectedTimeline === 'year'
        ? this.buildYearlyRevenueChart(bookings)
      : this.buildWeeklyRevenueChart(bookings);
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

    this.revenueTotal = totals.reduce((sum, value) => sum + value, 0);
    const max = Math.max(...totals, 1);

    return totals.map((value, index) => ({
      label: this.dayLabels[index],
      value,
      height: Math.max(8, Math.round((value / max) * 100))
    }));
  }

  private buildMonthlyRevenueChart(bookings: Booking[]): ChartBar[] {
    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const bucketSize = Math.ceil(daysInMonth / 4);
    const totals = new Array(4).fill(0) as number[];

    bookings.forEach((booking) => {
      const startDate = this.parseDate(booking.startDate);
      if (!startDate) return;

      if (startDate.getFullYear() === year && startDate.getMonth() === month) {
        const bucketIndex = Math.min(3, Math.floor((startDate.getDate() - 1) / bucketSize));
        totals[bucketIndex] += Number(booking.totalPrice || 0);
      }
    });

    this.revenueTotal = totals.reduce((sum, value) => sum + value, 0);
    const max = Math.max(...totals, 1);

    return totals.map((value, index) => {
      const startDay = index * bucketSize + 1;
      const endDay = Math.min(daysInMonth, (index + 1) * bucketSize);
      return {
        label: `${startDay}-${endDay}`,
        value,
        height: Math.max(8, Math.round((value / max) * 100))
      };
    });
  }

  private buildYearlyRevenueChart(bookings: Booking[]): ChartBar[] {
    const year = new Date().getFullYear();
    const totals = new Array(12).fill(0) as number[];

    bookings.forEach((booking) => {
      const startDate = this.parseDate(booking.startDate);
      if (!startDate) return;

      if (startDate.getFullYear() === year) {
        totals[startDate.getMonth()] += Number(booking.totalPrice || 0);
      }
    });

    this.revenueTotal = totals.reduce((sum, value) => sum + value, 0);
    const max = Math.max(...totals, 1);

    return totals.map((value, index) => ({
      label: this.monthLabels[index],
      value,
      height: Math.max(8, Math.round((value / max) * 100))
    }));
  }

  private buildRecentReservations(bookings: Booking[]): RecentReservation[] {
    return [...bookings]
      .sort((left, right) => this.getBookingTimestamp(right) - this.getBookingTimestamp(left))
      .slice(0, 4)
      .map((booking) => ({
        ...booking,
        statusLabel: (booking.status ?? 'CONFIRMED').toLowerCase(),
        statusClass: (booking.status ?? 'CONFIRMED').toLowerCase()
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
