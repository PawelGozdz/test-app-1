import { ArgumentsHost, Catch, ExceptionFilter } from '@nestjs/common';
import { RpcException } from '@nestjs/microservices';
import { Observable, throwError } from 'rxjs';
import { BaseError, DomainError, DomainErrorCode, FrameworkError } from '../errors';
import { IMicroserviceException } from './microservice-exception.interface';

@Catch()
export class MicroserviceExceptionFilter implements ExceptionFilter {
  catch(exception: any, _: ArgumentsHost): Observable<any> {
    const error = this.normalizeError(exception);
    
    return throwError(() => ({ error }));
  }

  private normalizeError(exception: any): IMicroserviceException {
    if (exception instanceof DomainError) {
      return {
        message: exception.message,
        code: exception.code,
        domain: exception.domain,
        data: exception.data,
        timestamp: exception.timestamp || new Date(),
        name: exception.name,
      };
    }

    if (exception instanceof FrameworkError) {
      return {
        message: exception.message, 
        code: exception.code,
        timestamp: new Date(),
        name: exception.name,
      };
    }

    if (exception instanceof BaseError) {
      return {
        message: exception.message,
        timestamp: new Date(),
        name: exception.name,
      };
    }

    if (exception instanceof RpcException) {
      const error = exception.getError();
      if (typeof error === 'object') {
        const err = error as IMicroserviceException;
        return {
          message: err.message || 'Unknown RPC err',
          name: err.name || 'RpcException',
          code: err.code,
          data: err.data,
          timestamp: err.timestamp || new Date(),
        };
      }
      return {
        message: typeof error === 'string' ? error : 'Unknown RPC error',
        name: 'RpcException',
        timestamp: new Date(),
      };
    }

    return {
      message: exception instanceof Error ? exception.message : 'Unknown error',
      code: DomainErrorCode.UnknownError,
      name: exception instanceof Error ? exception.name : 'Error',
      timestamp: new Date(),
    };
  }
}