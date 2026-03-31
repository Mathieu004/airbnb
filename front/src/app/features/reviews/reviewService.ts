import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { CrudService } from '../crudService';
import {Review} from './review.model';
import { environment } from '../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class ReviewService extends CrudService<Review> {
  constructor(http: HttpClient) {
    super(http, `${environment.apiUrl}/review`);
  }
}
