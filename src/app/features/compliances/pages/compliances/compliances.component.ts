import Swal from 'sweetalert2';
import { NgxPaginationModule } from 'ngx-pagination';
import { Component, inject, OnInit, signal } from '@angular/core';
import { Router } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { HttpErrorResponse } from '@angular/common/http';
import { AddEditComplianceComponent } from '@shared/components/dialogs';
import {
    ComplianceItem, CompliancesFilters, ComplianceStatus,
    DialogResult, ErrorResponse, Location, PaginationControls
} from '@shared/interfaces';
import { NotificationService } from '@shared/services/notification.service';
import { ComplianceService } from '@features/compliances/services/compliance.service';
import { LocationService } from '@features/locations/services/location.service';
import { AuthService } from '@core/auth/services';
import { UtilsService } from '@shared/utils';
import { SharedModule } from '@shared/shared-module';

@Component({
    selector: 'app-compliances',
    imports: [SharedModule, NgxPaginationModule],
    templateUrl: './compliances.component.html',
    styleUrl: './compliances.component.css',
})
export class CompliancesComponent implements OnInit {
    public compliances = signal<ComplianceItem[]>([]);
    public locations = signal<Location[]>([]);
    public selectedLocationId = signal<string>('');
    public selectedLocationName = () => this.locations().find(l => l.id === this.selectedLocationId())?.name ?? '';
    public selectedLocationState = () => this.locations().find(l => l.id === this.selectedLocationId())?.state ?? '';

    public paginationControls: PaginationControls = {
        currentPage: 1,
        perPage: 10,
        totalPages: 0,
    };

    private isLoading = signal<boolean>(false);
    public isUploading = signal<boolean>(false);

    private readonly complianceService = inject(ComplianceService);
    private readonly locationService = inject(LocationService);
    private readonly authService = inject(AuthService);
    private readonly router = inject(Router);
    public readonly utils = inject(UtilsService);
    private readonly notificationService = inject(NotificationService);
    private readonly dialog = inject(MatDialog);

    public readonly payload = this.authService.getPayload();
    public readonly isTrial = signal<boolean>(this.payload?.tenantStatus === 'TRIAL');
    public readonly isOwner = signal<boolean>(this.payload?.role === 'OWNER');
    public readonly isEmployee = signal<boolean>(this.payload?.role === 'EMPLOYE');

    ngOnInit(): void {
        this.loadLocations();
    }

    loadLocations() {
        this.locationService.getLocations(true).subscribe({
            next: (locs) => {
                this.locations.set(locs);
                if (locs.length > 0) {
                    this.selectedLocationId.set(locs[0].id);
                    this.loadCompliances();
                }
            },
        });
    }

    loadCompliances() {
        if (!this.selectedLocationId()) return;
        this.isLoading.set(true);
        this.complianceService.getCompliances(this.currentFilters()).subscribe({
            next: (res) => {
                this.compliances.set(res.data);
                this.paginationControls.totalPages = res.totalRecords;
            },
            error: (error: HttpErrorResponse) => {
                const err: ErrorResponse = error.error;
                if (err?.statusCode > 400) this.notificationService.show('Error loading compliances');
            },
            complete: () => { this.isLoading.set(false); }
        });
    }

    onLocationChange(event: Event) {
        const id = (event.target as HTMLSelectElement).value;
        this.selectedLocationId.set(id);
        this.paginationControls.currentPage = 1;
        this.loadCompliances();
    }

    changePage(page: number) {
        this.paginationControls.currentPage = page;
        this.loadCompliances();
    }

    private currentFilters(): CompliancesFilters {
        return {
            offset: (this.paginationControls.currentPage - 1) * this.paginationControls.perPage,
            limit: this.paginationControls.perPage,
            filters: { locationId: this.selectedLocationId() }
        };
    }

    addCompliance() {
        if (this.locations().length===0) {
            this.notificationService.show('No locations found, contact the owner to add compliances. ');
            return;
        }
        this.dialog.open(AddEditComplianceComponent, {
            width: '70%',
            height: 'auto',
            disableClose: true,
            data: { locationId: this.selectedLocationId(), locationName: this.selectedLocationName(), locationState: this.selectedLocationState() }
        }).afterClosed().subscribe((result: DialogResult) => {
            if (result?.action === 'Save') {
                this.notificationService.show('Compliance created successfully');
                this.loadCompliances();
            }
        });
    }

