import { Component, inject, OnInit, signal } from '@angular/core';
import { SharedModule } from '@shared/shared-module';
import { Router } from '@angular/router';
import { FormBuilder, Validators } from '@angular/forms';
import { HttpErrorResponse } from '@angular/common/http';
import { AuthService } from '@core/auth/services';
import { UtilsService } from '@shared/utils';
import { environment } from 'environments';

const REMEMBER_KEY = 'remembered_login';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [SharedModule],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css',
})
export class LoginComponent implements OnInit {
  private readonly router = inject(Router);
  private readonly formBuilder = inject(FormBuilder);
  private readonly authService = inject(AuthService);
  protected readonly utils = inject(UtilsService);
  protected readonly environment = environment;

  isLoading = signal(false);
  emailSent = signal(false);
  hasError = signal(false);

  loginForm = this.formBuilder.group({
    organization: ['', [Validators.required]],
    email: ['', [Validators.required, Validators.pattern(UtilsService.emailRegex)]],
    rememberMe: [false],
  });

  ngOnInit() {
    const saved = localStorage.getItem(REMEMBER_KEY);
    if (saved) {
      const { organization, email } = JSON.parse(saved);
      this.loginForm.patchValue({ organization, email, rememberMe: true });
    }
  }

  login() {
    if (this.loginForm.invalid) {
      this.loginForm.markAllAsTouched();
      return;
    }
    this.hasError.set(false);
    this.isLoading.set(true);

    const { organization, email, rememberMe } = this.loginForm.value;

    if (rememberMe) {
      localStorage.setItem(REMEMBER_KEY, JSON.stringify({ organization, email }));
    } else {
      localStorage.removeItem(REMEMBER_KEY);
    }

    this.authService.login({ tenant: organization!, email: email! }).subscribe({
      next: () => this.emailSent.set(true),
      error: (err: HttpErrorResponse) => { this.isLoading.set(false); if (err.status !== 429) this.hasError.set(true); },
      complete: () => this.isLoading.set(false),
    });
  }

  gotoRegister() {
    this.router.navigateByUrl('/auth/register');
  }
}
