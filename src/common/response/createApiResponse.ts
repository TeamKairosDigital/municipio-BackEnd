import { HttpStatus } from '@nestjs/common';
import { ApiResponse } from './ApiResponse';

export function createApiResponse<T>(
  success: boolean,
  message: string,
  data: T | null,
  errors: string | null,
  statusCode: number,
): ApiResponse<T> {
  return {
    success,
    message,
    data,
    errors,
    statusCode,
  };
}

