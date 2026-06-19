

import { HttpErrorResponse } from '@angular/common/http';
import { Component, Inject, inject, OnInit, signal } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { AuthService } from '@core/auth/services';
import { AppRole } from '@core/guards';
import { UserService } from '@features/users/services/user.service';
import { GenericDialogComponent } from '@shared/components/generic-dialog/generic-dialog.component';
import { ErrorResponse, UserRequest, User } from '@shared/interfaces';
import { NotificationService } from '@shared/services/notification.service';
import { SharedModule } from '@shared/shared-module';
import { UtilsService } from '@shared/utils';

@Component({
  selector: 'app-add-edit-users',
  standalone: true,
  imports: [GenericDialogComponent, SharedModule],
  templateUrl: './add-edit-users.components.html',
  styleUrl: './add-edit-users.components.css',
})
export class AddEditUsersComponents implements OnInit {

  public roles: AppRole[] = [
    'ADMIN',
    'OWNER',
    'EMPLOYE'
  ]
  public title = 'Add User'

  private readonly authService = inject(AuthService)
  private readonly userService = inject(UserService);
  public readonly utils = inject(UtilsService);
  private readonly notificationService = inject(NotificationService)
  private readonly dialogRef = inject(MatDialogRef<AddEditUsersComponents>);
  private readonly formBuilder = inject(FormBuilder);
  private readonly data = inject(MAT_DIALOG_DATA);

  private readonly user = this.data ? this.data.user as User : null;

  public isLoading = signal<boolean>(false);


  public readonly userForm = this.formBuilder.group({
    first_name: ['', [Validators.required, Validators.minLength(3)]],
    last_name: ['', [Validators.required, Validators.minLength(3)]],
    email: ['', [Validators.required, Validators.pattern(UtilsService.emailRegex)]],
    rol: ['EMPLOYE', [Validators.required],]
  })

  ngOnInit(): void {

    this.getCatalogRoles()

    this.initForm()

  }

  initForm() {
    if (this.user) {
      this.title = 'Edit User';
      this.userForm.get('first_name')?.setValue(this.user.firstName)
      this.userForm.get('last_name')?.setValue(this.user.lastName)
      this.userForm.get('email')?.setValue(this.user.email)
      this.userForm.get('rol')?.setValue(this.user.role)
    }
  }


  saveUser() {
    if (this.userForm.invalid) {
      this.userForm.markAllAsTouched();
      return;
    }
    this.isLoading.set(false);

    const userRequest: UserRequest = {

      email: this.userForm.get('email')?.value!,
      firstName: this.userForm.get('first_name')?.value!,
      lastName: this.userForm.get('last_name')?.value!,
      rol: this.userForm.get('rol')?.value! as AppRole
    }


    if (this.user)
      this.userService.updateUser(this.user.id, userRequest).subscribe({
        next: () => {
          this.isLoading.set(false);
          this.dialogRef.close({ action: 'Save', payload: null })
        },
        error: (error: HttpErrorResponse) => {
          const err = error.error as ErrorResponse;

          this.isLoading.set(false);

          if (err.statusCode === 429) this.notificationService.show("Too many attemps wait 5 minutes and try again")

          if (err.statusCode === 400) {
            this.notificationService.show('Some fields are invalid');
          }

        },
        complete: () => {
          this.isLoading.set(false);
        }
      })
    else
      this.userService.saveUser(userRequest).subscribe({
        next: () => {
          this.isLoading.set(false);
          this.dialogRef.close({ action: 'Save', payload: null })
        },
        error: (error: HttpErrorResponse) => {
          const err = error.error as ErrorResponse;

          this.isLoading.set(false);

          if (err.statusCode === 429) this.notificationService.show("Too many attemps wait 5 minutes and try again")

          if (err.statusCode === 400) {
            this.notificationService.show('Some fields are invalid');
          }

        },
        complete: () => {
          this.isLoading.set(false);
        }
      })

  }
  getCatalogRoles() {
    const payload = this.authService.getPayload();
    if (payload && payload.role === 'OWNER')
      this.roles = this.roles.filter((rol) => rol !== 'OWNER');

    if (payload && payload.role === 'ADMIN')
      this.roles = this.roles.filter((rol) => rol === 'EMPLOYE');

  }



  onCancel() {
    this.dialogRef.close({ action: 'Cancel', payload: null })
  }

}
