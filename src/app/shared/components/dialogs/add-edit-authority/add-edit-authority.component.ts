import { Component, inject, OnInit, signal } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { HttpErrorResponse } from '@angular/common/http';
import { GenericDialogComponent } from '@shared/components/generic-dialog/generic-dialog.component';
import { SharedModule } from '@shared/shared-module';
import { UtilsService } from '@shared/utils';
import { NotificationService } from '@shared/services/notification.service';
import { AuthorityService } from '@features/authorities/services/authority.service';
import { Authority, AuthorityLevel, AuthorityRequest, ErrorResponse } from '@shared/interfaces';
import { US_STATES } from '../add-edit-location/add-edit-location.component';

@Component({
    selector: 'app-add-edit-authority',
    standalone: true,
    imports: [GenericDialogComponent, SharedModule],
    templateUrl: './add-edit-authority.component.html',
    styleUrl: './add-edit-authority.component.css',
})
export class AddEditAuthorityComponent implements OnInit {
    public title = 'Add Authority';
    public states = US_STATES;
    public levels: AuthorityLevel[] = ['FEDERAL', 'STATE', 'LOCAL'];

    private readonly authorityService = inject(AuthorityService);
    public readonly utils = inject(UtilsService);
    private readonly notificationService = inject(NotificationService);
    private readonly dialogRef = inject(MatDialogRef<AddEditAuthorityComponent>);
    private readonly formBuilder = inject(FormBuilder);
    private readonly data = inject(MAT_DIALOG_DATA);

    private readonly authority: Authority | null = this.data?.authority ?? null;

    public isLoading = signal<boolean>(false);

    public readonly authorityForm = this.formBuilder.group({
        name: ['', [Validators.required]],
        level: ['LOCAL', [Validators.required]],
        stateCode: [''],
        renewalUrl: ['', [Validators.required, Validators.pattern(/https?:\/\/.+/)]],
    });

    ngOnInit(): void {
        if (this.authority) {
            this.title = 'Edit Authority';
            this.authorityForm.patchValue({
                name: this.authority.name,
                level: this.authority.level,
                stateCode: this.authority.stateCode ?? '',
                renewalUrl: this.authority.renewalUrl ?? '',
            });
        }
    }

    get showStateCode(): boolean {
        const level = this.authorityForm.get('level')?.value;
        return level === 'STATE' || level === 'LOCAL';
    }

    saveAuthority() {
        if (this.authorityForm.invalid) {
            this.authorityForm.markAllAsTouched();
            return;
        }
        this.isLoading.set(true);

        const request: AuthorityRequest = {
            name: this.authorityForm.get('name')?.value!,
            level: this.authorityForm.get('level')?.value! as AuthorityLevel,
            renewalUrl: this.authorityForm.get('renewalUrl')?.value!,
            ...(this.showStateCode && this.authorityForm.get('stateCode')?.value
                ? { stateCode: this.authorityForm.get('stateCode')?.value! }
                : {}),
        };

        const operation = this.authority
            ? this.authorityService.updateAuthority(this.authority.id, request)
            : this.authorityService.saveAuthority(request);

        operation.subscribe({
            next: () => {
                this.isLoading.set(false);
                this.dialogRef.close({ action: 'Save', payload: null });
            },
            error: (error: HttpErrorResponse) => {
                const err = error.error as ErrorResponse;
                this.isLoading.set(false);
                if (err.statusCode === 429) this.notificationService.show('Too many attempts, wait 5 minutes and try again');
                if (err.statusCode === 400) this.notificationService.show('Some fields are invalid');
            },
            complete: () => { this.isLoading.set(false); }
        });
    }

    onCancel() {
        this.dialogRef.close({ action: 'Cancel', payload: null });
    }
}
