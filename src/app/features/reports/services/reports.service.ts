import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { AuditRecord, AuditsFilters, CommonResponse } from '@shared/interfaces';
import { environment } from 'environments';

@Injectable({ providedIn: 'root' })
export class ReportsService {
    private readonly baseUrl = environment.baseUrl;
    private readonly http = inject(HttpClient);

    downloadCSV() {
        // responseType blob para que Angular no intente parsear el CSV como JSON
        return this.http.get(`${this.baseUrl}/reporting/generate-compliances-csv`, {
            responseType: 'blob'
        });
    }

    getAudits(filters: AuditsFilters) {
        return this.http.post<CommonResponse<AuditRecord>>(`${this.baseUrl}/reporting/search-audits`, filters);
    }
}
