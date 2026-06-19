import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Authority, AuthoritiesFilters, AuthoritiesResponse, AuthorityRequest } from '@shared/interfaces';
import { environment } from 'environments';

@Injectable({ providedIn: 'root' })
export class AuthorityService {
    private readonly baseUrl = environment.baseUrl;
    private readonly httpClient = inject(HttpClient);

    getAuthorities(filters: AuthoritiesFilters) {
        return this.httpClient.post<AuthoritiesResponse>(`${this.baseUrl}/authorities/search`, filters);
    }

    getAuthority(id: string) {
        return this.httpClient.get<Authority>(`${this.baseUrl}/authorities/${id}`);
    }

    saveAuthority(request: AuthorityRequest) {
        return this.httpClient.post(`${this.baseUrl}/authorities`, request);
    }

    updateAuthority(id: string, request: AuthorityRequest) {
        return this.httpClient.patch(`${this.baseUrl}/authorities/${id}`, request);
    }

    deleteAuthority(id: string) {
        return this.httpClient.delete(`${this.baseUrl}/authorities/${id}`);
    }
}
