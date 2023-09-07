import { HttpException, HttpStatus } from '@nestjs/common';

export class BadRequestException extends HttpException {
  constructor(
    obj: { code: string; message: Object[] } | string,
    status?: number,
  ) {
    super(obj, status ? status : HttpStatus.BAD_REQUEST);
  }
}
