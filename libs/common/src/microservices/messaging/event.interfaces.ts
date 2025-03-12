import { Event } from './event.model';

interface User {
  id: string;
  email: string;
  name: string;
  createdAt: Date;
}

export interface IUserCreatedEvent extends Event<User> {}
export interface IUserDeletedEvent extends Event<User> {}
