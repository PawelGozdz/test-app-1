import { MiddlewareConsumer, Module, ValidationPipe } from '@nestjs/common';
import { APP_FILTER, APP_INTERCEPTOR } from '@nestjs/core';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AppLoggerModule, AppLoggingMiddleware, excludedRoutes, GatewayExceptionFilter } from '@libs/common';
import { UsersModule } from './users';
import { DefaultIfEmptyInterceptor, CorrelationIdMiddleware, ResponseTransformSuccessInterceptor } from './core';
import { NotificationsModule } from './notifications';

const providers = [
  CorrelationIdMiddleware,
];

const exceptionFilters = [
  {
    provide: APP_FILTER,
    useClass: GatewayExceptionFilter,
  },
];

const pipes = [
  {
    provide: 'APP_PIPE',
    useFactory: () =>
      new ValidationPipe({
        transform: true,
        whitelist: true,
      }),
  },
];

const interceptors = [
  {
    provide: APP_INTERCEPTOR,
    useClass: DefaultIfEmptyInterceptor,
  },
  {
    provide: APP_INTERCEPTOR,
    useClass: ResponseTransformSuccessInterceptor,
  },
]

@Module({
  imports: [
    ConfigModule.forRoot(),
    UsersModule,
    NotificationsModule,
    AppLoggerModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        level: configService.get('LOG_LEVEL'),
        exclude: excludedRoutes,
      }),
    }),
  ],
  providers: [...providers, ...pipes,  ...interceptors,...exceptionFilters],
})
export class ApiGatewayModule {
  configure(consumer: MiddlewareConsumer): void {
    consumer
      .apply(CorrelationIdMiddleware, AppLoggingMiddleware)
      .exclude(...excludedRoutes)
      .forRoutes('*');
  }
}
