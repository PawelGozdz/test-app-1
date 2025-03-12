import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ClientsModule, Transport } from '@nestjs/microservices';

import { Apps } from '@libs/common';
import { NotificationsController } from './notifications.controller';
import { NotificationsService } from './notifications.service';


@Module({
  imports: [
    ClientsModule.registerAsync([
      {
        name: Apps.NOTIFICATIONS_SERVICE,
        imports: [ConfigModule],
        inject: [ConfigService],
        useFactory: (configService: ConfigService) => ({
          transport: Transport.TCP,
          options: {
            host: configService.get<string>('NOTIFICATIONS_SERVICE_HOST'),
            port: +configService.get<number>('NOTIFICATIONS_SERVICE_TCP_PORT'),
          },
        }),
      },
    ]),
  ],
  controllers: [NotificationsController],
  providers: [NotificationsService],
  exports: [NotificationsService],
})
export class NotificationsModule {}
