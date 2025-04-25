import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, HydratedDocument, Types } from 'mongoose';
import { User } from '../../users/schemas/user.schemas';

export type BorrowerDocument = HydratedDocument<Borrower>;

/**
 * Represents a borrower in the library management system.
 * 
 * This schema defines the structure of borrower documents in the database. Each borrower
 * has a unique name and can be associated with a user account in the system.
 * 
 * @Schema configuration:
 * - virtuals: true - Enables virtual properties that aren't stored in MongoDB
 * - versionKey: false - Disables the __v field that MongoDB adds by default
 * - id: true - Adds a virtual id getter/setter that converts _id to/from a string
 * - collection: 'borrowers' - Specifies the collection name in MongoDB
 * 
 * @remarks
 * The borrower is linked to a User document through the user property,
 * which allows tracking which system user account is associated with this borrower.
 */
@Schema({
  virtuals: true,
  versionKey: false,
  id: true,
  collection: 'borrowers',
})
export class Borrower extends Document {
  @Prop({ unique: true })
  name: string;

  @Prop({ type: Types.ObjectId, ref: 'User', required: false })
  user: User;
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
