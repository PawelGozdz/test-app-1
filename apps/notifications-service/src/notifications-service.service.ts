import { AckableConsumeMessage, Event, Exchange, IUserCreatedEvent, IUserDeletedEvent, Queue, RabbitMQConsumerService, RoutingKey } from '@libs/common';
import { Injectable, OnModuleInit } from '@nestjs/common';
import { PinoLogger } from 'nestjs-pino';

@Injectable()
export class NotificationsServiceService implements OnModuleInit {

  constructor(
    private readonly consumer: RabbitMQConsumerService,
    private readonly logger: PinoLogger
  )
  {}

  async onModuleInit() {
    await this.consumer.onModuleInit();
    await this.consumer.subscribe<IUserCreatedEvent>(
      {
        exchange: Exchange.EVENTS,
        routingKey: RoutingKey.USER_CREATED,
        queue: Queue.NOTIFICATIONS_USER_CREATED,
        autoAck: false,
        requeueOnError: false
      },
      async (message) => {
        await this.userCreated(message)
      }
    )

    await this.consumer.subscribe<IUserDeletedEvent>(
      {
        exchange: Exchange.EVENTS,
        routingKey: RoutingKey.USER_DELETED,
        queue: Queue.NOTIFICATIONS_USER_DELETED,
        autoAck: false,
        requeueOnError: false
      },
      async (message) => {
        await this.userDeleted(message)
      }
    )
  }

  async userCreated(event: AckableConsumeMessage<IUserCreatedEvent>) {
    this.logger.info('USER Created');
    await event.ack();
  }

  async userDeleted(event: AckableConsumeMessage<IUserDeletedEvent>) {
    this.logger.info('USER Deleted');
    await event.ack();
  }
}
