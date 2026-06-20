import { Routes } from '@angular/router';

export const billingRoutes: Routes = [
    {
        path: 'checkout',
        loadComponent: () => import('./pages/checkout/checkout.component').then(m => m.CheckoutComponent)
    },
    {
        path: 'success',
        loadComponent: () => import('./pages/billing-success/billing-success.component').then(m => m.BillingSuccessComponent)
    },
    {
        path: '**',
        redirectTo: 'checkout'
    }
];
