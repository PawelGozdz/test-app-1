import { CallHandler, ExecutionContext, Injectable, NestInterceptor } from '@nestjs/common';
import { defaultIfEmpty } from 'rxjs/operators';

@Injectable()
export class DefaultIfEmptyInterceptor implements NestInterceptor {
  intercept(_: ExecutionContext, next: CallHandler) {
    return next.handle().pipe(defaultIfEmpty(void 0));
  }
}
