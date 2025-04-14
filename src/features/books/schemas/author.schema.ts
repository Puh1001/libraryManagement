import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, HydratedDocument } from 'mongoose';

export type AuthorDocument = HydratedDocument<Author>;

@Schema({
  virtuals: true,
  versionKey: false,
  id: true,
  collection: 'authors',
})
export class Author extends Document {
  @Prop({ type: String, required: true, unique: true })
  name: string;
  @Prop({ type: Date })
  birthDay: Date;
}

export const AuthorSchema = SchemaFactory.createForClass(Author);
AuthorSchema.set('toJSON', {
  virtuals: true,
  transform: (doc, ret, opt) => {
    ret.id = ret._id;
    delete ret._id;
    return ret;
  },
});
