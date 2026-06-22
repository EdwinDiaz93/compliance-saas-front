import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '@core/auth/services';

// Redirige rutas no encontradas según el rol: EMPLOYE → /compliances, resto → /dashboard
export const notFoundRedirectGuard: CanActivateFn = () => {
  const authService = inject(AuthService);
  const router = inject(Router);
  const role = authService.getPayload()?.role;
  return router.createUrlTree([role === 'EMPLOYE' ? '/compliances' : '/dashboard']);
};

// Bloquea el acceso al dashboard si el tenant está en TRIAL — redirige a la pantalla de pago
export const tenantActiveGuard: CanActivateFn = () => {
  const authService = inject(AuthService);
  const router = inject(Router);

  const payload = authService.getPayload();
  if (!payload) return router.createUrlTree(['/auth/login']);

  
  if (!payload.tenantStatus || payload.tenantStatus === 'ACTIVE') return true;

  // TRIAL: redirige al dashboard donde el sidebar muestra las opciones bloqueadas
  return router.createUrlTree(['/dashboard']);
};
