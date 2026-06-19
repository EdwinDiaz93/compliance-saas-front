import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Location, LocationRequest } from '@shared/interfaces';
import { environment } from 'environments';

@Injectable({ providedIn: 'root' })
export class LocationService {
    private readonly baseUrl = environment.baseUrl;
    private readonly httpClient = inject(HttpClient);

    getLocations(isActive: boolean = true) {
        return this.httpClient.get<Location[]>(`${this.baseUrl}/locations`, {
            params: { isActive }
        });
    }

    saveLocation(request: LocationRequest) {
        return this.httpClient.post(`${this.baseUrl}/locations`, request);
    }

    updateLocation(id: string, request: LocationRequest) {
        return this.httpClient.patch(`${this.baseUrl}/locations/${id}`, request);
    }

    toggleActive(id: string) {
        return this.httpClient.patch(`${this.baseUrl}/locations/toggle-active/${id}`, {});
    }

    deleteLocation(id: string) {
        return this.httpClient.delete(`${this.baseUrl}/locations/delete/${id}`);
    }
}
