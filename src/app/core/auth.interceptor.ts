import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, throwError } from 'rxjs';
import { AuthService } from './auth.service';
import { API_URL } from './config';

/** Agrega el JWT a las llamadas a la API y cierra la sesión si el backend lo rechaza. */
export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const auth = inject(AuthService);
  const isApi = req.url.startsWith(API_URL);
  const isLogin = req.url.endsWith('/auth/login');
  const token = auth.token;

  const request = isApi && token && !isLogin
    ? req.clone({ setHeaders: { Authorization: `Bearer ${token}` } })
    : req;

  return next(request).pipe(
    catchError((error: unknown) => {
      if (error instanceof HttpErrorResponse && isApi && !isLogin && token && (error.status === 401 || error.status === 403)) {
        auth.logout(); // token vencido o inválido
      }
      return throwError(() => error);
    })
  );
};
