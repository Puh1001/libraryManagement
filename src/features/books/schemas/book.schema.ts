import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, HydratedDocument, Types } from 'mongoose';
import { Author } from './author.schema';

export enum BookType {
  PHYSICAL = 'physical',
  DIGITAL = 'digital',
}

export type BookDocument = HydratedDocument<Book>;

@Schema({
  virtuals: true,
  versionKey: false,
  id: true,
})
export class Book extends Document {
  @Prop({ unique: true })
  name: string;

  @Prop({ type: Number, required: true })
  stockCount: number;

  @Prop()
  title: string;

  @Prop()
  description: string;

  @Prop({ type: Types.ObjectId, ref: 'authors' })
  author: Author;

  @Prop({
    type: String,
    enum: Object.values(BookType),
    default: BookType.PHYSICAL,
  })
  type: string;

  @Prop()
  coverImage: string;

  @Prop()
  fileUrl: string;
}

export const BookSchema = SchemaFactory.createForClass(Book);
BookSchema.set('toJSON', {
  virtuals: true,
  transform: (doc, ret, opt) => {
    ret.id = ret._id;
    delete ret._id;
    return ret;
  },
});
