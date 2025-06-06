import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

@Injectable()
export class TransformInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    //Generalization of response
    // console.log(context.getArgs()[1].req);
    let req = context.getArgs()[1].req;
    // console.log({ req });

    let statusCode = context.getArgs()[1].statusCode;

    return next.handle().pipe(
      map((data) => ({
        success: true,
        statusCode: statusCode,
        data: data,
        userRoles: req.userRoles,
        error: null,
      })),
    );
  }
}
