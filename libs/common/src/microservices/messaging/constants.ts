import { Apps } from "../../enums";

export enum EventType {
  USER_CREATED = 'USER_CREATED',
  USER_DELETED = 'USER_DELETED',
}

export enum EventSource {
  USERS_SERVICE = Apps.USERS_SERVICE,
  NOTIFICATIONS_SERVICE = Apps.NOTIFICATIONS_SERVICE,
}

export enum Exchange {
  EVENTS = 'events',
  EVENTS_RETRY = 'events.retry'
}

export enum RoutingKey {
  USER_CREATED = 'user.created',
  USER_DELETED = 'user.deleted',
}

export enum Queue {
  NOTIFICATIONS_USER_CREATED = 'notifications.user.created',
  NOTIFICATIONS_USER_DELETED = 'notifications.user.deleted',
}