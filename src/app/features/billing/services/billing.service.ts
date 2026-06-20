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
        return this.http.post<string>(`${this.baseUrl}/billing/checkout-session`, { plan });
    }
}
