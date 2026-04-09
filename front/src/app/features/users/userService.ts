import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { CrudService } from '../crudService';
import { User } from '../../core/user.model';
import { environment } from '../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class UserService extends CrudService<User> {
  constructor(http: HttpClient) {
    super(http, `${environment.apiUrl}/user`);
  }

  switchRole(userId: number): Observable<User> {
    return this.http.patch<User>(
      `${environment.apiUrl}/user/${userId}/role`,
      {},
    );
  }
}
