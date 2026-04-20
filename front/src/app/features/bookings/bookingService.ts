import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { CrudService } from '../crudService';
import { Booking } from './booking.model';
import { environment } from '../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class BookingService extends CrudService<Booking> {
  constructor(http: HttpClient) {
    super(http, `${environment.apiUrl}/bookings`);
  }

  getByGuestId(guestId: number): Observable<Booking[]> {
    return this.http.get<Booking[]>(`${environment.apiUrl}/bookings/guest/${guestId}`);
  }
}
