import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema } from 'mongoose';

export type UserDocument = UserModel & Document;

@Schema({
  timestamps: true,
  collection: 'users',
  toJSON: {
    transform: (_doc, ret) => {
      ret.mongoId = ret._id;
      delete ret._id;
      delete ret.__v;
      return ret;
    }
  }
})
export class UserModel {
  @Prop({ 
    type: String,
    required: true, 
    unique: true,
    index: true 
  })
  id: string;

  // Zachowuje domyślne MongoID do specjalnych zastosowań
  @Prop({ 
    type: MongooseSchema.Types.ObjectId,
    auto: true,
  })
  _id: any;
  
  @Prop({ 
    required: true, 
    unique: true 
  })
  name: string;

  @Prop({ 
    required: true, 
    unique: true 
  })
  email: string;
}

export const UserSchema = SchemaFactory.createForClass(UserModel);