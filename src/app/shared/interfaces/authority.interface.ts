import { CommonResponse } from "./common.interface";

export type AuthorityLevel = 'FEDERAL' | 'STATE' | 'LOCAL';

export interface AuthorityRequest {
    name: string;
    level: AuthorityLevel;
    stateCode?: string;
    renewalUrl: string;
}

export interface AuthoritiesFilters {
    limit: number;
    offset: number;
    filters?: {
        level?: AuthorityLevel;
        stateCode?: string;
    };
}

export interface Authority {
    id: string;
    tenantId: string | null;
    name: string;
    level: AuthorityLevel;
    stateCode: string | null;
    renewalUrl: string | null;
    isCustom: boolean;
    createdAt: Date;
    updatedAt: Date;
}

export interface AuthoritiesResponse extends CommonResponse<Authority> { }
