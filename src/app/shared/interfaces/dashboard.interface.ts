import { ComplianceStatus } from './compliance.interface';

export interface StatusSummary {
    status: ComplianceStatus;
    quantity: number;
}

export interface UserComplianceSummary {
    userId: string;
    email: string;
    firstName: string;
    lastName: string;
    compliancesStatus: {
        ACTIVE: number;
        EXPIRES_SOON: number;
        EXPIRED: number;
        ARCHIVED: number;
    };
}

export interface AuditRecord {
    id: string;
    tenantId: string;
    recordId: string;
    modelName: string;
    modelAction: string;
    userId: string;
    createdAt: Date;
    oldValue: string | null;
    newValue: string;
    user: {
        firstName: string;
        lastName: string;
        email: string;
        role: string;
    };
}

export interface AuditsFilters {
    limit: number;
    offset: number;
    filters?: { userId?: string };
}
