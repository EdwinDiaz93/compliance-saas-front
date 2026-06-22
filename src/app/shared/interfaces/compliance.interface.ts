import { CommonResponse } from "./common.interface";

export type LicenseType = 'FEDERAL_LICENSE' | 'STATE_LICENSE' | 'LOCAL_LICENSE' | 'HEALTH_PERMIT' | 'ALCOHOL_PERMIT' | 'EMPLOYEE_CERT' | 'INSPECTION';
export type ComplianceStatus = 'MISSING' | 'ACTIVE' | 'EXPIRES_SOON' | 'EXPIRED' | 'ARCHIVED';

export interface ComplianceItemRequest {
    name: string;
    category: LicenseType;
    expiresAt?: string;
    issuedAt?: string;
    userId?: string;
    issuingAuthorityId?: string;
    licenseNumber?: string;
    notes?: string;
}

export interface CreateComplianceRequest {
    locationId: string;
    compliances: ComplianceItemRequest[];
}

export interface UpdateComplianceRequest {
    name?: string;
    category?: LicenseType;
    expiresAt?: string;
    issuedAt?: string;
    issuingAuthorityId?: string;
    licenseNumber?: string;
    notes?: string;
}

export interface CompliancesFilters {
    limit: number;
    offset: number;
    filters: {
        locationId: string;
        userId?: string;
        category?: LicenseType;
        status?: ComplianceStatus;
        issuingAuthorityId?: string;
    };
}

export interface ComplianceItem {
    id: string;
    tenantId: string;
    userId: string | null;
    locationId: string;
    issuingAuthorityId: string | null;
    templateId: string | null;
    name: string;
    category: LicenseType;
    status: ComplianceStatus;
    licenseNumber: string | null;
    expiresAt: string | null;
    issuedAt: string | null;
    documentUrl: string | null;
    notes: string | null;
    issuingAuthority: { id: string; name: string; level: string; } | null;
    createdAt: Date;
    updatedAt: Date;
}

export interface CompliancesResponse extends CommonResponse<ComplianceItem> { }

export interface UploadUrlResponse {
    uploadUrl: string;
    Key: string;
}
