import { User } from "./user.entity";

export abstract class IUserCommandRepository {
  abstract save(position: User): Promise<{ id: string }>;

  abstract delete(id: string): Promise<void>;

  abstract getOneById(id: string): Promise<User | undefined>;
  
  abstract getOneByNameOrEmail(name: string, email: string): Promise<User[]>;
}
