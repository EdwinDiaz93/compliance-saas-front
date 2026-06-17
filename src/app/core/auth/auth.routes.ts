import { Route } from '@angular/router';
import { LoginComponent, RegisterComponent, VerifyComponent } from './pages';
import { AuthService } from './services';
import { inject } from '@angular/core';
import { Router } from '@angular/router';

const redirectIfAuthenticated = () => {
  const authService = inject(AuthService);
  const router = inject(Router);
  return authService.isAuthenticated() ? router.createUrlTree(['/dashboard']) : true;
};

export const authRoutes: Route[] = [
  {
    path: '',
    loadComponent: () => import('@layout').then(m => m.AuthLayoutComponent),
    children: [
      {
        path: 'login',
        canActivate: [redirectIfAuthenticated],
        component: LoginComponent,
      },
      {
        path: 'register',
        canActivate: [redirectIfAuthenticated],
        component: RegisterComponent,
      },
      {
        path: '**',
        redirectTo: 'login',
      },
    ],
  },
];
