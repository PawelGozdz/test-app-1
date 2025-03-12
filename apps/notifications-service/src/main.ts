import { NestFactory } from '@nestjs/core';
import { NotificationsServiceModule } from './notifications-service.module';
import { NotificationsServiceService } from './notifications-service.service';
import { ConfigService } from '@nestjs/config';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';

async function bootstrap() {
  const app = await NestFactory.create(NotificationsServiceModule);

    const configService = app.get(ConfigService);
  
    const host = configService.get<string>('NOTIFICATIONS_SERVICE_HOST');
    const tcpPort = +configService.get<number>('NOTIFICATIONS_SERVICE_TCP_PORT');
  
    app.connectMicroservice<MicroserviceOptions>(
      {
        transport: Transport.TCP,
        options: {
          host,
          port: tcpPort,
        },
      },
      { inheritAppConfig: true },
    );

  // Running below onModuleInit is a hack because it doesn't run when it gets instantiated in a libs folder
  // I have not enough time to figure out hoh to fix it
  const service = app.get(NotificationsServiceService);
  await service.onModuleInit();
  
  app.enableShutdownHooks();

  await app.startAllMicroservices();

  process.on('unhandledRejection', (reason, _promise) => {
    process.exit(1);
    // Handle the unhandled promise rejection here
  });

  process.on('uncaughtException', (error) => {
    process.exit(1);
    // Handle the uncaught exception here
  });
}
bootstrap();
