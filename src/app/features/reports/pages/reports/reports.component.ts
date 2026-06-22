import { NgxPaginationModule } from 'ngx-pagination';
import { Component, inject, OnInit, signal } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { ReportsService } from '@features/reports/services/reports.service';
import { NotificationService } from '@shared/services/notification.service';
import { AuditRecord, AuditsFilters, PaginationControls } from '@shared/interfaces';
import { SharedModule } from '@shared/shared-module';

@Component({
    selector: 'app-reports',
    imports: [SharedModule, NgxPaginationModule],
    templateUrl: './reports.component.html',
    styleUrl: './reports.component.css',
})
export class ReportsComponent implements OnInit {
    public audits = signal<AuditRecord[]>([]);

    public paginationControls: PaginationControls = {
        currentPage: 1,
        perPage: 15,
        totalPages: 0,
    };

    private readonly reportsService = inject(ReportsService);
    private readonly notificationService = inject(NotificationService);

    ngOnInit(): void {
        this.loadAudits();
    }

    loadAudits() {
        const offset = (this.paginationControls.currentPage - 1) * this.paginationControls.perPage;
        const filters: AuditsFilters = { offset, limit: this.paginationControls.perPage };
        this.reportsService.getAudits(filters).subscribe({
            next: (res) => {
                this.audits.set(res.data);
                this.paginationControls.totalPages = res.totalRecords;
            },
            error: (error: HttpErrorResponse) => {
                if (error.error?.statusCode > 400) this.notificationService.error('Error loading audit log');
            }
        });
    }

    changePage(page: number) {
        this.paginationControls.currentPage = page;
        this.loadAudits();
    }

    actionClass(action: string): string {
        const map: Record<string, string> = {
            INSERT: 'bg-teal-100 text-teal-800',
            UPDATE: 'bg-blue-100 text-blue-800',
            DELETE: 'bg-red-100 text-red-800',
            TOGGLEACTIVE: 'bg-amber-100 text-amber-800',
        };
        return map[action] ?? 'bg-slate-100 text-slate-600';
    }
}
