import { Catch, ArgumentsHost } from '@nestjs/common';
import { NewBadRequestException } from 'src/exceptions/new-bad-request.exception';

@Catch(NewBadRequestException)
export class BadRequestFilter {
  catch(exception: NewBadRequestException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse();
    const status = exception.getStatus();

    let exceptionObject = exception.getResponse();

    let errorCode = '';
    if (exceptionObject['code']) {
      errorCode = exceptionObject['code'];
    } else {
      errorCode = exceptionObject.toString();
    }

    if (errorCode == 'VALIDATION_ERROR') {
      response.status(status).json({
        success: false,
        statusCode: status,
        data: null,
        error: {
          type: errorCode,
          message: exceptionObject['message'],
        },
      });
    } else {
      response.status(status).json({
        success: false,
        statusCode: status,
        data: null,
        error: {
          type: errorCode,
          // message: savedErrors.get('en').get(errorCode),
        },
      });
    }
  }
}
