import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '@core/auth/services';

// Protege todas las rutas bajo DashboardLayoutComponent — usar junto a tenantActiveGuard
export const authGuard: CanActivateFn = () => {
  const authService = inject(AuthService);
  const router = inject(Router);

  if (authService.isAuthenticated()) return true;

  return router.createUrlTree(['/auth/login']);
};
