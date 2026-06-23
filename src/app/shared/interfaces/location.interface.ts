import { CommonResponse } from "./common.interface";

export type BusinessType = 'RESTAURANT' | 'LIQUOR_STORE' | 'RESTAURANT_WITH_BAR' | 'RESTAURANT_WITH_BEER_AND_WINE';

export interface LocationRequest {
    name: string;
    businessType: BusinessType;
    state: string;
    city: string;
}

export interface Location {
    id: string;
    tenantId: string;
    name: string;
    businessType: BusinessType;
    state: string;
    city: string;
    isActive: boolean;
    createdAt: Date;
    updatedAt: Date;
}

export interface LocationsResponse extends CommonResponse<Location> { }
