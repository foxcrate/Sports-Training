import { Catch, ArgumentsHost } from '@nestjs/common';
import { BadRequestException } from 'src/exceptions/badRequest.exception';
import savedErrors from '../utils/errors';

@Catch(BadRequestException)
export class BadRequestFilter {
  catch(exception: BadRequestException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse();
    const status = exception.getStatus();

    let exceptionObject = exception.getResponse();

    let errorCode = '';
    if (exceptionObject['message']) {
      errorCode = exceptionObject['code'];
    } else {
      errorCode = exceptionObject.toString();
    }

    if (errorCode == 'VALIDATION_ERROR') {
      response.status(status).json({
        // statusCode: status,
        success: false,
        error: errorCode,
        message: exceptionObject['message'],
      });
    } else {
      response.status(status).json({
        // statusCode: status,
        success: false,
        error: errorCode,
        message: savedErrors.get('en').get(errorCode),
      });
    }
  }
}
