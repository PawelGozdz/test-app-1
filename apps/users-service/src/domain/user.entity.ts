import { v4 } from 'uuid';

export class User {
  id: string;

  mongoId: string;

  name: string;

  email: string;

  createdAt: Date;

  constructor(props: { id: string; name: string; email: string; mongoId: string; createdAt?: Date}) {
    this.id = props.id;
    this.mongoId = props.mongoId;
    this.name = props.name;
    this.email = props.email;
    this.createdAt = props.createdAt;
  }

  public static create({ id, mongoId, name, email }: IUserCreateData): User {
    const entity = new User({
      id: id ?? v4(),
      mongoId,
      name,
      email,
    });

    return entity;
  }

  update({ name, email }: IUserCreateData): void {
    this.name = name;
    this.email = email;
  }
}

export type IUserCreateData = {
  id?: string;
  mongoId?: string;
  name: string;
  email: string;
};
