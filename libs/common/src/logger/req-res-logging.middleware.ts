import { Injectable, NestMiddleware } from '@nestjs/common';
import { NextFunction, Request, Response } from 'express';
import { Logger } from 'nestjs-pino';
import { excludedRoutes } from './index';

@Injectable()
export class AppLoggingMiddleware implements NestMiddleware {
  constructor(private readonly logger: Logger) {}

  use(req: Request & { correlationId: string }, res: Response, next: NextFunction): void {
    if (excludedRoutes.find(r => req.baseUrl.endsWith(r.path))) {
      return next();
    }

    const userAgent = req.get('user-agent') || '';
    const { ip, method, correlationId } = req;

    const url = req.originalUrl;
    const reqTime = Date.now();
    const reqMsg = `REQUEST [${correlationId}] [${method}] ${url} - ${userAgent} ${ip}`;

    this.logger.log(reqMsg);

    res.on('finish', () => {
      if (excludedRoutes.find(r => req.baseUrl.endsWith(r.path))) {
        return next();
      }

      const resTime = Date.now();

      const { statusCode } = res;
      const contentLength = res.get('content-length');

      const resMsg = `RESPONSE [${correlationId}] [${method}] ${url} - ${
        contentLength ?? ''
      }: ${Date.now() - reqTime}ms`;

      this.logger.debug(resMsg, {
        statusMessage: res.statusMessage,
        ip,
        method,
        url,
        correlationId,
        statusCode,
        contentLength,
        reqTime,
        resTime,
      });
    });

    next();
  }
}