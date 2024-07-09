import { Catch, ArgumentsHost, HttpException, ExceptionFilter } from '@nestjs/common';

@Catch()
export class GeneralFilter implements ExceptionFilter {
  catch(exception: HttpException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse();
    const req = ctx.getRequest();

    // check if exception is HttpException
    try {
      const status = exception.getStatus();
    } catch (err) {
      console.log('-- first condition in general filer --');

      console.log(exception);

      response.status(500).json({
        success: false,
        statusCode: 500,
        data: null,
        userRoles: req.userRoles ? req.userRoles : null,
        error: {
          type: 'Server Error',
          message: 'Internal server error',
        },
      });
      return;
    }

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
      // console.log('-- General Filter -- second condition');
      response.status(status).json({
        success: false,
        statusCode: status,
        data: null,
        userRoles: req.userRoles ? req.userRoles : null,
        error: {
          type: 'Server Error',
          message: message,
        },
      });
    } else {
      // console.log('-- General Filter -- third condition');
      // console.log({ errorType, errorMessage });

      if (Array.isArray(errorMessage)) {
        errorMessage = errorMessage[0].message;
      }

      response.status(status).json({
        success: false,
        statusCode: status,
        data: null,
        userRoles: req.userRoles ? req.userRoles : null,
        error: {
          type: errorType,
          message: errorMessage,
        },
      });
    }
  }
}
