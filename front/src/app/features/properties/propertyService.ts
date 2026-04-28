import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { CrudService } from '../crudService';
import { Property, PropertyPayload } from './property.model';
import { environment } from '../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class PropertyService extends CrudService<Property, PropertyPayload, PropertyPayload> {
  constructor(http: HttpClient) {
    super(http, `${environment.apiUrl}/property`);
  }

  getByHostId(userId: number): Observable<Property[]> {
    return this.http.get<Property[]>(`${environment.apiUrl}/property`, {
      params: {
        userId: String(userId),
        role: 'host'
      }
    });
  }

  getForGuest(): Observable<Property[]> {
    return this.http.get<Property[]>(`${environment.apiUrl}/property`, {
      params: {
        role: 'GUEST'
      }
    });
  }

  createForHost(payload: PropertyPayload): Observable<Property> {
    return this.create(payload);
  }

  updateStatus(id: number, isActive: boolean): Observable<Property> {
    return this.http.patch<Property>(`${environment.apiUrl}/property/${id}/status`, { isActive });
  }
}
