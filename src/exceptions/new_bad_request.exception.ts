import { HttpException, HttpStatus } from '@nestjs/common';

export class NewBadRequestException extends HttpException {
  constructor(
    /*
    -In case of Joi validation error, first param will be an object {code:VALIDATION_ERROR,message:[]}
    -Otherwise first param will be the code only ex: WRONG_PASSWORD
    -second param is the status code ex: 401
    */

    obj: { code: string; message: Object[] } | string,
    status?: number,
  ) {
    super(obj, status ? status : HttpStatus.BAD_REQUEST);
  }
}
