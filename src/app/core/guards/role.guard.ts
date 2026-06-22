import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '@core/auth/services';

export type AppRole = 'OWNER' | 'ADMIN' | 'EMPLOYE';

// Guard de fábrica — uso: canActivate: [roleGuard(['OWNER', 'ADMIN'])]
// Redirige a /dashboard si el rol no está permitido (no hace logout)
export const roleGuard = (allowedRoles: AppRole[]): CanActivateFn => () => {
  const authService = inject(AuthService);
  const router = inject(Router);

  const payload = authService.getPayload();
  if (!payload) return router.createUrlTree(['/auth/login']);



  if (allowedRoles.includes(payload.role)) return true;

  return router.createUrlTree(['/dashboard']);
};
