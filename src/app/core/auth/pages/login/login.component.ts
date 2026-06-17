import { Component, inject, signal } from '@angular/core';
import { SharedModule } from '@shared/shared-module';
import { Router } from '@angular/router';
import { FormBuilder, Validators } from '@angular/forms';
import { AuthService } from '@core/auth/services';
import { UtilsService } from '@shared/utils';
import { environment } from 'environments';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [SharedModule],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css',
})
export class LoginComponent {
  private readonly router = inject(Router);
  private readonly formBuilder = inject(FormBuilder);
  private readonly authService = inject(AuthService);
  protected readonly utils = inject(UtilsService);
  protected readonly environment = environment;

  isLoading = signal(false);
  emailSent = signal(false);
  hasError = signal(false);

  loginForm = this.formBuilder.group({
    tenant: ['', [Validators.required]],
    email: ['', [Validators.required, Validators.pattern(UtilsService.emailRegex)]],
  });

  login() {
    if (this.loginForm.invalid) {
      this.loginForm.markAllAsTouched();
      return;
    }
    this.hasError.set(false);
    this.isLoading.set(true);
    this.authService.login(this.loginForm.getRawValue() as any).subscribe({
      next: () => this.emailSent.set(true),
      error: () => { this.isLoading.set(false); this.hasError.set(true); },
      complete: () => this.isLoading.set(false),
    });
  }

  gotoRegister() {
    this.router.navigateByUrl('/auth/register');
  }
}
