import { Component, inject, signal } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { BillingService, BillingPlan } from '@features/billing/services/billing.service';
import { NotificationService } from '@shared/services/notification.service';
import { SharedModule } from '@shared/shared-module';

interface Plan {
    id: BillingPlan;
    name: string;
    price: number;
    maxEmployees: string;
    maxLocations: string;
    features: string[];
    highlighted: boolean;
}

@Component({
    selector: 'app-checkout',
    imports: [SharedModule],
    templateUrl: './checkout.component.html',
    styleUrl: './checkout.component.css',
})
export class CheckoutComponent {
    private readonly billingService = inject(BillingService);
    private readonly notificationService = inject(NotificationService);

    public loadingPlan = signal<BillingPlan | null>(null);

    /**
     * Definicion de los tres planes disponibles.
     * Los limites deben coincidir con los valores configurados en el backend (.env STARTER_MAX_*, PRO_MAX_*).
     * ADVANCE es ilimitado — el backend guarda null en maxEmployees/maxLocations.
     */
    public readonly plans: Plan[] = [
        {
            id: 'STARTER',
            name: 'Starter',
            price: 99,
            maxEmployees: '20 employees',
            maxLocations: '5 locations',
            highlighted: false,
            features: [
                'Up to 20 employees',
                'Up to 5 locations',
                'License & permit tracking',
                'Document storage (S3)',
                'Email expiry alerts',
                'Audit log',
                'CSV export',
            ]
        },
        {
            id: 'PRO',
            name: 'Pro',
            price: 199,
            maxEmployees: '40 employees',
            maxLocations: '10 locations',
            highlighted: true,
            features: [
                'Up to 40 employees',
                'Up to 10 locations',
                'License & permit tracking',
                'Document storage (S3)',
                'Email expiry alerts',
                'Audit log',
                'CSV export',
                'Priority support',
            ]
        },
        {
            id: 'ADVANCE',
            name: 'Advance',
            price: 399,
            maxEmployees: 'Unlimited employees',
            maxLocations: 'Unlimited locations',
            highlighted: false,
            features: [
                'Unlimited employees',
                'Unlimited locations',
                'License & permit tracking',
                'Document storage (S3)',
                'Email expiry alerts',
                'Audit log',
                'CSV export',
                'Priority support',
                'Dedicated onboarding',
            ]
        }
    ];

    /**
     * Llama al backend para crear la session de Stripe y redirige al usuario al checkout.
     * Stripe mostrara la pantalla de pago con el trial de 15 dias configurado en el backend.
     * Al completar el pago Stripe redirige a SUCCESS_URL (/billing/success).
     */
    subscribe(plan: BillingPlan) {
        this.loadingPlan.set(plan);
        this.billingService.createCheckoutSession(plan).subscribe({
            next: (url) => {
                // Redireccion directa al checkout de Stripe — el browser sale de la SPA
                window.location.href = url;
                return; // el componente se destruye al navegar, nada mas ejecuta
            },
            error: (error: HttpErrorResponse) => {
                this.loadingPlan.set(null);
                if (error.error?.statusCode === 429)
                    this.notificationService.show('Too many attempts, wait a moment and try again');
                else
                    this.notificationService.show('Error creating checkout session, try again');
            }
        });
    }
}
