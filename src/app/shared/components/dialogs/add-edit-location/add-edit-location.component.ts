import { Component, inject, OnInit, signal } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { HttpErrorResponse } from '@angular/common/http';
import { GenericDialogComponent } from '@shared/components/generic-dialog/generic-dialog.component';
import { SharedModule } from '@shared/shared-module';
import { UtilsService } from '@shared/utils';
import { NotificationService } from '@shared/services/notification.service';
import { LocationService } from '@features/locations/services/location.service';
import { BusinessType, ErrorResponse, Location, LocationRequest } from '@shared/interfaces';

export const US_STATES = [
    'AL','AK','AZ','AR','CA','CO','CT','DE','FL','GA','HI','ID','IL','IN','IA',
    'KS','KY','LA','ME','MD','MA','MI','MN','MS','MO','MT','NE','NV','NH','NJ',
    'NM','NY','NC','ND','OH','OK','OR','PA','RI','SC','SD','TN','TX','UT','VT',
    'VA','WA','WV','WI','WY'
];

export const BUSINESS_TYPES: BusinessType[] = ['RESTAURANT', 'LIQUOR_STORE', 'RESTAURANT_WITH_BAR'];

@Component({
    selector: 'app-add-edit-location',
    standalone: true,
    imports: [GenericDialogComponent, SharedModule],
    templateUrl: './add-edit-location.component.html',
    styleUrl: './add-edit-location.component.css',
})
export class AddEditLocationComponent implements OnInit {
    public title = 'Add Location';
    public states = US_STATES;
    public businessTypes = BUSINESS_TYPES;

    private readonly locationService = inject(LocationService);
    public readonly utils = inject(UtilsService);
    private readonly notificationService = inject(NotificationService);
    private readonly dialogRef = inject(MatDialogRef<AddEditLocationComponent>);
    private readonly formBuilder = inject(FormBuilder);
    private readonly data = inject(MAT_DIALOG_DATA);

    private readonly location: Location | null = this.data?.location ?? null;

    public isLoading = signal<boolean>(false);

    public readonly locationForm = this.formBuilder.group({
        name: ['', [Validators.required, Validators.minLength(5)]],
        businessType: ['RESTAURANT', [Validators.required]],
        state: ['TX', [Validators.required]],
        city: ['', [Validators.required, Validators.minLength(3)]],
    });

    ngOnInit(): void {
        if (this.location) {
            this.title = 'Edit Location';
            this.locationForm.patchValue({
                name: this.location.name,
                businessType: this.location.businessType,
                state: this.location.state,
                city: this.location.city,
            });
        }
    }

    saveLocation() {
        if (this.locationForm.invalid) {
            this.locationForm.markAllAsTouched();
            return;
        }
        this.isLoading.set(true);

        const request: LocationRequest = {
            name: this.locationForm.get('name')?.value!,
            businessType: this.locationForm.get('businessType')?.value! as BusinessType,
            state: this.locationForm.get('state')?.value!,
            city: this.locationForm.get('city')?.value!,
        };

        const operation = this.location
            ? this.locationService.updateLocation(this.location.id, request)
            : this.locationService.saveLocation(request);

        operation.subscribe({
            next: (res: any) => {
                this.isLoading.set(false);
                this.dialogRef.close({ action: 'Save', payload: { compliancesCreated: res?.compliancesCreated ?? 0 } });
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
