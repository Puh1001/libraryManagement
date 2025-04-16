import { IsMongoId } from 'class-validator';

export enum StatusEnum {
  RETURNED = 'RETURNED',
  LENT = 'LENT',
}

export class CreateLoanDto {
  @IsMongoId()
  borrowerId: string;
  @IsMongoId()
  bookId: string;
}
