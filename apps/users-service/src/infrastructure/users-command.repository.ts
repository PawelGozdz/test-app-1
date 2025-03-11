import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { IUserCommandRepository, User } from '../domain';
import { UserDocument, UserModel } from './user.schema';

@Injectable()
export class UserCommandRepository implements IUserCommandRepository {
  constructor(
    @InjectModel(UserModel.name) private readonly userModel: Model<UserDocument>,
  ) {}

  async save(entity: User): Promise<{ id: string }> {
    const now = new Date();
      
    await this.userModel.updateOne(
      { id: entity.id },
      { 
        $set: {
          name: entity.name,
          email: entity.email,
        },
        $setOnInsert: {
          createdAt: entity.createdAt || now
        }
      },
      { 
        upsert: true,
        runValidators: true
      }
    ).exec();
    
    return { 
      id: entity.id,
    };
  }

  async delete(id: string): Promise<void> {
    await this.userModel.deleteOne({ id }).exec();
  }

  async getOneById(id: string): Promise<User | undefined> {
    const user = await this.userModel.findOne({ id }).lean().exec();
    
    if (!user) {
      return undefined;
    }
    
    return this.toEntity(user);
  }
  
  async getOneByNameOrEmail(name: string, email: string): Promise<User[]> {
    const users = await this.userModel
      .find({ 
        $or: [
          { name },
          { email }
        ] 
      })
      .lean()
      .exec();

    
    return users.map(user => this.toEntity(user));
  }
  
  private toEntity(user: any): User {
    return new User({
      id: user.id,
      mongoId: user._id.toString(),
      name: user.name,
      email: user.email,
    });
  }
}