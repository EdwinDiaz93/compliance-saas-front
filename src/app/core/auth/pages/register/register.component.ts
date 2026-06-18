import { Component, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { FormBuilder, Validators } from '@angular/forms';
import { HttpErrorResponse } from '@angular/common/http';
import { AuthService } from '@core/auth/services';
import { UtilsService } from '@shared/utils';
import { SharedModule } from '@shared/shared-module';
import { environment } from 'environments';

@Component({
  selector: 'app-register',
  imports: [SharedModule],
  templateUrl: './register.component.html',
  styleUrl: './register.component.css',
})
export class RegisterComponent {
  private readonly router = inject(Router);
  private readonly formBuilder = inject(FormBuilder);
  private readonly authService = inject(AuthService);
  protected readonly utils = inject(UtilsService);
  protected readonly environment = environment;

  isLoading = signal(false);
  emailSent = signal(false);
  hasError = signal(false);

  registerForm = this.formBuilder.group({
    first_name: ['', [Validators.required]],
    last_name: ['', [Validators.required]],
    organization: ['', [Validators.required]],
    email: ['', [Validators.required, Validators.pattern(UtilsService.emailRegex)]],
  });

  register() {
    if (this.registerForm.invalid) {
      this.registerForm.markAllAsTouched();
      return;
    }
    this.isLoading.set(true);
    this.authService.register({
      firstName: this.registerForm.get('first_name')?.value!,
      lastName: this.registerForm.get('last_name')?.value!,
      companyName: this.registerForm.get('organization')?.value!,
      email: this.registerForm.get('email')?.value!
    }).subscribe({
      next: () => this.emailSent.set(true),
      error: (err: HttpErrorResponse) => { this.isLoading.set(false); if (err.status !== 429) this.hasError.set(true); },
      complete: () => this.isLoading.set(false),
    });
  }

  gotoLogin() {
    this.router.navigateByUrl('/auth/login');
  }
}
