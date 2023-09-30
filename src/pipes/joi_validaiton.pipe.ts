import { PipeTransform, Injectable, ArgumentMetadata } from '@nestjs/common';
import Joi, { ObjectSchema } from 'joi';
import { NewBadRequestException } from 'src/exceptions/new_bad_request.exception';

@Injectable()
export class JoiValidation implements PipeTransform {
  constructor(private schema: ObjectSchema) {}

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
      throw new NewBadRequestException({
        code: 'VALIDATION_ERROR',
        message: errorMessages,
      });
    }
    return value;
  }
}
