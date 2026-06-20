import { Component, inject, OnInit, signal } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { HttpErrorResponse } from '@angular/common/http';
import { GenericDialogComponent } from '@shared/components/generic-dialog/generic-dialog.component';
import { SharedModule } from '@shared/shared-module';
import { UtilsService } from '@shared/utils';
import { NotificationService } from '@shared/services/notification.service';
import { ComplianceService } from '@features/compliances/services/compliance.service';
import { AuthorityService } from '@features/authorities/services/authority.service';
import { UserService } from '@features/users/services/user.service';
import { AuthService } from '@core/auth/services';
import {
    Authority, ComplianceItem, ComplianceItemRequest,
    ErrorResponse, LicenseType, User
} from '@shared/interfaces';

export const LICENSE_TYPES: LicenseType[] = [
    'FEDERAL_LICENSE', 'STATE_LICENSE', 'LOCAL_LICENSE',
    'HEALTH_PERMIT', 'ALCOHOL_PERMIT', 'EMPLOYEE_CERT', 'INSPECTION'
];

@Component({
    selector: 'app-add-edit-compliance',
    standalone: true,
    imports: [GenericDialogComponent, SharedModule],
    templateUrl: './add-edit-compliance.component.html',
    styleUrl: './add-edit-compliance.component.css',
})
export class AddEditComplianceComponent implements OnInit {
    public title = 'Add Compliance';
    public licenseTypes = LICENSE_TYPES;
    public authorities = signal<Authority[]>([]);
    public users = signal<User[]>([]);

    private readonly complianceService = inject(ComplianceService);
    private readonly authorityService = inject(AuthorityService);
    private readonly userService = inject(UserService);
    private readonly authService = inject(AuthService);
    public readonly utils = inject(UtilsService);
    private readonly notificationService = inject(NotificationService);
    private readonly dialogRef = inject(MatDialogRef<AddEditComplianceComponent>);
    private readonly formBuilder = inject(FormBuilder);
    private readonly data = inject(MAT_DIALOG_DATA);

    private readonly compliance: ComplianceItem | null = this.data?.compliance ?? null;
    public readonly locationId: string = this.data?.locationId ?? '';
    public readonly payload = this.authService.getPayload();
    public readonly isOwnerOrAdmin = this.payload?.role === 'OWNER' || this.payload?.role === 'ADMIN';

    public isLoading = signal<boolean>(false);

    public readonly complianceForm = this.formBuilder.group({
        name: ['', [Validators.required]],
        category: ['STATE_LICENSE', [Validators.required]],
        expiresAt: [''],
        issuedAt: [''],
        issuingAuthorityId: [''],
        userId: [''],
        notes: [''],
    });

    ngOnInit(): void {
        this.loadAuthorities();
        if (this.isOwnerOrAdmin) this.loadUsers();

        if (this.compliance) {
            this.title = 'Edit Compliance';
            this.complianceForm.patchValue({
                name: this.compliance.name,
                category: this.compliance.category,
                expiresAt: this.compliance.expiresAt ? this.compliance.expiresAt.substring(0, 10) : '',
                issuedAt: this.compliance.issuedAt ? this.compliance.issuedAt.substring(0, 10) : '',
                issuingAuthorityId: this.compliance.issuingAuthorityId ?? '',
                userId: this.compliance.userId ?? '',
                notes: this.compliance.notes ?? '',
            });
        }
    }

    loadAuthorities() {
        this.authorityService.getAuthorities({ offset: 0, limit: 100 }).subscribe({
            next: (res) => this.authorities.set(res.data)
        });
    }

    loadUsers() {
        this.userService.getUsers({ offset: 0, limit: 100 }).subscribe({
            next: (res) => this.users.set(res.data)
        });
    }

    saveCompliance() {
        if (this.complianceForm.invalid) {
            this.complianceForm.markAllAsTouched();
            return;
        }
        this.isLoading.set(true);

        const v = this.complianceForm.value;
        const item: ComplianceItemRequest = {
            name: v.name!,
            category: v.category! as LicenseType,
            ...(v.expiresAt && { expiresAt: v.expiresAt }),
            ...(v.issuedAt && { issuedAt: v.issuedAt }),
            ...(v.issuingAuthorityId && { issuingAuthorityId: v.issuingAuthorityId }),
            ...(v.userId && { userId: v.userId }),
            ...(v.notes && { notes: v.notes }),
        };

        const operation = this.compliance
            ? this.complianceService.updateCompliance(this.compliance.id, item)
            : this.complianceService.createCompliance({ locationId: this.locationId, compliances: [item] });

        operation.subscribe({
            next: () => {
                this.isLoading.set(false);
                this.dialogRef.close({ action: 'Save', payload: null });
            },
            error: (error: HttpErrorResponse) => {
                const err = error.error as ErrorResponse;
                this.isLoading.set(false);
                if (err.statusCode === 429) this.notificationService.show('Too many attempts, wait a moment and try again');
                if (err.statusCode === 400) this.notificationService.show('Some fields are invalid');
            },
            complete: () => { this.isLoading.set(false); }
        });
    }

    onCancel() {
        this.dialogRef.close({ action: 'Cancel', payload: null });
    }
}
