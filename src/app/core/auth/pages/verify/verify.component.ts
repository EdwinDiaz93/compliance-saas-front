import { Component, inject, OnInit, signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthService } from '@core/auth/services';

@Component({
  selector: 'app-verify',
  templateUrl: './verify.component.html',
})
export class VerifyComponent implements OnInit {

  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly authService = inject(AuthService);

  status = signal<'loading' | 'error'>('loading');

  ngOnInit() {
    this.route.queryParamMap.subscribe((params) => {
      const token = params.get('token');
      if (!token) { this.status.set('error'); return; }

      this.authService.verifyAccount(token).subscribe({
        next: () => this.router.navigateByUrl('/dashboard'),
        error: () => this.status.set('error'),
      });
    });

  }

  navigateToLogin() {
    this.router.navigateByUrl('/auth/login');
  }
}
