import {
  PipeTransform,
  Injectable,
  ArgumentMetadata,
  BadRequestException,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { ObjectSchema } from 'joi';

@Injectable()
export class JoiValidation implements PipeTransform {
  constructor(private schema: ObjectSchema) {}

  transform(value: any, metadata: ArgumentMetadata) {
    const { error } = this.schema.validate(value, {
      abortEarly: false,
    });
    // let x = this.schema.validate(value, {
    //   abortEarly: false,
    // });
    // console.log('x:', x.error.details);

    if (error) {
      //   let errorMessages = [];
      //   console.log(error.details);
      let errorMessages = error.details.map((details) => {
        return {
          path: details.path[0],
          message: details.message.replace(/"/g, ''),
        };
      });
      console.log({ errorMessages });
      let returnObject = {
        messages: errorMessages,
      };

      //   const errorMessage = error.details[0].message.replace(/"/g, '');
      //   throw new HttpException(returnObject, HttpStatus.BAD_REQUEST);
      throw new BadRequestException(errorMessages);
    }
    return value;
  }
}
