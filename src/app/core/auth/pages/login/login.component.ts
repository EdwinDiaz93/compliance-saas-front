import { Component, inject } from '@angular/core';
import { SharedModule } from '@shared/shared-module'
import { Router } from '@angular/router';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AuthService } from '@core/auth/services';
import { UtilsService } from '@shared/utils';

@Component({
  selector: 'app-login.component',
  standalone: true,
  imports: [SharedModule],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css',
})
export class LoginComponent {

  private readonly router = inject(Router);
  private readonly formBuilder = inject(FormBuilder);
  private readonly authService = inject(AuthService);
  private readonly utilsService = inject(UtilsService);

  public loginForm = this.formBuilder.group({
    tenant: ['', [Validators.required]],
    email: ['', [Validators.required, Validators.pattern(UtilsService.passwordRegex)]]
  });

  login() {
    if (this.loginForm.invalid) {
      this.loginForm.markAllAsTouched();
      return;
    }
  }

  isValidField = (form: FormGroup, key: string) =>
    this.utilsService.isValidField(form, key);


  getErrorField = (form: FormGroup, key: string) =>
    this.utilsService.getErrorField(form, key);


  gotoRegister() {
    this.router.navigateByUrl("/auth/register")
  }
}
