import { Component, inject, OnInit, signal } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { Router } from '@angular/router';
import { BillingService, BillingPlan } from '@features/billing/services/billing.service';
import { AuthService } from '@core/auth/services';
import { NotificationService } from '@shared/services/notification.service';
import { SharedModule } from '@shared/shared-module';
import { environment } from 'environments';

declare var Paddle: any;

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
export class CheckoutComponent implements OnInit {
    private readonly billingService = inject(BillingService);
    private readonly notificationService = inject(NotificationService);
    private readonly authService = inject(AuthService);
    private readonly router = inject(Router);

    public loadingPlan = signal<BillingPlan | null>(null);

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

    ngOnInit() {
        const status = this.authService.getPayload()?.tenantStatus;
        if (status === 'ACTIVE') {
            this.notificationService.warn('You already have an active subscription');
            this.router.navigateByUrl('/dashboard');
            return;
        }

        Paddle.Initialize({
            token: environment.paddleToken,
            eventCallback: (data: any) => {
                if (data.name === 'checkout.completed') {
                    this.router.navigateByUrl('/billing/success');
                }
            }
        });
    }

    subscribe(plan: BillingPlan) {
        this.loadingPlan.set(plan);
        this.billingService.createCheckoutSession(plan).subscribe({
            next: (res) => {
                this.loadingPlan.set(null);
                Paddle.Checkout.open({ transactionId: res.transactionId });
            },
            error: (error: HttpErrorResponse) => {
                this.loadingPlan.set(null);
                if (error.error?.statusCode === 429)
                    this.notificationService.warn('Too many attempts, wait a moment and try again');
                else
                    this.notificationService.error('Error creating checkout session, try again');
            }
        });
    }
}
