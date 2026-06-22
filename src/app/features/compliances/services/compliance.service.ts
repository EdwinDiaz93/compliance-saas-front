import { HttpBackend, HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import {
    ComplianceItem, CompliancesFilters, CompliancesResponse,
    CreateComplianceRequest, UpdateComplianceRequest, UploadUrlResponse
} from '@shared/interfaces';
import { environment } from 'environments';
import { from } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class ComplianceService {
    private readonly baseUrl = environment.baseUrl;
    private readonly http = inject(HttpClient);
    // HttpBackend bypasses the JWT interceptor — needed for direct S3 PUT upload
    private readonly httpDirect = new HttpClient(inject(HttpBackend));

    getCompliances(filters: CompliancesFilters) {
        return this.http.post<CompliancesResponse>(`${this.baseUrl}/compliances/search`, filters);
    }

    getCompliance(id: string) {
        return this.http.get<ComplianceItem>(`${this.baseUrl}/compliances/${id}`);
    }

    createCompliance(request: CreateComplianceRequest) {
        return this.http.post(`${this.baseUrl}/compliances/bulk`, request);
    }

    updateCompliance(id: string, request: UpdateComplianceRequest) {
        return this.http.patch(`${this.baseUrl}/compliances/${id}`, request);
    }

    archiveCompliance(id: string) {
        return this.http.patch(`${this.baseUrl}/compliances/archived/${id}`, {});
    }

    deleteCompliance(id: string) {
        return this.http.delete(`${this.baseUrl}/compliances/${id}`);
    }

    getUploadUrl(id: string, filename: string, contentType: string, fileSize: number) {
        return this.http.post<UploadUrlResponse>(`${this.baseUrl}/compliances/${id}/upload-compliance-file`, {
            filename, contentType, fileSize
        });
    }

    uploadToS3(uploadUrl: string, file: File) {
        // Direct PUT to S3 — no JWT header, no interceptor
        return this.httpDirect.put(uploadUrl, file, {
            headers: { 'Content-Type': file.type }
        });
    }

    saveDocumentUrl(id: string, documentUrl: string) {
        return this.http.patch(`${this.baseUrl}/compliances/${id}/document`, { documentUrl });
    }

    getDownloadUrl(id: string) {
        return this.http.get<Record<string, string>>(`${this.baseUrl}/compliances/${id}/document`);
    }

    exportCSV() {
        return this.http.get(`${this.baseUrl}/reporting/generate-compliances-csv`, { responseType: 'blob' });
    }
}
