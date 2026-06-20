import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { environment } from 'environments';

export type BillingPlan = 'STARTER' | 'PRO' | 'ADVANCE';

@Injectable({ providedIn: 'root' })
export class BillingService {
    private readonly baseUrl = environment.baseUrl;
    private readonly http = inject(HttpClient);

    /**
     * Crea una checkout session en Stripe y devuelve la URL a la que redirigir al usuario.
     * El backend genera la session con trial_period_days: 15 — los primeros 15 dias son gratis.
     * El usuario es redirigido a Stripe para ingresar su tarjeta; el cobro ocurre al dia 15.
     */
    createCheckoutSession(plan: BillingPlan) {
        // responseType: 'text' porque el backend devuelve el URL de Stripe como string plano,
        // no como JSON — sin esto Angular intenta parsear el URL como JSON y lanza error de parseo
        return this.http.post(`${this.baseUrl}/billing/checkout-session`, { plan }, { responseType: 'text' });
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
