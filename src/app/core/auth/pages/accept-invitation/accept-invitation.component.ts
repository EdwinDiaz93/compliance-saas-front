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
    const token = this.route.snapshot.queryParamMap.get('token');
    if (!token) { this.status.set('error'); return; }

    this.authService.acceptInvitation(token).subscribe({
      next: () => this.router.navigateByUrl('/dashboard'),
      error: () => this.status.set('error'),
    });
  }
}
