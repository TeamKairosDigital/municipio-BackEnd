import { ExceptionFilter, Catch, ArgumentsHost, HttpException, HttpStatus } from '@nestjs/common';
import { ApiResponse } from 'src/models/response/ApiResponse';

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse();
    const request = ctx.getRequest();

    const status =
      exception instanceof HttpException
        ? exception.getStatus()
        : HttpStatus.INTERNAL_SERVER_ERROR;

    const message =
      exception instanceof HttpException
        ? exception.getResponse()
        : 'Internal server error';

    const apiResponse: ApiResponse<null> = {
      success: false,
      statusCode: status,
      message: typeof message === 'string' ? message : (message as any)?.message || 'Error desconocido',
      data: null,
      errors: exception,
    };

    response.status(status).json(apiResponse);
  }
}
