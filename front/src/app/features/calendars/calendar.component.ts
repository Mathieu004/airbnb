import { CommonModule } from '@angular/common';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Subscription } from 'rxjs';
import { Booking } from '../bookings/booking.model';
import { BookingService } from '../bookings/bookingService';
import { BookingDateRange, isDateReserved, startOfDay, toBookingRanges } from '../bookings/booking-date.util';
import { PropertyService } from '../properties/propertyService';
import { Property } from '../properties/property.model';
import { AuthService } from '../../core/auth.service';

@Component({
  selector: 'app-calendrier',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './calendar.component.html',
  styleUrl: './calendar.component.css'
})
export class CalendrierComponent implements OnInit, OnDestroy {
  hostProperties: Property[] = [];
  selectedPropertyId: number | 'all' | null = null;
  bookings: Booking[] = [];
  unavailableRanges: BookingDateRange[] = [];
  bookingsByProperty = new Map<number, Booking[]>();
  currentMonth = new Date();
  isLoading = false;
  errorMessage = '';
  readonly weekdays = ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'];
  readonly propertyColors = ['#45627f', '#4cc879', '#f2ad3f', '#dc6f68', '#7768c7', '#27a7b8'];
  private bookingChangedSubscription?: Subscription;

  constructor(
    private bookingService: BookingService,
    private propertyService: PropertyService,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.loadHostProperties();
    this.bookingChangedSubscription = this.bookingService.bookingChanged$.subscribe(() => {
      this.reloadSelectedCalendar();
    });
  }

  ngOnDestroy(): void {
    this.bookingChangedSubscription?.unsubscribe();
  }

  get monthLabel(): string {
    return this.currentMonth.toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' });
  }

  get selectedProperty(): Property | undefined {
    if (this.selectedPropertyId === 'all') {
      return undefined;
    }
    return this.hostProperties.find((property) => property.id === this.selectedPropertyId);
  }

  get isAllPropertiesSelected(): boolean {
    return this.selectedPropertyId === 'all';
  }

  get showSinglePropertyLegend(): boolean {
    return !!this.selectedPropertyId && !this.isAllPropertiesSelected;
  }

  get showAllPropertiesLegend(): boolean {
    return this.isAllPropertiesSelected;
  }

  get calendarTitle(): string {
    if (this.selectedPropertyId === 'all') {
      return 'Toutes les reservations';
    }

    return this.selectedProperty?.name ?? '';
  }

  get calendarCells(): CalendarCell[] {
    const firstDay = new Date(this.currentMonth.getFullYear(), this.currentMonth.getMonth(), 1);
    const startOffset = (firstDay.getDay() + 6) % 7;
    const gridStart = new Date(firstDay);
    gridStart.setDate(firstDay.getDate() - startOffset);

    return Array.from({ length: 42 }, (_, index) => {
      const date = new Date(gridStart);
      date.setDate(gridStart.getDate() + index);
      const normalizedDate = startOfDay(date);

      return {
        date: normalizedDate,
        dayNumber: date.getDate(),
        inCurrentMonth: date.getMonth() === this.currentMonth.getMonth(),
        isReserved: isDateReserved(normalizedDate, this.unavailableRanges),
        isToday: normalizedDate.getTime() === startOfDay(new Date()).getTime(),
        reservations: this.getReservationsForDate(normalizedDate)
      };
    });
  }

  changeMonth(offset: number): void {
    this.currentMonth = new Date(this.currentMonth.getFullYear(), this.currentMonth.getMonth() + offset, 1);
  }

  onPropertyChange(propertyId: number | 'all' | null): void {
    this.selectedPropertyId = propertyId;
    this.bookings = [];
    this.unavailableRanges = [];
    this.currentMonth = new Date();

    if (propertyId === 'all') {
      this.loadAllCalendars();
      return;
    }

    if (typeof propertyId === 'number') {
      this.loadCalendar(propertyId);
    }
  }

  getPropertyName(propertyId: number): string {
    return this.hostProperties.find((property) => property.id === propertyId)?.name ?? `Logement #${propertyId}`;
  }

