import { HttpInterceptorFn } from '@angular/common/http';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const token = localStorage.getItem('token');
  const userId = localStorage.getItem('currentUserId');
  const role = localStorage.getItem('currentUserRole') || 'CLIENT';
  const headers: Record<string, string> = {};

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  if (userId) {
    headers['X-User-Id'] = userId;
  }
  headers['X-User-Role'] = role;

  return next(req.clone({ setHeaders: headers }));
};
