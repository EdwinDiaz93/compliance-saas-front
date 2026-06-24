import { Component, inject } from '@angular/core';
import { RouterLink, RouterOutlet } from '@angular/router';
import { AuthService } from '@core/auth/services';

@Component({
    selector: 'app-public-layout',
    standalone: true,
    imports: [RouterOutlet, RouterLink],
    templateUrl: './public-layout.component.html',
})
export class PublicLayoutComponent {
    public readonly year = new Date().getFullYear();
    private readonly authService = inject(AuthService);

    get isAuthenticated(): boolean {
        return this.authService.isAuthenticated();
    }
}
