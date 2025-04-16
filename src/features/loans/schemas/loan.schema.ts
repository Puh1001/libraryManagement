import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, HydratedDocument, Types } from 'mongoose';

export type BookLoanDocument = HydratedDocument<BookLoan>;

export enum LoanStatus {
  LENT = 'LENT',
  RETURNED = 'RETURNED',
  RECALLED = 'RECALLED',
}

@Schema({
  virtuals: true,
  versionKey: false,
  id: true,
})
export class BookLoan extends Document {
  @Prop({ type: Types.ObjectId, ref: 'borrowers' })
  borrower: string;

  @Prop({ type: Types.ObjectId, ref: 'books' })
  book: string;

  @Prop({ required: true, type: Date })
  loanDate: Date;

  @Prop({ type: Date })
  returnDate: Date;

  @Prop({ required: true, enum: Object.values(LoanStatus), type: String })
  status: string;
}

export const BookLoanSchema = SchemaFactory.createForClass(BookLoan);
BookLoanSchema.set('toJSON', {
  virtuals: true,
  transform: (doc, ret, opt) => {
    ret.id = ret._id;
    delete ret._id;
    return ret;
  },
});
