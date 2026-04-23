import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { CrudService } from '../crudService';
import { Property } from './property.model';
import { environment } from '../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class PropertyService extends CrudService<Property> {
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
}
