import {
  PipeTransform,
  Injectable,
  ArgumentMetadata,
  HttpException,
  HttpStatus,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { ObjectSchema } from 'joi';
import { BadRequestException } from 'src/exceptions/badRequest.exception';

@Injectable()
export class JoiValidation implements PipeTransform {
  constructor(private schema: ObjectSchema) {
    // console.log('Joi Validation');
  }

  transform(value: any, metadata: ArgumentMetadata) {
    const { error } = this.schema.validate(value, {
      abortEarly: false,
    });

    if (error) {
      let errorMessages = error.details.map((details) => {
        return {
          path: details.path[0],
          message: details.message.replace(/"/g, ''),
        };
      });
      throw new BadRequestException({
        code: 'VALIDATION_ERROR',
        message: errorMessages,
      });
    }
    return value;
  }
}
