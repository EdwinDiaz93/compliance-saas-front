import { Component, inject, OnInit, signal } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService, UserInfo } from '@core/auth/services';
import { SharedModule } from '@shared/shared-module';

const POLL_INTERVAL_MS = 2500;
const MAX_ATTEMPTS = 6; // ~15 segundos máximo de espera

@Component({
    selector: 'app-billing-success',
    imports: [SharedModule],
    templateUrl: './billing-success.component.html',
})
export class BillingSuccessComponent implements OnInit {
    private readonly authService = inject(AuthService);
    private readonly router = inject(Router);

    public status = signal<'loading' | 'done' | 'error'>('loading');
    private attempt = 0;

    public goToDashboard() {
        this.router.navigateByUrl('/dashboard');
    }

    ngOnInit() {
        // Pequeño delay inicial — el webhook de Paddle tarda 1-3s en procesarse
        setTimeout(() => this.pollForActivation(), 1500);
    }

    private pollForActivation() {
        this.authService.refreshToken().subscribe({
            next: (userInfo: UserInfo) => {
                if (userInfo.tenantStatus === 'ACTIVE') {
                    this.status.set('done');
                    setTimeout(() => this.router.navigateByUrl('/dashboard'), 1500);
                } else if (this.attempt < MAX_ATTEMPTS) {
                    this.attempt++;
                    setTimeout(() => this.pollForActivation(), POLL_INTERVAL_MS);
                } else {
                    // Webhook tardó demasiado — el usuario entra igual, el interceptor reintentará
                    this.status.set('done');
                    setTimeout(() => this.router.navigateByUrl('/dashboard'), 1000);
                }
            },
            error: () => {
                this.status.set('error');
                setTimeout(() => this.router.navigateByUrl('/dashboard'), 2000);
            }
        });
    }
}
