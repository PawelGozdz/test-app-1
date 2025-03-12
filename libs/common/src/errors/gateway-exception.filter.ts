import { ArgumentsHost, Catch, ExceptionFilter, HttpException, HttpStatus } from '@nestjs/common';
import { HttpAdapterHost } from '@nestjs/core';
import { RpcException } from '@nestjs/microservices';
import { isNumber } from 'class-validator';
import { Request, Response } from 'express';

import {
  BaseError,
  DomainError,
  DomainErrorCode,
  FrameworkError,
  FrameworkErrorCode,
} from '../errors';
import { IMicroserviceException } from './microservice-exception.interface';
import { IResponse } from '../microservices';
import { MongoDBErrorCode } from '../database';

@Catch()
export class GatewayExceptionFilter implements ExceptionFilter {
  defaultStatusCode = 500;

  constructor(private readonly httpAdapterHost: HttpAdapterHost) {}

  catch(exception: unknown, host: ArgumentsHost): IResponse {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();
    const { httpAdapter } = this.httpAdapterHost;
    const timestamp = new Date().toISOString();
    const path = request.url;

    const responseBody = {} as IResponse;

    if (
      typeof exception === 'object' && 
      exception !== null &&
      'error' in exception
    ) {
      const error = exception.error;
      const statusCode = this.mapErrorToHttpStatus(error);
      
      responseBody.statusCode = statusCode;
      responseBody.path = path;
      responseBody.timestamp = timestamp;
      responseBody.message = this.formatMessage(error);

      return httpAdapter.reply(response, responseBody, statusCode);
    }

    const statusCode = this.mapCustomErrorToHttpStatusCode(exception);
    
    responseBody.statusCode = statusCode;
    responseBody.path = path;
    responseBody.timestamp = timestamp;
    responseBody.message = this.formatMessage(exception);

    return httpAdapter.reply(response, responseBody, statusCode);
  }

  private formatMessage(exception: unknown): string[] {
    if (exception instanceof RpcException) {
      const error = exception.getError();
      if (typeof error === 'string') {
        return [error];
      } else if (typeof error === 'object' && error !== null) {
        const message = error['message'];
        if (Array.isArray(message)) {
          return message;
        } else if (typeof message === 'string') {
          return [message];
        }
      }
      return ['Unknown RPC error'];
    }

    if (exception instanceof HttpException) {
      const response = exception.getResponse();
      if (typeof response === 'object' && response !== null && 'message' in response) {
        const message = response.message;
        if (Array.isArray(message)) {
          return message;
        } else if (typeof message === 'string') {
          return [message];
        }
      }
      return [exception.message];
    }

    if (exception instanceof DomainError) {
      return [exception.message];
    }

    if (exception instanceof FrameworkError) {
      return [exception.message];
    }

    if (exception instanceof BaseError) {
      return [exception.message];
    }

    if (this.isMicroserviceException(exception)) {
      return [exception.message];
    }

    if (exception instanceof Error) {
      return [exception.message];
    }

    return ['Internal server error'];
  }

  private isMicroserviceException(obj: unknown): obj is IMicroserviceException {
    return (
      typeof obj === 'object' &&
      obj !== null &&
      'message' in obj &&
      'name' in obj &&
      'timestamp' in obj
    );
  }

  private mapErrorToHttpStatus(error: any): number {
    if (typeof error === 'object' && error !== null) {
      if (error.code) {
        if (Object.values(DomainErrorCode).includes(error.code)) {
          return this.mapDomainCodeToHttpStatusCode(error.code);
        }
        
        if (Object.values(FrameworkErrorCode).includes(error.code)) {
          return this.mapFrameworkCodeToHttpStatusCode(error.code);
        }
        
        if (isNumber(error.code)) {
          return this.mapMongoDBCodeToHttpStatusCode(error.code);
        }
      }
      
      if (error.statusCode && isNumber(error.statusCode)) {
        return error.statusCode;
      }
    }
    
    return this.defaultStatusCode;
  }

