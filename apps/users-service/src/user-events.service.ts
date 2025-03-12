import { Injectable } from '@nestjs/common';
import { Event, EventSource, EventType, Exchange, IMetadata, IUserCreatedEvent, RabbitMQProducerService, RoutingKey } from '@libs/common';
import { User } from './domain';
import { PinoLogger } from 'nestjs-pino';

@Injectable()
export class UserEventsService {
  constructor(
    private readonly producer: RabbitMQProducerService,
    private readonly logger: PinoLogger,
  ) {}

  async userCreated(user: User, metadata?: IMetadata): Promise<boolean> {
    const event = Event.create<IUserCreatedEvent['data']>(
      {
        id: user.id,
        email: user.email,
        name: user.name,
        createdAt: user.createdAt
      },
      EventType.USER_CREATED,
      EventSource.USERS_SERVICE,
      {
        ...(metadata ?? {}),
        eventVersion: '1.0',
        userId: user.id,
      }
    );
    
    return this.producer.publish(event, {
      exchange: Exchange.EVENTS,
      routingKey: RoutingKey.USER_CREATED,
      persistent: true
    }); 
  }

  async userDeleted(user: User, metadata?: IMetadata): Promise<boolean> {
    const event = Event.create(
      {
        id: user.id,
        email: user.email,
        name: user.name,
        createdAt: user.createdAt
      },
      EventType.USER_DELETED,
      EventSource.USERS_SERVICE,
      {
        ...(metadata ?? {}),
        eventVersion: '1.0',
        userId: user.id,
      }
    );

    return this.producer.publish(event, {
      exchange: Exchange.EVENTS,
      routingKey: RoutingKey.USER_DELETED,
      persistent: true
    });
  }
}