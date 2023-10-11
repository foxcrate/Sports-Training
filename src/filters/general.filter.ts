import { Catch, ArgumentsHost, HttpException, ExceptionFilter } from '@nestjs/common';

@Catch(HttpException)
export class GeneralFilter implements ExceptionFilter {
  catch(exception: HttpException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse();
    const status = exception.getStatus();
    const message = exception.message;
    const exceptionBody: any = exception.getResponse();

    // console.log({ exceptionBody });

    // console.log('-- General Filter');

    let errorType = null;
    let errorMessage = null;

    if (!exceptionBody.error) {
      errorType = exceptionBody.message;
      errorMessage = 'Error';
    } else {
      errorType = exceptionBody.error;
      errorMessage = exceptionBody.message;
    }

    if (status >= 500) {
      // console.log('-- General Filter -- first condition');
      response.status(status).json({
        success: false,
        statusCode: status,
        data: null,
        error: {
          type: 'Server Error',
          message: message,
        },
      });
    } else {
      response.status(status).json({
        success: false,
        statusCode: status,
        data: null,
        error: {
          type: errorType,
          message: errorMessage,
        },
      });
    }
  }
}
