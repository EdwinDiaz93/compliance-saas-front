import { Component, inject, OnInit, signal } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '@core/auth/services';
import { SharedModule } from '@shared/shared-module';

@Component({
    selector: 'app-billing-success',
    imports: [SharedModule],
    templateUrl: './billing-success.component.html',
})
export class BillingSuccessComponent implements OnInit {
    private readonly authService = inject(AuthService);
    private readonly router = inject(Router);

    public status = signal<'loading' | 'done' | 'error'>('loading');

    ngOnInit() {
        /**
         * Stripe redirige aqui despues de completar el pago.
         * El webhook de Stripe ya activo el tenant (status: ACTIVE) en el backend.
         * Se fuerza un refresh del token para que Angular reciba el nuevo tenantStatus: ACTIVE
         * y actualice el user_info en localStorage — sin esto el sidebar seguiria mostrando el candado.
         */
        this.authService.refreshToken().subscribe({
            next: () => {
                this.status.set('done');
                // Espera 1.5s para que el usuario vea el mensaje de exito antes de navegar
                setTimeout(() => this.router.navigateByUrl('/dashboard'), 1500);
            },
            error: () => {
                // Si el refresh falla (ej: webhook aun no proceso) el usuario igual entra al dashboard.
                // Al hacer cualquier accion el interceptor intentara el refresh automaticamente.
                this.status.set('error');
                setTimeout(() => this.router.navigateByUrl('/dashboard'), 2000);
            }
        });
    }
}
