import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { CrudService } from '../crudService';
import {Booking} from './booking.model';
import { environment } from '../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class BookingService extends CrudService<Booking> {
  constructor(http: HttpClient) {
    super(http, `${environment.apiUrl}/booking`);
  }
}
