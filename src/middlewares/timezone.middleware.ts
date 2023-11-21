import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';

@Injectable()
export class TimezoneMiddleware implements NestMiddleware {
  use(req: Request, res: Response, next: NextFunction) {
    req['timezone'] = req.headers.location ? req.headers.location : 'Africa/Cairo';
    next();
  }
}
