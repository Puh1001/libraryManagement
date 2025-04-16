import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, HydratedDocument } from 'mongoose';

export type BorrowerDocument = HydratedDocument<Borrower>;

@Schema({
  virtuals: true,
  versionKey: false,
  id: true,
  collection: 'borrowers',
})
export class Borrower extends Document {
  @Prop({ unique: true })
  name: string;
}

export const BorrowerSchema = SchemaFactory.createForClass(Borrower);
BorrowerSchema.set('toJSON', {
  virtuals: true,
  transform: (doc, ret, opt) => {
    ret.id = ret._id;
    delete ret._id;
    return ret;
  },
});
