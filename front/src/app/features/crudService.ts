import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable()
export abstract class CrudService<T, CreateDto = Partial<T>, UpdateDto = Partial<T>> {
  constructor(
    protected http: HttpClient,
    protected apiUrl: string
  ) {}

  getAll(): Observable<T[]> { return this.http.get<T[]>(this.apiUrl); }
  getById(id: number): Observable<T> { return this.http.get<T>(`${this.apiUrl}/${id}`); }
  create(payload: CreateDto): Observable<T> { return this.http.post<T>(this.apiUrl, payload); }
  update(id: number, payload: UpdateDto): Observable<T> { return this.http.put<T>(`${this.apiUrl}/${id}`, payload); }
  delete(id: number): Observable<void> { return this.http.delete<void>(`${this.apiUrl}/${id}`); }
}
