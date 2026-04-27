import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { CreateMessageRequest, Message } from './message.model';

@Injectable({ providedIn: 'root' })
export class MessageService {
  private readonly apiUrl = `${environment.apiUrl}/messages`;

  constructor(private http: HttpClient) {}

  getByUserId(userId: number): Observable<Message[]> {
    return this.http.get<Message[]>(this.apiUrl, {
      params: { userId }
    });
  }

  getThread(userId: number, propertyId: number, bookingId?: number): Observable<Message[]> {
    const params: Record<string, string | number> = { userId, propertyId };
    if (bookingId != null) {
      params['bookingId'] = bookingId;
    }
    return this.http.get<Message[]>(`${this.apiUrl}/thread`, { params });
  }

  create(payload: CreateMessageRequest): Observable<Message> {
    return this.http.post<Message>(this.apiUrl, payload);
  }
}
