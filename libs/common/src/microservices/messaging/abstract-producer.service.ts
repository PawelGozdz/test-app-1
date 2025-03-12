export interface ProducerOptions {
  exchange: string;
  routingKey: string;
  persistent?: boolean;
  messageId?: string;
  correlationId?: string;
  headers?: Record<string, any>;
  retryCount?: number;
  maxRetries?: number;
  backoff?: {
    type: 'fixed' | 'exponential';
    delay: number;
  };
}

export interface IMessageProducer {
  publish<T>(message: T, options: ProducerOptions): Promise<boolean>;
  setupInfrastructure(): Promise<void>;
  healthCheck(): Promise<boolean>;
}

export abstract class AbstractMessageProducer implements IMessageProducer {
  constructor(
    protected readonly logger: any
  ) {}

  /**
   * Posts a message via a broker
   * @param message Message
   * @param options Options
   * @returns Promise<boolean> Information about the success of the operation
   */
  abstract publish<T>(message: T, options: ProducerOptions): Promise<boolean>;

  /**
   * Configures the necessary infrastructure (exchangers, queues)
   */
  abstract setupInfrastructure(): Promise<void>;

  /**
   * Checks the connection status with the broker
   */
  abstract healthCheck(): Promise<boolean>;
}