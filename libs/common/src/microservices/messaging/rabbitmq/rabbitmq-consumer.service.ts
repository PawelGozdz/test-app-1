import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { connect, Connection, Channel, ConsumeMessage, Options } from 'amqplib';
import { PinoLogger } from 'nestjs-pino';

import { AbstractMessageConsumer, ConsumerOptions, ConsumeMessage as MessageConsume } from '../abstract-consumer.service';

// Extended consumer message interface with ack/nack methods
export interface AckableConsumeMessage<T> extends MessageConsume<T> {
  ack: () => void;
  nack: (requeue?: boolean) => void;
  originalMessage: ConsumeMessage; // Adding the original message for more advanced use cases
}

@Injectable()
export class RabbitMQConsumerService extends AbstractMessageConsumer implements OnModuleInit, OnModuleDestroy {
  private connection: Connection;
  private channel: Channel;
  private readonly activeConsumers: Map<string, { options: ConsumerOptions; handler: Function }> = new Map();

  constructor(
    private configService: ConfigService,
    readonly logger: PinoLogger
  ) {
    super(logger);
  }

  async onModuleInit(): Promise<void> {
    await this.connect();
    await this.setupInfrastructure();
  }

  async onModuleDestroy(): Promise<void> {
    await this.closeConnection();
  }

  private async connect(): Promise<void> {
    try {
      const user = this.configService.get<string>('RABBITMQ_USER', 'guest');
      const password = this.configService.get<string>('RABBITMQ_PASSWORD', 'guest');
      const host = this.configService.get<string>('RABBITMQ_HOST', 'localhost');
      const port = this.configService.get<number>('RABBITMQ_PORT', 5672);
      const rabbitmqUri = `amqp://${user}:${password}@${host}:${port}`;

      this.logger.info('Connecting to RabbitMQ...');
      this.connection = await connect(rabbitmqUri);
      
      this.connection.on('error', (err) => {
        this.logger.error(`RabbitMQ connection error: ${err.message}`);
      });
      
      this.channel = await this.connection.createChannel();
      
      this.channel.on('error', (err) => {
        this.logger.error(`RabbitMQ channel error: ${err.message}`);
      });
      
      const prefetchCount = this.configService.get<number>('RABBITMQ_PREFETCH', 10);
      await this.channel.prefetch(prefetchCount);
      
      this.logger.info('Successfully connected to RabbitMQ');
      
      // Restoring active consumers after reconnection
      if (this.activeConsumers.size > 0) {
        for (const [_consumerTag, consumer] of this.activeConsumers.entries()) {
          await this.subscribe<unknown>(
            consumer.options,
            consumer.handler as (message: AckableConsumeMessage<unknown>) => Promise<void>
          );
        }
      }
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
      // Configure the basic exchange
      const exchangeName = this.configService.get<string>('RABBITMQ_EXCHANGE', 'events');
      await this.channel.assertExchange(exchangeName, 'topic', { durable: true });
      this.logger.info(`Exchange ${exchangeName} asserted`);
      
      // Configure queues from config file, if they exist
      const queues = this.configService.get<Array<any>>('RABBITMQ_QUEUES', []);
      
      if (queues && queues.length > 0) {
        for (const queueConfig of queues) {
          await this.channel.assertQueue(queueConfig.name, queueConfig.options || { durable: true });
          
          for (const binding of queueConfig.bindings || []) {
            await this.channel.bindQueue(queueConfig.name, binding.exchange, binding.routingKey);
            this.logger.info(`Queue ${queueConfig.name} bound to ${binding.exchange} with routing key ${binding.routingKey}`);
          }
        }
      }
    } catch (error) {
      this.logger.error(`Failed to setup RabbitMQ infrastructure: ${error.message}`);
      throw error;
    }
  }

  async subscribe<T>(
    options: ConsumerOptions,
    handler: (message: AckableConsumeMessage<T>) => Promise<void>
  ): Promise<void> {
    if (!this.channel) {
      throw new Error('Cannot subscribe: RabbitMQ channel not established');
    }
    
    try {
      // Ensure the exchange exists
      await this.channel.assertExchange(options.exchange, 'topic', { durable: true });
      
      // Configure queue options
      const queueOptions: Options.AssertQueue = {
        durable: options.queueOptions?.durable === undefined ? true : options.queueOptions.durable
      };
      
      // Create the queue
      await this.channel.assertQueue(options.queue, queueOptions);
      
      // Bind the queue to the exchange
      await this.channel.bindQueue(options.queue, options.exchange, options.routingKey);
      
      this.logger.info(`Subscribed to queue ${options.queue} with routing key ${options.routingKey}`);
      
      // Always set noAck to false to allow manual message acknowledgement
      // Regardless of the options.autoAck value
      const consumerTag = await this.channel.consume(
        options.queue,
        async (msg: ConsumeMessage) => {
          if (!msg) return;
          
          // Parse the message
          try {
            const content = JSON.parse(msg.content.toString()) as T;
            
            // Prepare the message structure for the handler with ack/nack methods
            const message: AckableConsumeMessage<T> = {
              content,
              properties: {
                messageId: msg.properties.messageId,
                correlationId: msg.properties.correlationId,
                headers: msg.properties.headers || {},
                timestamp: msg.properties.timestamp,
                redelivered: msg.fields.redelivered
              },
              fields: {
                exchange: msg.fields.exchange,
                routingKey: msg.fields.routingKey
              },
              originalMessage: msg,
              // Add ack/nack methods directly to the message object
              ack: () => {
                try {
                  this.channel.ack(msg);
                  this.logger.debug(`Message ${msg.properties.messageId || 'unknown'} acknowledged`);
                } catch (error) {
                  this.logger.error(`Failed to acknowledge message: ${error.message}`);
                }
              },
              nack: (requeue = false) => {
                try {
                  this.channel.nack(msg, false, requeue);
                  this.logger.debug(`Message ${msg.properties.messageId || 'unknown'} rejected (requeue=${requeue})`);
                } catch (error) {
                  this.logger.error(`Failed to reject message: ${error.message}`);
                }
              }
            };
            
            try {
              // Call the handler with the message containing ack/nack methods
              await handler(message);
              
              // If autoAck is enabled, automatically acknowledge the message
              if (options.autoAck) {
                message.ack();
              }
              // Otherwise, the handler is responsible for calling ack/nack
            } catch (error) {
              this.logger.warn(
                `Error processing message from ${options.queue}: ${error.message}`
              );
              
              // If autoAck is enabled, automatically reject the message
              if (options.autoAck) {
                const shouldRequeue = options.requeueOnError !== undefined 
                  ? options.requeueOnError 
                  : false;
                
                message.nack(shouldRequeue);
              }
              // Otherwise, the handler is responsible for error handling
            }
          } catch (parseError) {
            // JSON parsing error - likely invalid message format
            this.logger.error(
              `Error parsing message from ${options.queue}: ${parseError.message}`
            );
            
            // The message is invalid, so we reject it
            this.channel.nack(msg, false, false);
          }
        },
        { noAck: false } // Always false to allow manual acknowledgement
      );
      
      // Store the consumer in active consumers
      this.activeConsumers.set(consumerTag, { options, handler });
    } catch (error) {
      this.logger.error(
        `Failed to subscribe to queue ${options.queue}: ${error.message}`
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