import { AppRole } from "@core/guards";
import { CommonResponse } from "./common.interface";

export interface UserRequest {
    email: string;
    firstName: string;
    lastName: string;
    rol: AppRole;
}


export interface UsersFilters {
    limit: number;
    offset: number;
    filters?: any;
}


export interface User {
    selected?:boolean;
    id: string;
    tenantId: string;
    email: string;
    firstName: string;
    lastName: string;
    role: string;
    status: 'PENDING' | 'ACTIVE' | 'SUSPENDED' | 'DELETED';
    lastLoginAt: Date | null;
    createdAt: Date;
    updatedAt: Date;
}

export interface UsersResponse extends CommonResponse<User> { }

export interface InvitationsRequest {
    userIds: string[];
}


