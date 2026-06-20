import { Component, inject, OnInit, signal } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { RouterLink } from '@angular/router';
import { DashboardService } from '@features/dashboard/services/dashboard.service';
import { LocationService } from '@features/locations/services/location.service';
import { NotificationService } from '@shared/services/notification.service';
import { Location, PaginationControls, StatusSummary, UserComplianceSummary } from '@shared/interfaces';
import { SharedModule } from '@shared/shared-module';
import { NgxPaginationModule } from 'ngx-pagination';

@Component({
    selector: 'app-dashboard',
    imports: [SharedModule, NgxPaginationModule, RouterLink],
    templateUrl: './dashboard.component.html',
    styleUrl: './dashboard.component.css',
})
export class DashboardComponent implements OnInit {
    public locations = signal<Location[]>([]);
    public selectedLocationId = signal<string>('');
    public summary = signal<StatusSummary[]>([]);
    public usersSummary = signal<UserComplianceSummary[]>([]);

    public paginationControls: PaginationControls = {
        currentPage: 1,
        perPage: 10,
        totalPages: 0,
    };

    private readonly dashboardService = inject(DashboardService);
    private readonly locationService = inject(LocationService);
    private readonly notificationService = inject(NotificationService);

    ngOnInit(): void {
        this.locationService.getLocations(true).subscribe({
            next: (locs) => {
                this.locations.set(locs);
                if (locs.length > 0) {
                    this.selectedLocationId.set(locs[0].id);
                    this.loadSummary();
                    this.loadUsersSummary();
                }
            }
        });
    }

    loadSummary() {
        if (!this.selectedLocationId()) return;
        this.dashboardService.getLocationSummary(this.selectedLocationId()).subscribe({
            next: (res) => this.summary.set(res.data),
            error: (error: HttpErrorResponse) => {
                if (error.error?.statusCode > 400) this.notificationService.show('Error loading summary');
            }
        });
    }

    loadUsersSummary() {
        if (!this.selectedLocationId()) return;
        const offset = (this.paginationControls.currentPage - 1) * this.paginationControls.perPage;
        this.dashboardService.getUsersSummary(this.selectedLocationId(), offset, this.paginationControls.perPage).subscribe({
            next: (res) => {
                this.usersSummary.set(res.data);
                this.paginationControls.totalPages = res.totalRecords;
            },
            error: (error: HttpErrorResponse) => {
                if (error.error?.statusCode > 400) this.notificationService.show('Error loading users summary');
            }
        });
    }

    onLocationChange(event: Event) {
        const id = (event.target as HTMLSelectElement).value;
        this.selectedLocationId.set(id);
        this.paginationControls.currentPage = 1;
        this.loadSummary();
        this.loadUsersSummary();
    }

    changePage(page: number) {
        this.paginationControls.currentPage = page;
        this.loadUsersSummary();
    }

    quantityFor(status: string): number {
        return this.summary().find(s => s.status === status)?.quantity ?? 0;
    }
}