    editCompliance(id: string) {
        this.isLoading.set(true);
        this.complianceService.getCompliance(id).subscribe({
            next: (compliance) => {
                this.dialog.open(AddEditComplianceComponent, {
                    width: '70%',
                    height: 'auto',
                    disableClose: true,
                    data: { compliance, locationId: this.selectedLocationId(), locationName: this.selectedLocationName(), locationState: this.selectedLocationState() }
                }).afterClosed().subscribe((result: DialogResult) => {
                    if (result?.action === 'Save') {
                        this.notificationService.show('Compliance updated successfully');
                        this.loadCompliances();
                    }
                });
            },
            error: () => { this.isLoading.set(false); },
            complete: () => { this.isLoading.set(false); }
        });
    }

    archiveCompliance(id: string) {
        const compliance = this.compliances().find(c => c.id === id);
        if (!compliance) return;

        Swal.fire({
            title: 'Archive this compliance?',
            text: `${compliance.name} will be marked as archived`,
            icon: 'question',
            showCancelButton: true,
            showConfirmButton: true,
            customClass: { confirmButton: 'linear-ic', cancelButton: 'linear-rr' },
            confirmButtonColor: UtilsService.confirmButtonColor,
            cancelButtonColor: UtilsService.cancelButtonColor,
        }).then((result) => {
            if (result.isConfirmed) {
                this.isLoading.set(true);
                this.complianceService.archiveCompliance(id).subscribe({
                    next: () => {
                        this.isLoading.set(false);
                        this.notificationService.show('Compliance archived');
                        this.loadCompliances();
                    },
                    error: () => { this.isLoading.set(false); },
                    complete: () => { this.isLoading.set(false); }
                });
            }
        });
    }

    deleteCompliance(id: string) {
        const compliance = this.compliances().find(c => c.id === id);
        if (!compliance) return;

        Swal.fire({
            title: 'Delete this compliance?',
            text: `You are about to permanently delete ${compliance.name}`,
            icon: 'question',
            showCancelButton: true,
            showConfirmButton: true,
            customClass: { confirmButton: 'linear-ic', cancelButton: 'linear-rr' },
            confirmButtonColor: UtilsService.confirmButtonColor,
            cancelButtonColor: UtilsService.cancelButtonColor,
        }).then((result) => {
            if (result.isConfirmed) {
                this.isLoading.set(true);
                this.complianceService.deleteCompliance(id).subscribe({
                    next: () => {
                        this.isLoading.set(false);
                        this.notificationService.show(`${compliance.name} deleted`);
                        this.loadCompliances();
                    },
                    error: () => { this.isLoading.set(false); },
                    complete: () => { this.isLoading.set(false); }
                });
            }
        });
    }

    triggerFileInput(id: string) {
        const input = document.getElementById(`file-input-${id}`) as HTMLInputElement;
        input?.click();
    }

    uploadDocument(id: string, event: Event) {
        const file = (event.target as HTMLInputElement).files?.[0];
        if (!file) return;
        this.isUploading.set(true);

        this.complianceService.getUploadUrl(id, file.name, file.type, file.size).subscribe({
            next: ({ uploadUrl, Key }) => {
                this.complianceService.uploadToS3(uploadUrl, file).subscribe({
                    next: () => {
                        this.complianceService.saveDocumentUrl(id, Key).subscribe({
                            next: () => {
                                this.isUploading.set(false);
                                this.notificationService.show('Document uploaded successfully');
                                this.loadCompliances();
                            },
                            error: () => {
                                this.isUploading.set(false);
                                this.notificationService.show('Error saving document reference');
                            }
                        });
                    },
                    error: () => {
                        this.isUploading.set(false);
                        this.notificationService.show('Error uploading to storage');
                    }
                });
            },
            error: () => {
                this.isUploading.set(false);
                this.notificationService.show('Error getting upload URL');
            }
        });
    }

    downloadDocument(id: string) {
        this.complianceService.getDownloadUrl(id).subscribe({
            next: (url) => { window.open(url, '_blank'); },
            error: () => { this.notificationService.show('Error getting download URL'); }
        });
    }

    goToLocations() {
        this.router.navigate(['/locations']);
    }

    statusClass(status: ComplianceStatus): string {
        const map: Record<ComplianceStatus, string> = {
            ACTIVE: 'bg-teal-100 text-teal-800',
            EXPIRES_SOON: 'bg-amber-100 text-amber-800',
            EXPIRED: 'bg-red-100 text-red-800',
            ARCHIVED: 'bg-slate-100 text-slate-600',
        };
        return map[status] ?? 'bg-slate-100 text-slate-600';
    }
}
