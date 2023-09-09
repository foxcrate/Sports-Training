import { Catch, ArgumentsHost, HttpException } from '@nestjs/common';

@Catch(HttpException)
export class GeneralFilter {
  catch(exception: HttpException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse();
    const status = exception.getStatus();
    const message = exception.message;

    if (status >= 500) {
      response.status(status).json({
        // statusCode: status,
        success: false,
        error: 'SERVER_ERROR',
        message: message,
      });
    } else if (status >= 400 || status < 500) {
      response.status(status).json({
        // statusCode: status,
        success: false,
        error: 'REQUEST_ERROR',
        message: message,
      });
    }
  }
}
