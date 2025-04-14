import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import * as bcrypt from 'bcryptjs';
import { Types } from 'mongoose';
import { User } from 'src/features/users/schemas/user.schemas';

@Schema()
export class RefreshToken {
  @Prop()
  refreshToken: string;

  @Prop({ type: Types.ObjectId, ref: 'user' })
  user: User;

  @Prop()
  expirationTime: Date;
}

export const RefreshTokenSchema = SchemaFactory.createForClass(RefreshToken);

RefreshTokenSchema.pre('save', async function () {
  this.refreshToken = await bcrypt.hash(this.refreshToken, 10);
});
