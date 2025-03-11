import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';

import { UsersServiceController } from './users-service.controller';
import { APP_FILTER } from '@nestjs/core';
import { AppLoggerModule, excludedRoutes, MicroserviceExceptionFilter } from '@libs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { UserCommandRepository, UserModel, UserQueryRepository, UserSchema } from './infrastructure';
import { DeleteUserHandler, CreateUserHandler, UpdateUserHandler, GetManyUsersHandler } from './application';
import { IUserCommandRepository, IUserQueryRepository } from './domain';

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
  ],
  controllers: [UsersServiceController],
  providers: [...providers, ...errorFilters],
})
export class UsersServiceModule {}
