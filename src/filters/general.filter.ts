import {
  Catch,
  ArgumentsHost,
  HttpException,
  ExceptionFilter,
  BadRequestException,
  UnauthorizedException,
  NotFoundException,
  ForbiddenException,
  NotAcceptableException,
  UnprocessableEntityException,
  ConflictException,
  InternalServerErrorException,
} from '@nestjs/common';

@Catch(HttpException)
export class GeneralFilter implements ExceptionFilter {
  catch(exception: HttpException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse();
    const status = exception.getStatus();
    const message = exception.message;
    const exceptionBody: any = exception.getResponse();

    // console.log({ exceptionBody });

    // if (exception instanceof BadRequestException) {
    //   console.log('BadRequestException');
    // } else if (exception instanceof UnauthorizedException) {
    //   console.log('UnauthorizedException');
    // } else if (exception instanceof NotFoundException) {
    //   console.log('NotFoundException');
    // } else if (exception instanceof ForbiddenException) {
    //   console.log('ForbiddenException');
    // } else if (exception instanceof NotAcceptableException) {
    //   console.log('NotAcceptableException');
    // } else if (exception instanceof UnprocessableEntityException) {
    //   console.log('UnprocessableEntityException');
    // } else if (exception instanceof ConflictException) {
    //   console.log('ConflictException');
    // } else if (exception instanceof InternalServerErrorException) {
    //   console.log('InternalServerErrorException');
    // }

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
