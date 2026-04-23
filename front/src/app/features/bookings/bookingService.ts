import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, Subject, tap } from 'rxjs';
import { CrudService } from '../crudService';
import { Booking } from './booking.model';
import { environment } from '../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class BookingService extends CrudService<Booking> {
  private readonly bookingChangedSubject = new Subject<void>();
  readonly bookingChanged$ = this.bookingChangedSubject.asObservable();

  constructor(http: HttpClient) {
    super(http, `${environment.apiUrl}/bookings`);
  }

  override create(payload: Partial<Booking>): Observable<Booking> {
    return super.create(payload).pipe(
      tap(() => this.bookingChangedSubject.next())
    );
  }

  getByGuestId(guestId: number): Observable<Booking[]> {
    return this.http.get<Booking[]>(`${environment.apiUrl}/bookings/guest/${guestId}`);
  }

  getByPropertyId(propertyId: number): Observable<Booking[]> {
    return this.http.get<Booking[]>(`${environment.apiUrl}/bookings/property/${propertyId}`);
  }

  updateStatus(id: number, status: string): Observable<Booking> {
    return this.http.patch<Booking>(`${environment.apiUrl}/bookings/${id}/status`, { status }).pipe(
      tap(() => this.bookingChangedSubject.next())
    );
  }

  cancel(bookingId: number): Observable<Booking> {
    return this.updateStatus(bookingId, 'cancelled');
  }
}
