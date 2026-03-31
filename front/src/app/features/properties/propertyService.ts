import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { CrudService } from '../crudService';
import { Property } from './property.model';
import { environment } from '../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class PropertyService extends CrudService<Property> {
  constructor(http: HttpClient) {
    super(http, `${environment.apiUrl}/property`);
  }
}
