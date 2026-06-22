import { Component, inject, OnInit, signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthService } from '@core/auth/services';

@Component({
  selector: 'app-accept-invitation',
  imports: [],
  templateUrl: './accept-invitation.component.html',
})
export class AcceptInvitationComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly authService = inject(AuthService);

  status = signal<'loading' | 'error'>('loading');

  ngOnInit() {
    const raw = this.route.snapshot.queryParamMap.get('token');
    if (!raw) { this.status.set('error'); return; }

    // queryParamMap decodifica '+' como espacio — se restaura para tokens Base64 estándar
    const token = raw.replace(/ /g, '+');

    this.authService.acceptInvitation(token).subscribe({
      next: (response) => {
        const route = response.role === 'EMPLOYE' ? '/compliances' : '/dashboard';
        this.router.navigateByUrl(route);
      },
      error: () => this.status.set('error'),
    });
  }
}
