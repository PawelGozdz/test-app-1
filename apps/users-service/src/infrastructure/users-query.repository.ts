import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { IUserQueryRepository, UserInfo } from '../domain';
import { UserDocument, UserModel } from './user.schema';
import { GetUsersInternalDto } from '@libs/common';

@Injectable()
export class UserQueryRepository implements IUserQueryRepository {
  constructor(
    @InjectModel(UserModel.name) private readonly userModel: Model<UserDocument>,
  ) {}

  async getOneById(id: string): Promise<UserInfo | undefined> {
    const user = await this.userModel.findOne({ id }).lean().exec();
    
    if (!user) {
      return undefined;
    }
    
    return this.toUserInfo(user);
  }

  async getMany(query: GetUsersInternalDto): Promise<UserInfo[]> {
    const { _limit, _page, email, id, name } = query.data;
    
    const mongoFilters: Record<string, any> = {};
    
    if (email) {
      mongoFilters.email = { $regex: email, $options: 'i' };
    }

    if (id) {
      mongoFilters.id = { $regex: id, $options: 'i' };
    }
    
    if (name) {
      mongoFilters.name = { $regex: name, $options: 'i' };
    }

    const users = await this.userModel
      .find(mongoFilters)
      .skip(_page - 1)
      .limit(_limit)
      .lean()
      .exec();
    
    return users.map(user => this.toUserInfo(user));
  }
  
  private toUserInfo(user: any): UserInfo {
    return {
      id: user.id,
      mongoId: user._id.toString(),
      name: user.name,
      email: user.email,
      createdAt: user.createdAt,
    };
  }
}