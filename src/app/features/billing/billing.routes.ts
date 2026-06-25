import { Routes } from '@angular/router';

export const billingRoutes: Routes = [
    {
        path: 'checkout',
        loadComponent: () => import('./pages/checkout/checkout.component').then(m => m.CheckoutComponent)
    },
    {
        path: 'manage',
        loadComponent: () => import('./pages/manage/manage.component').then(m => m.ManageComponent)
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
