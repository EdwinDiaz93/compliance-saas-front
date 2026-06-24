import { Route } from '@angular/router';

export const publicRoutes: Route[] = [
    {
        path: '',
        loadComponent: () => import('@layout').then(m => m.PublicLayoutComponent),
        children: [
            {
                path: 'pricing',
                loadComponent: () => import('./pages/pricing/pricing.component').then(m => m.PricingComponent),
            },
            {
                path: 'terms',
                loadComponent: () => import('./pages/terms/terms.component').then(m => m.TermsComponent),
            },
            {
                path: 'privacy',
                loadComponent: () => import('./pages/privacy/privacy.component').then(m => m.PrivacyComponent),
            },
            {
                path: 'refund',
                loadComponent: () => import('./pages/refund/refund.component').then(m => m.RefundComponent),
            },
        ],
    },
];
