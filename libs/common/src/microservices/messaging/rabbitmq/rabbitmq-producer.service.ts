import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PinoLogger } from 'nestjs-pino';
import { connect, Connection, Channel, Options } from 'amqplib';

import { AbstractMessageProducer, ProducerOptions } from '../abstract-producer.service';
import { Event } from '../event.model';

export interface RabbitMQConfig {
  uri: string;
  exchanges: Array<{
    name: string;
    type: string;
    options?: Options.AssertExchange;
  }>;
}

@Injectable()
export class RabbitMQProducerService extends AbstractMessageProducer implements OnModuleInit, OnModuleDestroy {
  private connection: Connection;
  private channel: Channel; // Zwykły kanał zamiast ConfirmChannel
  private readonly config: RabbitMQConfig;
  private readonly exchanges: Set<string> = new Set();

  constructor(
    private configService: ConfigService,
    readonly logger: PinoLogger
  ) {
    super(logger);

    const user = this.configService.get<string>('RABBITMQ_USER', 'guest');
    const password = this.configService.get<string>('RABBITMQ_PASSWORD', 'guest');
    const host = this.configService.get<string>('RABBITMQ_HOST', 'localhost');
    const port = this.configService.get<number>('RABBITMQ_PORT', 5672);
    const rabbitmqUri = `amqp://${user}:${password}@${host}:${port}`;

    this.config = {
      uri: rabbitmqUri,
      exchanges: this.configService.get<Array<any>>('RABBITMQ_EXCHANGES', []),
    };

    // Domyślna konfiguracja - tylko główna kolejka
    if (this.config.exchanges.length === 0) {
      this.config.exchanges = [
        { name: 'events', type: 'topic', options: { durable: true } }
      ];
    }
  }

  async onModuleInit(): Promise<void> {
    if (!this.config.uri) {
      throw new Error('RABBITMQ_URI environment variable not set');
    }
    
    await this.connect();
    await this.setupInfrastructure();
  }

  async onModuleDestroy(): Promise<void> {
    await this.closeConnection();
  }

  private async connect(): Promise<void> {
    try {
      this.logger.info('Connecting to RabbitMQ...');
      this.connection = await connect(this.config.uri);
      
      this.connection.on('error', (err) => {
        this.logger.error(`RabbitMQ connection error: ${err.message}`);
      });
      
      // Używamy zwykłego kanału zamiast kanału z potwierdzeniami
      this.channel = await this.connection.createChannel();
      
      this.logger.info('Successfully connected to RabbitMQ');
    } catch (error) {
      this.logger.error(`Failed to connect to RabbitMQ: ${error.message}`);
      throw error;
    }
  }

  private async closeConnection(): Promise<void> {
    try {
      if (this.channel) {
        await this.channel.close();
      }
      if (this.connection) {
        await this.connection.close();
      }
    } catch (error) {
      this.logger.warn(`Error closing RabbitMQ connection: ${error.message}`);
    }
  }

  async setupInfrastructure(): Promise<void> {
    if (!this.channel) {
      throw new Error('Cannot setup infrastructure: RabbitMQ channel not established');
    }
    
    try {
      // Konfiguracja exchange'y
      for (const exchange of this.config.exchanges) {
        await this.channel.assertExchange(exchange.name, exchange.type, exchange.options);
        this.exchanges.add(exchange.name);
        this.logger.info(`Exchange ${exchange.name} asserted`);
      }
    } catch (error) {
      this.logger.error(`Failed to setup RabbitMQ infrastructure: ${error.message}`);
      throw error;
    }
  }

  async publish<T>(message: T, options: ProducerOptions): Promise<boolean> {
    if (!this.channel) {
      throw new Error('Cannot publish message: RabbitMQ channel not established');
    }
    
    // Upewniamy się, że exchange istnieje
    if (!this.exchanges.has(options.exchange)) {
      await this.channel.assertExchange(options.exchange, 'topic', { durable: true });
      this.exchanges.add(options.exchange);
    }
    
    // Przygotowanie opcji publikacji
    const publishOptions: Options.Publish = {
      persistent: options.persistent === undefined ? true : options.persistent,
      messageId: options.messageId || crypto.randomUUID(),
      correlationId: options.correlationId,
      headers: {
        ...options.headers,
        'x-retry-count': options.retryCount || 0,
        'x-max-retries': options.maxRetries || 3
      }
    };
    
    if (options.backoff) {
      publishOptions.headers['x-backoff-type'] = options.backoff.type;
      publishOptions.headers['x-backoff-delay'] = options.backoff.delay;
    }
    
    // Przygotowanie treści wiadomości
    let content = message;
    
    // Jeśli wiadomość jest obiektem Event, używamy jej bez modyfikacji
    if (message instanceof Event) {
      content = message;
    }
    
    const buffer = Buffer.from(JSON.stringify(content));
    
    try {
      // Publikowanie wiadomości bez oczekiwania na potwierdzenie
      const result = this.channel.publish(
        options.exchange,
        options.routingKey,
        buffer,
        publishOptions
      );
      
      // Logowanie wyniku publikacji
      if (result) {
        this.logger.debug(`Message published to ${options.exchange}:${options.routingKey}`);
      } else {
        this.logger.warn(`Channel write buffer full when publishing to ${options.exchange}:${options.routingKey}`);
      }
      
      return result;
    } catch (error) {
      this.logger.error(
        `Failed to publish message to ${options.exchange}:${options.routingKey}: ${error.message}`
      );
      throw error;
    }
  }

  async healthCheck(): Promise<boolean> {
    return this.connection !== undefined 
      && this.channel !== undefined 
      && this.connection.connection !== undefined;
  }
}