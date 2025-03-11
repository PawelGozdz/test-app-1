import { Injectable, NestMiddleware } from '@nestjs/common';
import { isUUID } from 'class-validator';
import { NextFunction, Request, Response } from 'express';
import { v4 } from 'uuid';

@Injectable()
export class CorrelationIdMiddleware implements NestMiddleware {
  use(req: Request, res: Response, next: NextFunction) {
    let correlationId = req.headers['x-correlation-id'];
    if (!isUUID(correlationId)) {
      correlationId = v4();
    }
    req['correlationId'] = correlationId;
    res.setHeader('x-correlation-id', correlationId);

    next();
  }
}
