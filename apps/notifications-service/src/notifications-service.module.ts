import { Module } from '@nestjs/common';
import { NotificationsServiceService } from './notifications-service.service';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AppLoggerModule, excludedRoutes, MicroserviceExceptionFilter, RabbitMQModule } from '@libs/common';
import { NotificationsServiceController } from './notifications-service.controller';
import { APP_FILTER } from '@nestjs/core';

const errorFilters = [
  {
    provide: APP_FILTER,
    useClass: MicroserviceExceptionFilter,
  }
];

@Module({
  imports: [
    ConfigModule.forRoot(),
    AppLoggerModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        level: configService.get('LOG_LEVEL'),
        exclude: excludedRoutes,
      }),
    }),
    RabbitMQModule.forRoot(),
  ],
  providers: [NotificationsServiceService, ...errorFilters],
  controllers: [NotificationsServiceController],
})
export class NotificationsServiceModule {}
