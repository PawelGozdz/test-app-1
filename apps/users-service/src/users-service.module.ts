import { Module } from '@nestjs/common';
import { APP_FILTER } from '@nestjs/core';
import { ConfigModule, ConfigService } from '@nestjs/config';

import { MongooseModule } from '@nestjs/mongoose';
import { AppLoggerModule, excludedRoutes, MicroserviceExceptionFilter, RabbitMQModule } from '@libs/common';

import { UsersServiceController } from './users-service.controller';
import { UserCommandRepository, UserModel, UserQueryRepository, UserSchema } from './infrastructure';
import { DeleteUserHandler, CreateUserHandler, UpdateUserHandler, GetManyUsersHandler } from './application';
import { IUserCommandRepository, IUserQueryRepository } from './domain';
import { UserEventsService } from './user-events.service';

const errorFilters = [
  {
    provide: APP_FILTER,
    useClass: MicroserviceExceptionFilter,
  }
];

const providers = [
  {
    provide: IUserQueryRepository,
    useClass: UserQueryRepository,
  },
  {
    provide: IUserCommandRepository,
    useClass: UserCommandRepository,
  },
  CreateUserHandler,
  UpdateUserHandler,
  DeleteUserHandler,
  GetManyUsersHandler,
  UserEventsService,
]

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
    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => {
        const dbUser = configService.get('DATABASE_USER');
        const dbPassword = configService.get('DATABASE_PASSWORD');
        const dbHost = configService.get('DATABASE_HOST');
        const dbPort = configService.get('DATABASE_PORT');
        const dbName = configService.get('DATABASE_NAME');
        
        const uri = `mongodb://${dbUser}:${dbPassword}@${dbHost}:${dbPort}/${dbName}?authSource=admin`;
        
        return {
          uri,
          useNewUrlParser: true,
          useUnifiedTopology: true,
        };
      }
    }),
    MongooseModule.forFeature([
      { name: UserModel.name, schema: UserSchema }
    ]),
    RabbitMQModule.forRoot(),
  ],
  controllers: [UsersServiceController],
  providers: [...providers, ...errorFilters],
})
export class UsersServiceModule {}
