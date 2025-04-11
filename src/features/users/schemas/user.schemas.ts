import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import * as bcrypt from 'bcryptjs';
import { Exclude } from 'class-transformer';
import { Document, HydratedDocument } from 'mongoose';

export enum UserRole {
  READER = 'reader',
  LIBRARIAN = 'librarian',
}

export type UserDocument = HydratedDocument<User>;

@Schema({
  virtuals: true,
  versionKey: false,
  id: true,
  timestamps: true,
})
export class User extends Document {
  @Prop()
  name: string;

  @Prop({ required: true, unique: true })
  email: string;

  @Exclude()
  @Prop({ required: true })
  password: string;

  @Prop({ enum: UserRole, default: UserRole.READER })
  role: UserRole;

  async comparePassword(plainTextPassword: string) {
    return await bcrypt.compare(plainTextPassword, this.password);
  }
}

export const UserSchema = SchemaFactory.createForClass(User);
UserSchema.set('toJSON', {
  virtuals: true,
  transform: (doc, ret, opt) => {
    delete ret.password;
    ret.id = ret._id;
    delete ret._id;
    return ret;
  },
});
UserSchema.pre('save', async function () {
  if (this.isModified('password') || this.isNew) {
    this.password = await bcrypt.hash(this.password, 10);
  }
});
