import Swal from 'sweetalert2';
import { NgxPaginationModule } from 'ngx-pagination';
import { Component, inject, OnInit, signal } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { HttpErrorResponse } from '@angular/common/http';
import { AddEditAuthorityComponent } from '@shared/components/dialogs';
import { AuthoritiesFilters, Authority, DialogResult, ErrorResponse, PaginationControls } from '@shared/interfaces';
import { NotificationService } from '@shared/services/notification.service';
import { AuthorityService } from '@features/authorities/services/authority.service';
import { UtilsService } from '@shared/utils';
import { SharedModule } from '@shared/shared-module';

@Component({
    selector: 'app-authorities',
    imports: [SharedModule, NgxPaginationModule],
    templateUrl: './authorities.component.html',
    styleUrl: './authorities.component.css',
})
export class AuthoritiesComponent implements OnInit {
    public authorities = signal<Authority[]>([]);

    public paginationControls: PaginationControls = {
        currentPage: 1,
        perPage: 10,
        totalPages: 0
    };

    private isLoading = signal<boolean>(false);

    private readonly authorityService = inject(AuthorityService);
    public readonly utils = inject(UtilsService);
    private readonly notificationService = inject(NotificationService);
    private readonly dialog = inject(MatDialog);

    ngOnInit(): void {
        this.getAuthorities({ offset: 0, limit: this.paginationControls.perPage });
    }

    getAuthorities(filters: AuthoritiesFilters) {
        this.isLoading.set(true);
        this.authorityService.getAuthorities(filters).subscribe({
            next: (response) => {
                this.authorities.set(response.data);
                this.paginationControls.totalPages = response.totalRecords;
            },
            error: (error: HttpErrorResponse) => {
                const err: ErrorResponse = error.error;
                if (err.statusCode > 400) this.notificationService.error('Error loading authorities');
            },
            complete: () => { this.isLoading.set(false); }
        });
    }

    changePage(page: number) {
        const offset = (page - 1) * this.paginationControls.perPage;
        this.paginationControls.currentPage = page;
        this.getAuthorities({ offset, limit: this.paginationControls.perPage });
    }

    addAuthority() {
        this.dialog.open(AddEditAuthorityComponent, {
            width: '70%',
            height: 'auto',
            disableClose: true,
        }).afterClosed().subscribe((result: DialogResult) => {
            if (result?.action === 'Save') {
                this.notificationService.show('Authority created successfully');
                this.getAuthorities({ offset: 0, limit: this.paginationControls.perPage });
            }
        });
    }

    editAuthority(id: string) {
        this.isLoading.set(true);
        this.authorityService.getAuthority(id).subscribe({
            next: (authority) => {
                this.dialog.open(AddEditAuthorityComponent, {
                    width: '70%',
                    height: 'auto',
                    disableClose: true,
                    data: { authority }
                }).afterClosed().subscribe((result: DialogResult) => {
                    if (result?.action === 'Save') {
                        this.notificationService.show('Authority updated successfully');
                        this.getAuthorities({ offset: 0, limit: this.paginationControls.perPage });
                    }
                });
            },
            error: (error: HttpErrorResponse) => {
                const err: ErrorResponse = error.error;
                this.isLoading.set(false);
                if (err.statusCode > 400) this.notificationService.error('Error loading authority');
            },
            complete: () => { this.isLoading.set(false); }
        });
    }

    deleteAuthority(id: string) {
        const authority = this.authorities().find(a => a.id === id);
        if (!authority) return;

        Swal.fire({
            title: 'Delete this authority?',
            text: `You are about to delete ${authority.name}`,
            icon: 'question',
            showCancelButton: true,
            showConfirmButton: true,
            customClass:{
                confirmButton:'linear-ic',
                cancelButton:'linear-rr'
            },
            confirmButtonColor: UtilsService.confirmButtonColor,
            cancelButtonColor: UtilsService.cancelButtonColor,
        }).then((result) => {
            if (result.isConfirmed) {
                this.isLoading.set(true);
                this.authorityService.deleteAuthority(id).subscribe({
                    next: () => {
                        this.isLoading.set(false);
                        this.notificationService.show(`${authority.name} deleted`);
                        this.getAuthorities({ offset: 0, limit: this.paginationControls.perPage });
                    },
                    error: (error: HttpErrorResponse) => {
                        const err = error.error as ErrorResponse;
                        this.isLoading.set(false);
                        if (err.statusCode === 400) this.notificationService.error('Cannot delete this authority');
                    },
                    complete: () => { this.isLoading.set(false); }
                });
            }
        });
    }
}
