import { NestFactory } from '@nestjs/core';
import { UsersServiceModule } from './users-service.module';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import { ConfigService } from '@nestjs/config';

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

  await app.startAllMicroservices();

  process.on('unhandledRejection', (reason, _promise) => {
    // logger.fatal('Unhandled Promise rejection:', reason);
    process.exit(1);
    // Handle the unhandled promise rejection here
  });

  process.on('uncaughtException', (error) => {
    // logger.fatal('Uncaught Exception:', error);
    process.exit(1);
    // Handle the uncaught exception here
  });
}
bootstrap();
