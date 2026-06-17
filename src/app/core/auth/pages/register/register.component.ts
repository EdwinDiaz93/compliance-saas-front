import { Component, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { FormBuilder, Validators } from '@angular/forms';
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
    firstName: ['', [Validators.required]],
    lastName: ['', [Validators.required]],
    companyName: ['', [Validators.required]],
    email: ['', [Validators.required, Validators.pattern(UtilsService.emailRegex)]],
  });

  register() {
    if (this.registerForm.invalid) {
      this.registerForm.markAllAsTouched();
      return;
    }
    this.isLoading.set(true);
    this.authService.register(this.registerForm.getRawValue() as any).subscribe({
      next: () => this.emailSent.set(true),
      error: () => { this.isLoading.set(false); this.hasError.set(true); },
      complete: () => this.isLoading.set(false),
    });
  }

  gotoLogin() {
    this.router.navigateByUrl('/auth/login');
  }
}
