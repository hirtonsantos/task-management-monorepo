export interface ApiResponse<T = unknown> {
    success: boolean;
    data?: T;
    message?: string;
    timestamp: string;
}
export interface ApiErrorResponse {
    success: false;
    error: {
        code: string;
        message: string;
        details?: Record<string, unknown>;
    };
    timestamp: string;
}
export interface ValidationError {
    field: string;
    message: string;
    value?: unknown;
}
export interface ApiValidationErrorResponse extends ApiErrorResponse {
    error: {
        code: "VALIDATION_ERROR";
        message: string;
        details: {
            errors: ValidationError[];
        };
    };
}
//# sourceMappingURL=api-response.interface.d.ts.map