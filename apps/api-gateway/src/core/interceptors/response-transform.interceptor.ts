
import { IResponse } from '@libs/common';
import { CallHandler, ExecutionContext, Injectable, NestInterceptor } from '@nestjs/common';
import { PinoLogger } from 'nestjs-pino';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

@Injectable()
export class ResponseTransformSuccessInterceptor implements NestInterceptor {
  constructor(private readonly logger: PinoLogger) {
    this.logger.setContext(this.constructor.name);
  }

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> | any {
    return next.handle().pipe(map((data) => this.mapSuccessResponse(data, context)));
  }

  private mapSuccessResponse(responseData: any, context: ExecutionContext): IResponse {
    const timestamp = new Date().toISOString();
    const ctx = context.switchToHttp();
    const response = ctx.getResponse();
    const request = ctx.getRequest();
    const { statusCode } = response;

    const res: IResponse = {
      statusCode,
      timestamp,
      path: request.url,
      data: responseData
    };

    return res;
  }
}
