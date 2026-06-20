import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { CommonResponse } from '@shared/interfaces';
import { environment } from 'environments';

@Injectable({ providedIn: 'root' })
export class DashboardService {
    private readonly baseUrl = environment.baseUrl;
    private readonly http = inject(HttpClient);

    getLocationSummary(locationId: string) {
        return this.http.get<CommonResponse<any>>(`${this.baseUrl}/dashboard/summary`, {
            params: { locationId }
        });
    }

    getUsersSummary(locationId: string, offset: number, limit: number) {
        return this.http.post<CommonResponse<any>>(`${this.baseUrl}/dashboard/users-summary`, {
            locationId, offset, limit
        });
    }
}
