import { NestFactory } from '@nestjs/core';
import { UsersServiceModule } from './users-service.module';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import { ConfigService } from '@nestjs/config';
import { RabbitMQProducerService } from '@libs/common';

async function bootstrap() {
  const app = await NestFactory.create(UsersServiceModule);

  const configService = app.get(ConfigService);

  const host = configService.get<string>('USERS_SERVICE_HOST');
  const tcpPort = +configService.get<number>('USERS_SERVICE_TCP_PORT');

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
  const producerService = app.get(RabbitMQProducerService);
  await producerService.onModuleInit();

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
