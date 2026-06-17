import { Component, inject } from '@angular/core';
import { SharedModule } from '@shared/shared-module'
import { CdkStepLabel } from "@angular/cdk/stepper";
import { Router } from '@angular/router';

@Component({
  selector: 'app-login.component',
  standalone: true,
  imports: [SharedModule],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css',
})
export class LoginComponent {
  private readonly router = inject(Router);

  gotoRegister() {
    this.router.navigateByUrl("/auth/register")
  }
}
