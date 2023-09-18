import { Catch, ArgumentsHost, HttpException, ExceptionFilter } from '@nestjs/common';

@Catch(
  HttpException,
  // Prisma?.PrismaClientKnownRequestError,
  // Prisma?.NotFoundError,
)
export class GeneralFilter implements ExceptionFilter {
  catch(exception: HttpException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse();
    const status = exception.getStatus();
    const message = exception.message;

    if (status >= 500) {
      response.status(status).json({
        success: false,
        statusCode: status,
        data: null,
        error: {
          type: 'SERVER_ERROR',
          message: message,
        },
      });
    } else if (status >= 400 || status < 500) {
      response.status(status).json({
        success: false,
        statusCode: status,
        data: null,
        error: {
          type: 'REQUEST_ERROR',
          message: message,
        },
      });
    }
  }
}
