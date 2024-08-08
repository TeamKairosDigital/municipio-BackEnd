export class ApiResponse<T> {
    success: boolean;
    message: string;
    data?: T;
    error?: any;

    constructor(success: boolean, message: string, data?: T, error?: any) {
        this.success = success;
        this.message = message;
        this.data = data;
        this.error = error;
    }
}