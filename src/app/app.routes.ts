import { Routes } from '@angular/router';
import { authGuard, notFoundRedirectGuard, tenantActiveGuard } from '@core/guards';

export const routes: Routes = [

    {
        path: '',
        redirectTo: 'pricing',
        pathMatch: 'full'
    },
    {
        path: 'auth',
        loadChildren: () => import('@core/auth/auth.routes').then(m => m.authRoutes)
    },
    {
        path: 'verification',
        loadComponent: () => import('@core/auth/pages/verify/verify.component').then(m => m.VerifyComponent)
    },
    {
        path: 'accept-invitation',
        loadComponent: () => import('@core/auth/pages/accept-invitation/accept-invitation.component').then(m => m.AcceptInvitationComponent)
    },
    {
        path: '',
        loadChildren: () => import('@features/public/public.routes').then(m => m.publicRoutes)
    },
    {
        path: '',
        loadComponent: () => import('@layout').then(c => c.DashboardLayoutComponent),
        canActivate: [authGuard],
        children: [
            {
                path: 'dashboard',
                loadChildren: () => import('@features/dashboard/dashboard.routes').then(m => m.dashboardRoutes)
            },
            {
                path: 'authorities',
                canActivate: [tenantActiveGuard],
                loadChildren: () => import('@features/authorities/authority.routes').then(m => m.authorityRoutes)
            },
            {
                path: 'compliances',
                canActivate: [tenantActiveGuard],
                loadChildren: () => import('@features/compliances/compliance.routes').then(m => m.complianceRoutes)
            },
            {
                path: 'locations',
                canActivate: [tenantActiveGuard],
                loadChildren: () => import('@features/locations/location.routes').then(m => m.locationRoutes)
            },
            {
                path: 'users',
                canActivate: [tenantActiveGuard],
                loadChildren: () => import('@features/users/users.routes').then(m => m.usersRoutes)
            },
            {
                path: 'reports',
                canActivate: [tenantActiveGuard],
                loadChildren: () => import('@features/reports/report.routes').then(m => m.reportRoutes)
            },
            {
                // Sin tenantActiveGuard — TRIAL y SUSPENDED necesitan acceder para suscribirse
                path: 'billing',
                loadChildren: () => import('@features/billing/billing.routes').then(m => m.billingRoutes)
            },
            {
                path: '**',
                canActivate: [notFoundRedirectGuard],
                loadComponent: () => import('@layout').then(c => c.DashboardLayoutComponent)
            }
        ]
    },

    {
        path: '**',
        redirectTo: 'pricing'
    }
];
