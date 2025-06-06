import {
  PipeTransform,
  Injectable,
  ArgumentMetadata,
  BadRequestException,
} from '@nestjs/common';
import Joi, { ObjectSchema } from 'joi';

@Injectable()
export class JoiValidation implements PipeTransform {
  constructor(private schema: ObjectSchema) {}

  transform(value: any, metadata: ArgumentMetadata) {
    const { error } = this.schema.validate(value, {
      abortEarly: false,
      // messages: translate,
    });

    if (error) {
      let errorMessages = error.details.map((details) => {
        return {
          path: details.path[0],
          message: details.message.replace(/"/g, ''),
        };
      });
      // throw new NewBadRequestException({
      //   code: 'VALIDATION_ERROR',
      //   message: errorMessages,
      // });

      throw new BadRequestException(errorMessages);
    }
    return value;
  }
}
