import Swal from 'sweetalert2';
import { NgxPaginationModule } from 'ngx-pagination'
import { Component, inject, OnInit, signal } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { HttpErrorResponse } from '@angular/common/http';
import { AddEditUsersComponents } from '@shared/components/dialogs';
import { DialogResult, ErrorResponse, PaginationControls, User, UsersFilters } from '@shared/interfaces';
import { NotificationService } from '@shared/services/notification.service';
import { UserService } from '@features/users/services/user.service';
import { UtilsService } from '@shared/utils';
import { SharedModule } from '@shared/shared-module';
import { MatTabChangeEvent } from '@angular/material/tabs';


@Component({
  selector: 'app-users.component',
  imports: [SharedModule, NgxPaginationModule],
  templateUrl: './users.component.html',
  styleUrl: './users.component.css',
})
export class UsersComponent implements OnInit {



  public users = signal<User[]>([]);
  public selectedUsers = signal<User[]>([]);

  public checkAll = signal<boolean>(false);
  public tabIndex = signal<number>(0);

  public paginationControls: PaginationControls = {
    currentPage: 1,
    perPage: 5,
    totalPages: 0
  }

  private isLoading = signal<boolean>(false);

  private readonly userService = inject(UserService);
  public readonly utils = inject(UtilsService)
  private readonly notificationService = inject(NotificationService);
  private dialog = inject(MatDialog);



  ngOnInit(): void {
    this.getUsers({ offset: 0, limit: this.paginationControls.perPage });
  }

  getUsers(filters: UsersFilters) {
    this.isLoading.set(true);
    this.userService.getUsers(filters).subscribe({
      next: (response) => {
        this.users.set(response.data);
        this.paginationControls.totalPages = response.totalRecords;
      },
      error: (error: HttpErrorResponse) => {
        const err: ErrorResponse = error.error;
        if (err.statusCode > 400) this.notificationService.error('Error loading users');
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

    // Solo los PENDING pueden seleccionarse — checkAll se activa cuando todos los PENDING estan marcados
    const pendingUsers = this.users().filter(user => user.status === 'PENDING');
    const allChecked = pendingUsers.length > 0 && pendingUsers.every(user => user.selected);
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
          this.getUsers(this.currentFilters());
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
          this.getUsers(this.currentFilters())
        },
        error: (error: HttpErrorResponse) => {
          const err: ErrorResponse = error.error;
          if (err.statusCode > 400) this.notificationService.error('Error sending invitations to  users');
        },
        complete: () => {
          this.notificationService.show("Email Sent");
          this.isLoading.set(false);
        }
      });
    }
    else {
      const userIds = this.users().filter(user => user.selected).map(user => user.id);
      if (userIds.length === 0) {
        this.notificationService.warn('No users selected');
        return;
      }
      this.userService.sendInvitations(userIds).subscribe({
        next: () => {
          this.getUsers(this.currentFilters())
        },
        error: (error: HttpErrorResponse) => {
          const err: ErrorResponse = error.error;
          if (err.statusCode > 400) this.notificationService.error('Error sending invitations to  users');
        },
        complete: () => {
          this.notificationService.show("Email Sent");
          this.isLoading.set(false);
        }
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
                this.notificationService.show("User updated successfully");
                this.getUsers(this.currentFilters());
                break;
              case 'Cancel':
                this.notificationService.show("Canceled");
                break;
            }
          })
        },
        error: (error: HttpErrorResponse) => {
          const err: ErrorResponse = error.error;
          if (err.statusCode > 400) this.notificationService.error('Error loading this user');
        },
        complete: () => { this.isLoading.set(false); }
      });
  }

  tabChange(event: MatTabChangeEvent) {
    this.tabIndex.set(event.index);
    switch (this.tabIndex()) {
      case 0:
        this.getUsers({
          offset: 0,
          limit: this.paginationControls.perPage,
        });
        break;
      case 1:
        this.getUsers({
          offset: 0,
          limit: this.paginationControls.perPage,
          filters: {
            status: 'DELETED'
          }
        });
        break;
    }
  }

  deleteUser(id: string) {
    const user = this.users().find(user => user.id === id);
    if (!user) return;

    Swal.fire({
      title: "Delete this user?",
      text: `You are about to delete the user ${user.firstName} ${user.lastName}`,
      icon: "question",
      showCancelButton: true,
      customClass:{
                confirmButton:'linear-ic',
                cancelButton:'linear-rr'
            },
      showConfirmButton: true,
      confirmButtonColor: UtilsService.confirmButtonColor,
      cancelButtonColor: UtilsService.cancelButtonColor
    }).then((result) => {

      if (result.isConfirmed) {
        this.isLoading.set(true)
        this.userService.deleteUser(user.id).subscribe({
          next: () => {
            this.isLoading.set(false);
            this.notificationService.show(`User ${user.firstName} ${user.lastName} deleted!`);
            this.getUsers(this.currentFilters())
          },
          error: (error: HttpErrorResponse) => {
            const err = error.error as ErrorResponse;

            this.isLoading.set(false);

            if (err.statusCode === 429) this.notificationService.warn("Too many attemps wait 5 minutes and try again")

            if (err.statusCode === 400) {
              this.notificationService.error('Some fields are invalid');
            }

          },
          complete: () => {
            this.isLoading.set(false);
          }
        })
      }
    });
  }
  restoreUser(userId: string) {
    const user = this.users().find((user) => user.id === userId)!;
    Swal.fire({
      title: "Restore this user?",
      text: `You are about to restore the user ${user.firstName} ${user.lastName}`,
      icon: "question",
      showCancelButton: true,
      customClass:{
                confirmButton:'linear-ic',
                cancelButton:'linear-rr'
            },
      showConfirmButton: true,
      confirmButtonColor: UtilsService.confirmButtonColor,
      cancelButtonColor: UtilsService.cancelButtonColor
    }).then((result) => {
      if (result.isConfirmed) {
        this.userService.restoreUser(userId).subscribe({
          next: () => {
            this.isLoading.set(false);
            this.getUsers(this.currentFilters())
          },
          error: (error: HttpErrorResponse) => {
            const err = error.error as ErrorResponse;

            this.isLoading.set(false);

            if (err.statusCode === 429) this.notificationService.warn("Too many attemps wait 5 minutes and try again")

            if (err.statusCode === 400) {
              this.notificationService.error('Some fields are invalid');
            }
          },
          complete: () => {
            this.isLoading.set(false);
          }

        })
      }
    })
  }
  changePage(page: number) {
    this.paginationControls.currentPage = page;
    const offset = (page - 1) * this.paginationControls.perPage;
    const filters: UsersFilters = {
      offset,
      limit: this.paginationControls.perPage,
      ...(this.tabIndex() === 1 && { filters: { status: 'DELETED' } })
    };
    this.getUsers(filters);
  }

  private currentFilters(): UsersFilters {
    return {
      offset: 0,
      limit: this.paginationControls.perPage,
      ...(this.tabIndex() === 1 && { filters: { status: 'DELETED' } })
    };
  }



}
