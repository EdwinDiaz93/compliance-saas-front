import { Routes } from '@angular/router';
import { authGuard, tenantActiveGuard } from '@core/guards';

export const routes: Routes = [

    {
        path: '',
        redirectTo: 'auth',
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
        loadComponent: () => import('@layout').then(c => c.DashboardLayoutComponent),
        canActivate: [authGuard, tenantActiveGuard],
        children: [
            {
                path: 'dashboard',
                loadChildren: () => import('@features/dashboard/dashboard.routes').then(m => m.dashboardRoutes)
            },
            {
                path: 'authorities',
                loadChildren: () => import('@features/authorities/authority.routes').then(m => m.authorityRoutes)
            },
            {
                path: 'compliances',
                loadChildren: () => import('@features/compliances/compliance.routes').then(m => m.complianceRoutes)
            },
            {
                path: 'locations',
                loadChildren: () => import('@features/locations/location.routes').then(m => m.locationRoutes)
            },
            {
                path: 'users',
                loadChildren: () => import('@features/users/users.routes').then(m => m.usersRoutes)
            },
            {
                path: 'reports',
                loadChildren: () => import('@features/reports/report.routes').then(m => m.reportRoutes)
            },
            {
                path: '**',
                redirectTo: 'dashboard'
            }
        ]
    },

    {
        path: '**',
        redirectTo: 'auth'
    }
];
