import { DynamicModule, Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';

import { AppLoggerModule, excludedRoutes } from '../../../logger';
import { RabbitMQProducerService } from './rabbitmq-producer.service';
import { RabbitMQConsumerService } from './rabbitmq-consumer.service';
import { PinoLogger } from 'nestjs-pino';

export interface RabbitMQModuleOptions {
  customLogger?: PinoLogger;
}

@Module({})
export class RabbitMQModule {
  static forRoot(options: RabbitMQModuleOptions = {}): DynamicModule {
    const logger = options.customLogger;
    
    return {
      global: true,
      module: RabbitMQModule,
      imports: [
        ConfigModule, 
        AppLoggerModule.forRootAsync({
          imports: [ConfigModule],
          inject: [ConfigService],
          useFactory: (configService: ConfigService) => ({
            level: configService.get('LOG_LEVEL'),
            exclude: excludedRoutes,
          }),
        })
      ],
      providers: [
        RabbitMQProducerService,
        RabbitMQConsumerService
      ],
      exports: [
        RabbitMQProducerService,
        RabbitMQConsumerService
      ]
    };
  }

  static forFeature(options: RabbitMQModuleOptions = {}): DynamicModule {
    const logger = options.customLogger;
       
    return {
      global: true,
      module: RabbitMQModule,
      imports: [
        ConfigModule, 
        AppLoggerModule.forRootAsync({
          imports: [ConfigModule],
          inject: [ConfigService],
          useFactory: (configService: ConfigService) => ({
            level: configService.get('LOG_LEVEL'),
            exclude: excludedRoutes,
          }),
        })
      ],
      providers: [
        RabbitMQProducerService,
        RabbitMQConsumerService
      ],
      exports: [
        RabbitMQProducerService,
        RabbitMQConsumerService
      ]
    };
  }
}