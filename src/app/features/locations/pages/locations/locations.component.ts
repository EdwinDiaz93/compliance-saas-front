import Swal from 'sweetalert2';
import { Component, inject, OnInit, signal } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { HttpErrorResponse } from '@angular/common/http';
import { MatTabChangeEvent } from '@angular/material/tabs';
import { AddEditLocationComponent } from '@shared/components/dialogs';
import { DialogResult, ErrorResponse, Location } from '@shared/interfaces';
import { NotificationService } from '@shared/services/notification.service';
import { LocationService } from '@features/locations/services/location.service';
import { UtilsService } from '@shared/utils';
import { SharedModule } from '@shared/shared-module';

@Component({
    selector: 'app-locations',
    imports: [SharedModule],
    templateUrl: './locations.component.html',
    styleUrl: './locations.component.css',
})
export class LocationsComponent implements OnInit {
    public locations = signal<Location[]>([]);
    public tabIndex = signal<number>(0);

    private isLoading = signal<boolean>(false);

    private readonly locationService = inject(LocationService);
    public readonly utils = inject(UtilsService);
    private readonly notificationService = inject(NotificationService);
    private readonly dialog = inject(MatDialog);

    ngOnInit(): void {
        this.getLocations(true);
    }

    getLocations(isActive: boolean) {
        this.isLoading.set(true);
        this.locationService.getLocations(isActive).subscribe({
            next: (locations) => { this.locations.set(locations); },
            error: (error: HttpErrorResponse) => {
                const err: ErrorResponse = error.error;
                if (err.statusCode > 400) this.notificationService.show('Error loading locations');
            },
            complete: () => { this.isLoading.set(false); }
        });
    }

    tabChange(event: MatTabChangeEvent) {
        this.tabIndex.set(event.index);
        this.getLocations(event.index === 0);
    }

    addLocation() {
        this.dialog.open(AddEditLocationComponent, {
            width: '70%',
            height: 'auto',
            disableClose: true,
        }).afterClosed().subscribe((result: DialogResult) => {
            if (result?.action === 'Save') {
                this.notificationService.show('Location created successfully');
                this.getLocations(this.tabIndex() === 0);
            }
        });
    }

    editLocation(id: string) {
        const location = this.locations().find(l => l.id === id);
        if (!location) return;

        this.dialog.open(AddEditLocationComponent, {
            width: '70%',
            height: 'auto',
            disableClose: true,
            data: { location }
        }).afterClosed().subscribe((result: DialogResult) => {
            if (result?.action === 'Save') {
                this.notificationService.show('Location updated successfully');
                this.getLocations(this.tabIndex() === 0);
            }
        });
    }

    toggleActive(id: string) {
        const location = this.locations().find(l => l.id === id);
        if (!location) return;

        const action = location.isActive ? 'deactivate' : 'activate';
        Swal.fire({
            title: `${action.charAt(0).toUpperCase() + action.slice(1)} this location?`,
            text: `You are about to ${action} ${location.name}`,
            icon: 'question',
            showCancelButton: true,
            showConfirmButton: true,
            confirmButtonColor: UtilsService.confirmButtonColor,
            cancelButtonColor: UtilsService.cancelButtonColor,
        }).then((result) => {
            if (result.isConfirmed) {
                this.isLoading.set(true);
                this.locationService.toggleActive(id).subscribe({
                    next: () => {
                        this.isLoading.set(false);
                        this.notificationService.show(`Location ${action}d successfully`);
                        this.getLocations(this.tabIndex() === 0);
                    },
                    error: (error: HttpErrorResponse) => {
                        const err = error.error as ErrorResponse;
                        this.isLoading.set(false);
                        if (err.statusCode === 400) this.notificationService.show('Cannot perform this action');
                    },
                    complete: () => { this.isLoading.set(false); }
                });
            }
        });
    }

    deleteLocation(id: string) {
        const location = this.locations().find(l => l.id === id);
        if (!location) return;

        Swal.fire({
            title: 'Delete this location?',
            text: `You are about to delete ${location.name}. Cannot delete if it has compliance items linked.`,
            icon: 'question',
            showCancelButton: true,
            showConfirmButton: true,
            confirmButtonColor: UtilsService.confirmButtonColor,
            cancelButtonColor: UtilsService.cancelButtonColor,
        }).then((result) => {
            if (result.isConfirmed) {
                this.isLoading.set(true);
                this.locationService.deleteLocation(id).subscribe({
                    next: () => {
                        this.isLoading.set(false);
                        this.notificationService.show(`${location.name} deleted`);
                        this.getLocations(this.tabIndex() === 0);
                    },
                    error: (error: HttpErrorResponse) => {
                        const err = error.error as ErrorResponse;
                        this.isLoading.set(false);
                        if (err.statusCode === 400) this.notificationService.show('Cannot delete a location with active compliance items');
                    },
                    complete: () => { this.isLoading.set(false); }
                });
            }
        });
    }
}
