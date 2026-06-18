import { HttpInterceptorFn, HttpRequest, HttpHandlerFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, finalize, switchMap, throwError } from 'rxjs';
import { AuthService } from '@core/auth/services';
import { LoadingService } from '@shared/services/loading.service';
import { NotificationService } from '@shared/services/notification.service';
import { environment } from 'environments';

// Interceptor global registrado en app.config.ts
// Responsabilidades: adjuntar Bearer token, manejar loading overlay, refresh de token y errores de red

const REFRESH_URL = `${environment.baseUrl}/auth/refresh-token`;

const addAuthHeader = (req: HttpRequest<unknown>, token: string) =>
  req.clone({ setHeaders: { Authorization: `Bearer ${token}` } });

export const jwtInterceptor: HttpInterceptorFn = (req: HttpRequest<unknown>, next: HttpHandlerFn) => {
  const authService = inject(AuthService);
  const loadingService = inject(LoadingService);
  const notificationService = inject(NotificationService);
  const token = authService.getToken();

  const authReq = token ? addAuthHeader(req, token) : req;

  // El loading se gestiona aquí para todas las peticiones HTTP — no llamar show/hide manualmente
  loadingService.show();

  return next(authReq).pipe(
    finalize(() => loadingService.hide()),
    catchError((error: HttpErrorResponse) => {
      const isRefreshUrl = req.url === REFRESH_URL;
      const hasRefreshToken = !!authService.getRefreshToken();

      if (error.status === 0) {
        notificationService.show('No connection. Please check your internet.', 'error');
        return throwError(() => error);
      }

      if (error.status === 429) {
        notificationService.show('Too many requests. Please wait a moment and try again.', 'warning');
        return throwError(() => error);
      }

      if (error.status >= 500) {
        notificationService.show('Server error. Please try again later.', 'error');
        return throwError(() => error);
      }

      // Si el 401 viene del propio refresh o no hay refresh token, se hace logout directo
      if (error.status !== 401 || isRefreshUrl || !hasRefreshToken) {
        if (error.status === 401) authService.logout();
        return throwError(() => error);
      }

      // Intenta renovar el access token y reintenta la petición original
      return authService.refreshToken().pipe(
        switchMap((tokens) => next(addAuthHeader(req, tokens.access_token))),
        catchError((refreshError) => {
          authService.logout();
          return throwError(() => refreshError);
        })
      );
    })
  );
};
