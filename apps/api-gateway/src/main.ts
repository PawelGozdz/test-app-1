import { NestFactory } from '@nestjs/core';
import { ApiGatewayModule } from './api-gateway.module';
import { VersioningType } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(ApiGatewayModule, {});

  app.setGlobalPrefix('api');
  app.enableVersioning({
    type: VersioningType.URI,
    defaultVersion: '1',
  });
  
  await app.listen(process.env.port ?? 3000);

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
