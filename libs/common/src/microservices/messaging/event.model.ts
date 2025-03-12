import { v4 as uuidV4 } from 'uuid';

export interface EventMetadata {
  eventId: string;
  eventType: string;
  eventVersion: string;
  producedAt: string;
  correlationId?: string;
  traceId?: string;
  userId?: string;
  source: string;
  retryCount?: number;
}

export class Event<T> {
  data: T;
  metadata: EventMetadata;

  constructor(data: T, metadata: EventMetadata) {
    this.data = data;
    this.metadata = metadata;
  }

  static create<T>(
    data: T, 
    eventType: string, 
    source: string,
    options?: {
      eventVersion?: string;
      correlationId?: string;
      traceId?: string;
      userId?: string;
    }
  ): Event<T> {
    return new Event(data, {
      eventId: uuidV4(),
      eventType,
      eventVersion: options?.eventVersion || '1.0',
      producedAt: new Date().toISOString(),
      correlationId: options?.correlationId,
      traceId: options?.traceId,
      userId: options?.userId,
      source,
      retryCount: 0
    });
  }
}