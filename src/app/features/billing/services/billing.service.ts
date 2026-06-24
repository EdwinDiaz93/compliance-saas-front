import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { environment } from 'environments';

export type BillingPlan = 'STARTER' | 'PRO' | 'ADVANCE';

@Injectable({ providedIn: 'root' })
export class BillingService {
    private readonly baseUrl = environment.baseUrl;
    private readonly http = inject(HttpClient);

    createCheckoutSession(plan: BillingPlan) {
        return this.http.post<{ transactionId: string }>(`${this.baseUrl}/billing/checkout-session`, { plan });
    }

    /**
     * Cancela la suscripcion al final del periodo actual (no de inmediato).
     * El tenant sigue ACTIVE hasta que vence el ciclo — Stripe dispara
     * customer.subscription.deleted al vencer y el webhook suspende el tenant.
     */
    getSubscriptionStatus() {
        return this.http.get<{
            hasSubscription: boolean;
            plan?: string;
            cancelAtPeriodEnd?: boolean;
            currentPeriodEnd?: string;
        }>(`${this.baseUrl}/billing/subscription-status`);
    }

    cancelSubscription() {
        return this.http.delete<{ message: string }>(`${this.baseUrl}/billing/cancel-subscription`);
    }

    resumeSubscription() {
        return this.http.patch<{ message: string }>(`${this.baseUrl}/billing/resume-subscription`, {});
    }
}
