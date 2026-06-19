export interface DialogResult {
    action: 'Save' | 'Cancel',
    payload: any

}

export interface ErrorResponse {
    statusCode: number;
    error: string;
    message: any;
}

export interface CommonResponse<T> {
    data: T[];
    recordsFound: number;
    totalRecords: number;
}



export interface PaginationControls {
    currentPage: number;
    perPage: number;
    totalPages: number;
}