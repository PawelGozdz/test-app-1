import { GetUsersInternalDto } from "@libs/common";

export type UserInfo = {
  id: string;
  mongoId: string;
  name: string;
  email: string;
  createdAt: Date;
};

export abstract class IUserQueryRepository {
  abstract getOneById(id: string): Promise<UserInfo | undefined>;

  abstract getMany(query: GetUsersInternalDto): Promise<UserInfo[]>;
}