  getPropertyColor(propertyId: number): string {
    const index = Math.max(this.hostProperties.findIndex((property) => property.id === propertyId), 0);
    return this.propertyColors[index % this.propertyColors.length];
  }

  getReservationColor(propertyId: number): string {
    return this.isAllPropertiesSelected ? this.getPropertyColor(propertyId) : '#8aa6c1';
  }

  private loadHostProperties(): void {
    this.isLoading = true;
    this.errorMessage = '';
    const currentUserId = this.authService.getCurrentUserId();

    if (!currentUserId) {
      this.errorMessage = 'Utilisateur non connecte.';
      this.isLoading = false;
      return;
    }

    this.propertyService.getByHostId(currentUserId).subscribe({
      next: (properties) => {
        this.hostProperties = properties ?? [];

        if (!this.hostProperties.length) {
          this.errorMessage = 'Aucun logement n est associe au proprietaire connecte.';
          this.selectedPropertyId = null;
          this.isLoading = false;
          return;
        }

        this.selectedPropertyId = 'all';
        this.loadAllCalendars();
      },
      error: () => {
        this.errorMessage = 'Impossible de charger les logements du proprietaire.';
        this.hostProperties = [];
        this.isLoading = false;
      }
    });
  }

  private loadCalendar(propertyId: number): void {
    this.isLoading = true;
    this.errorMessage = '';

    this.bookingService.getByPropertyId(propertyId).subscribe({
      next: (bookings) => {
        this.bookings = bookings ?? [];
        this.unavailableRanges = toBookingRanges(this.bookings);
        this.isLoading = false;
      },
      error: () => {
        this.errorMessage = 'Impossible de charger les reservations de ce logement.';
        this.bookings = [];
        this.unavailableRanges = [];
        this.isLoading = false;
      }
    });
  }

  private reloadSelectedCalendar(): void {
    if (this.selectedPropertyId === 'all') {
      this.loadAllCalendars();
      return;
    }

    if (typeof this.selectedPropertyId === 'number') {
      this.loadCalendar(this.selectedPropertyId);
    }
  }

  private loadAllCalendars(): void {
    this.isLoading = true;
    this.errorMessage = '';
    this.bookings = [];
    this.unavailableRanges = [];
    this.bookingsByProperty.clear();

    const properties = [...this.hostProperties];
    if (!properties.length) {
      this.isLoading = false;
      return;
    }

    let remaining = properties.length;
    let failed = false;

    properties.forEach((property) => {
      this.bookingService.getByPropertyId(property.id).subscribe({
        next: (bookings) => {
          const propertyBookings = bookings ?? [];
          this.bookingsByProperty.set(property.id, propertyBookings);
          this.bookings = [...this.bookings, ...propertyBookings];
          this.finalizeAllCalendarsLoad(--remaining, failed);
        },
        error: () => {
          failed = true;
          this.finalizeAllCalendarsLoad(--remaining, failed);
        }
      });
    });
  }

  private finalizeAllCalendarsLoad(remaining: number, failed: boolean): void {
    if (remaining > 0) {
      return;
    }

    this.unavailableRanges = toBookingRanges(this.bookings);
    this.isLoading = false;

    if (failed) {
      this.errorMessage = 'Certaines reservations n ont pas pu etre chargees.';
    }
  }

  private getReservationsForDate(date: Date): CalendarReservation[] {
    return this.bookings
      .filter((booking) => booking.property?.id && isDateReserved(date, toBookingRanges([booking])))
      .map((booking) => ({
        booking,
        propertyId: booking.property!.id,
        propertyName: this.getPropertyName(booking.property!.id),
        guestName: booking.guest?.username || booking.guest?.email || 'Voyageur',
        color: this.getReservationColor(booking.property!.id)
      }));
  }
}

interface CalendarReservation {
  booking: Booking;
  propertyId: number;
  propertyName: string;
  guestName: string;
  color: string;
}

interface CalendarCell {
  date: Date;
  dayNumber: number | null;
  inCurrentMonth: boolean;
  isReserved: boolean;
  isToday: boolean;
  reservations: CalendarReservation[];
}
