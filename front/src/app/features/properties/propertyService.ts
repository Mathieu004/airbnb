import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { CrudService } from '../crudService';
import { Property, PropertyPayload } from './property.model';
import { environment } from '../../../environments/environment';
import { HttpParams } from '@angular/common/http';

@Injectable({ providedIn: 'root' })
export class PropertyService extends CrudService<Property, PropertyPayload, PropertyPayload> {
  constructor(http: HttpClient) {
    super(http, `${environment.apiUrl}/property`);
  }

  getForHost(userId: number, role: string = 'HOST'): Observable<Property[]> {
    const params = new HttpParams()
      .set('userId', userId)
      .set('role', role);

    return this.http.get<Property[]>(this.apiUrl, { params });
  }

  createForHost(payload: PropertyPayload): Observable<Property> {
    return this.http.post<Property>(this.apiUrl, payload);
  }

  updateStatus(id: number, isActive: boolean): Observable<Property> {
    return this.http.patch<Property>(`${this.apiUrl}/${id}/status`, { isActive });
  }

  getForGuest(): Observable<Property[]> {
    const params = new HttpParams().set('role', 'GUEST');
    return this.http.get<Property[]>(this.apiUrl, { params });
  }

  getByHostId(userId: number): Observable<Property[]> {
    return this.http.get<Property[]>(`${environment.apiUrl}/property`, {
      params: {
        userId: String(userId),
        role: 'host'
      }
    });
  }
}
