export interface ConsumerOptions {
  exchange: string;
  queue: string;
  routingKey: string;
  autoAck?: boolean;
  prefetchCount?: number;
  requeueOnError?: boolean;
  queueOptions?: {
    durable?: boolean;
    deadLetterExchange?: string;
    deadLetterRoutingKey?: string;
    messageTtl?: number;
    maxLength?: number;
  };
}

export interface ConsumeMessage<T> {
  content: T;
  properties: {
    messageId?: string;
    correlationId?: string;
    headers?: Record<string, any>;
    timestamp?: number;
    redelivered?: boolean;
  };
  fields: {
    exchange: string;
    routingKey: string;
  };
}

export interface IMessageConsumer {
  subscribe<T>(
    options: ConsumerOptions, 
    handler: (message: ConsumeMessage<T>) => Promise<void>
  ): Promise<void>;
  setupInfrastructure(): Promise<void>;
  healthCheck(): Promise<boolean>;
}

export abstract class AbstractMessageConsumer implements IMessageConsumer {
  constructor(
    protected readonly logger: any
  ) {}

  /**
   * Subscribes to a specific queue and processes messages
   * @param options Consumer Configuration Options
   * @param handler Message processing function
   */
  abstract subscribe<T>(
    options: ConsumerOptions, 
    handler: (message: ConsumeMessage<T>) => Promise<void>
  ): Promise<void>;

  /**
   * Configures the necessary infrastructure (exchangers, queues)
   */
  abstract setupInfrastructure(): Promise<void>;

  /**
   * Checks the connection status with the broker
   */
  abstract healthCheck(): Promise<boolean>;
}