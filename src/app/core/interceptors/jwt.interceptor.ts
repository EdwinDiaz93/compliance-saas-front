import { HttpInterceptorFn, HttpRequest, HttpHandlerFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, finalize, switchMap, throwError } from 'rxjs';
import { AuthService } from '@core/auth/services';
import { LoadingService } from '@shared/services/loading.service';
import { NotificationService } from '@shared/services/notification.service';
import { environment } from 'environments';

// Interceptor global registrado en app.config.ts
// Con HttpOnly cookies los tokens viajan automaticamente — este interceptor solo agrega
// withCredentials: true para que el browser incluya las cookies en cada request cross-origin,
// gestiona el loading overlay y maneja refresh de token y errores de red.

const REFRESH_URL = `${environment.baseUrl}/auth/refresh-token`;
// El logout tambien se excluye del intento de refresh para evitar loops cuando
// ambos tokens estan expirados: sin esta exclusion el 401 del logout dispararia
// un refresh, que fallaria, que llamaria logout, que dispararia otro 401, etc.
const LOGOUT_URL = `${environment.baseUrl}/auth/logout`;

const withCredentials = (req: HttpRequest<unknown>) =>
  req.clone({ withCredentials: true });

export const jwtInterceptor: HttpInterceptorFn = (req: HttpRequest<unknown>, next: HttpHandlerFn) => {
  const authService = inject(AuthService);
  const loadingService = inject(LoadingService);
  const notificationService = inject(NotificationService);

  // withCredentials: true es necesario para que el browser envie las cookies HttpOnly
  const credReq = withCredentials(req);

  // El loading se gestiona aqui para todas las peticiones HTTP
  loadingService.show();

  return next(credReq).pipe(
    finalize(() => loadingService.hide()),
    catchError((error: HttpErrorResponse) => {
      const isRefreshUrl = req.url === REFRESH_URL;
      const isAuthenticated = authService.isAuthenticated();

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

      const isAuthManagementUrl = req.url === REFRESH_URL || req.url === LOGOUT_URL;

      // Si el 401 viene del refresh o del logout, no intentar refresh (evita loops).
      // Si el usuario ya no esta autenticado tampoco (estado limpiado por logout previo).
      if (error.status !== 401 || isAuthManagementUrl || !isAuthenticated) {
        if (error.status === 401 && isAuthenticated) authService.logout();
        return throwError(() => error);
      }

      // Intenta renovar el access token — el refresh token viaja en la cookie automaticamente
      // y reintenta la peticion original con las nuevas cookies ya establecidas
      return authService.refreshToken().pipe(
        switchMap(() => next(credReq)),
        catchError((refreshError) => {
          authService.logout();
          return throwError(() => refreshError);
        })
      );
    })
  );
};
