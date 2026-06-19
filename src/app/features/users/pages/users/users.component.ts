import { HttpErrorResponse } from '@angular/common/http';
import { Component, inject, OnInit, signal } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { UserService } from '@features/users/services/user.service';
import { AddEditUsersComponents } from '@shared/components/dialogs';
import { DialogResult, ErrorResponse, User, UsersFilters } from '@shared/interfaces';
import { NotificationService } from '@shared/services/notification.service';
import { UtilsService } from '@shared/utils';
import { switchMap } from 'rxjs';

@Component({
  selector: 'app-users.component',
  imports: [],
  templateUrl: './users.component.html',
  styleUrl: './users.component.css',
})
export class UsersComponent implements OnInit {





  public users = signal<User[]>([]);
  public selectedUsers = signal<User[]>([]);

  public checkAll = signal<boolean>(false);
  private isLoading = signal<boolean>(false);

  private readonly userService = inject(UserService);
  public readonly utils = inject(UtilsService)
  private readonly notificationService = inject(NotificationService);
  private dialog = inject(MatDialog);


  ngOnInit(): void {
    this.getUsers({ offset: 0, limit: 10 });
  }

  getUsers(filters: UsersFilters) {
    this.isLoading.set(true);
    this.userService.getUsers(filters).subscribe({
      next: (response) => {
        this.users.set(response.data);
      },
      error: (error: HttpErrorResponse) => {
        const err: ErrorResponse = error.error;
        if (err.statusCode > 400) this.notificationService.show('Error loading users');
      },
      complete: () => { this.isLoading.set(false); }
    });
  }


  onCheckAll() {
    this.checkAll.set(!this.checkAll());
    if (this.checkAll()) {
      // Se buscan los usuarios pending que han sido chequeados
      const checkAllUsers = this.users().map(user => ({ ...user, selected: user.status === 'PENDING' ? true : false }))
      this.users.set(checkAllUsers)
    } else {
      // Se buscan los usuarios pending que no han sido chequeados
      const unCheckedUser = this.users().map(user => ({ ...user, selected: user.status === 'PENDING' ? false : false }))
      this.users.set(unCheckedUser)
    }
  }

  checkOne(userId: string) {
    // Se actualiza el estado del seleccionado
    const users = this.users().map((user) => ({ ...user, selected: user.id === userId ? !user.selected : user.selected }));
    this.users.set(users);

    // Todos fueron chequeados
    const allChecked = this.users().every(user => user.selected);
    this.checkAll.set(allChecked);
  }

  addUser() {
    this.dialog.open(AddEditUsersComponents, {
      width: '70%',
      height: 'auto',

      disableClose: true,
    }).afterClosed().subscribe((result: DialogResult) => {
      switch (result.action) {
        case 'Save':
          this.notificationService.show("User created successfully");
          break;
        case 'Cancel':
          this.notificationService.show("Canceled");
          break;
      }

    })
  }

  sendInvitations(userId?: string) {
    this.isLoading.set(true);
    if (userId) {
      // one invitation
      this.userService.sendInvitations([userId]).subscribe({
        next: () => {
          this.getUsers({ offset: 0, limit: 10 })
        },
        error: (error: HttpErrorResponse) => {
          const err: ErrorResponse = error.error;
          if (err.statusCode > 400) this.notificationService.show('Error sending invitations to  users');
        },
        complete: () => { 
          this.notificationService.show("Email Sent");
          this.isLoading.set(false); }
      });
    }
    else {
      const userIds = this.users().filter(user => user.selected).map(user => user.id);
      if (userIds.length === 0) {
        this.notificationService.show('No users selected');
        return;
      }
      this.userService.sendInvitations(userIds).subscribe({
        next: () => {
          this.getUsers({ offset: 0, limit: 10 })
        },
        error: (error: HttpErrorResponse) => {
          const err: ErrorResponse = error.error;
          if (err.statusCode > 400) this.notificationService.show('Error sending invitations to  users');
        },
        complete: () => { 
          this.notificationService.show("Email Sent");
          this.isLoading.set(false); }
      });
    }
  }

  editUser(id: string) {
    this.isLoading.set(true);
    this.userService.getUser(id)
      .subscribe({
        next: (user) => {
          this.dialog.open(AddEditUsersComponents, {
            disableClose: true,
            width: '50%',
            height: 'auto',
            data: {
              user
            }
          }).afterClosed().subscribe((result: DialogResult) => {
            switch (result.action) {
              case 'Save':
                this.notificationService.show("User created successfully");
                this.getUsers({
                  offset: 0,
                  limit: 10
                });
                break;
              case 'Cancel':
                this.notificationService.show("Canceled");
                break;
            }
          })
        },
        error: (error: HttpErrorResponse) => {
          const err: ErrorResponse = error.error;
          if (err.statusCode > 400) this.notificationService.show('Error loading this user');
        },
        complete: () => { this.isLoading.set(false); }
      });
  }




}