  private mapCustomErrorToHttpStatusCode(error: unknown): number {
    if (error instanceof HttpException) {
      return error.getStatus();
    }

    if (error instanceof DomainError) {
      return this.mapDomainCodeToHttpStatusCode(error.code);
    }

    if (error instanceof FrameworkError && isNumber(error.code)) {
      return this.mapMongoDBCodeToHttpStatusCode(error.code);
    }

    if (error instanceof FrameworkError) {
      return this.mapFrameworkCodeToHttpStatusCode(error.code);
    }

    if (this.isMicroserviceException(error) && error.code) {
      if (Object.values(DomainErrorCode).includes(error.code as any)) {
        return this.mapDomainCodeToHttpStatusCode(error.code as DomainErrorCode);
      }
    }

    return this.defaultStatusCode;
  }

  private mapDomainCodeToHttpStatusCode(code?: DomainErrorCode): number {
    switch (code) {
      case DomainErrorCode.MissingValue:
        return HttpStatus.BAD_REQUEST;
      case DomainErrorCode.InvalidParameter:
        return HttpStatus.BAD_REQUEST;
      case DomainErrorCode.UnknownError:
        return HttpStatus.BAD_REQUEST;
      case DomainErrorCode.InvalidCredentials:
        return HttpStatus.UNAUTHORIZED;
      case DomainErrorCode.Unauthorized:
        return HttpStatus.UNAUTHORIZED;
      case DomainErrorCode.Forbidden:
        return HttpStatus.FORBIDDEN;
      case DomainErrorCode.NotFound:
        return HttpStatus.NOT_FOUND;
      case DomainErrorCode.DuplicateEntry:
        return HttpStatus.CONFLICT;
      case DomainErrorCode.ValidationFailed:
        return HttpStatus.UNPROCESSABLE_ENTITY;
      default:
        return HttpStatus.INTERNAL_SERVER_ERROR;
    }
  }

  private mapFrameworkCodeToHttpStatusCode(code?: FrameworkErrorCode): number {
    switch (code) {
      case FrameworkErrorCode.DuplicateEntry:
        return HttpStatus.CONFLICT;
      case FrameworkErrorCode.ValidationFailed:
        return HttpStatus.UNPROCESSABLE_ENTITY;
      case FrameworkErrorCode.Unavailable:
        return HttpStatus.SERVICE_UNAVAILABLE;
      case FrameworkErrorCode.Unauthorized:
        return HttpStatus.UNAUTHORIZED;
      case FrameworkErrorCode.Forbidden:
        return HttpStatus.FORBIDDEN;
      case FrameworkErrorCode.NotFound:
        return HttpStatus.NOT_FOUND;
      case FrameworkErrorCode.InvalidParameter:
        return HttpStatus.BAD_REQUEST;
      case FrameworkErrorCode.InvalidCredentials:
        return HttpStatus.UNAUTHORIZED;
      case FrameworkErrorCode.LimitExceeded:
        return HttpStatus.TOO_MANY_REQUESTS;
      case FrameworkErrorCode.TimeoutError:
        return HttpStatus.GATEWAY_TIMEOUT;
      case FrameworkErrorCode.ExternalServiceError:
        return HttpStatus.SERVICE_UNAVAILABLE;
      case FrameworkErrorCode.RateLimitExceeded:
        return HttpStatus.TOO_MANY_REQUESTS;
      case FrameworkErrorCode.SecurityError:
        return HttpStatus.FORBIDDEN;
      default:
        return HttpStatus.INTERNAL_SERVER_ERROR;
    }
  }

  private mapMongoDBCodeToHttpStatusCode(code: number): number {
    switch (code) {
      case MongoDBErrorCode.DuplicateKey:
        return HttpStatus.CONFLICT;
      case MongoDBErrorCode.Unauthorized:
        return HttpStatus.UNAUTHORIZED;
      case MongoDBErrorCode.IndexNotFound:
      case MongoDBErrorCode.NamespaceNotFound:
      case MongoDBErrorCode.UserNotFound:
        return HttpStatus.NOT_FOUND;
      case MongoDBErrorCode.NetworkTimeout:
      case MongoDBErrorCode.WriteConflict:
      case MongoDBErrorCode.LockTimeout:
      case MongoDBErrorCode.ExceededTimeLimit:
      case MongoDBErrorCode.CursorNotFound:
      case MongoDBErrorCode.CommandNotFound:
      case MongoDBErrorCode.UnknownError:
      case MongoDBErrorCode.FailedToParse:
        return HttpStatus.INTERNAL_SERVER_ERROR;
      default:
        return HttpStatus.INTERNAL_SERVER_ERROR;
    }
  }
}