import { ApiProperty } from '@nestjs/swagger';
import { IsMongoId } from 'class-validator';

export enum StatusEnum {
  RETURNED = 'RETURNED',
  LENT = 'LENT',
  RECALLED = 'RECALLED',
}

export class CreateLoanDto {
  @ApiProperty({
    description: 'MongoDB ID of the borrower',
    example: '60d21b4667d0d8992e610c85',
  })
  @IsMongoId()
  borrowerId: string;

  @ApiProperty({
    description: 'MongoDB ID of the book to be borrowed',
    example: '60d21b4667d0d8992e610c86',
  })
  @IsMongoId()
  bookId: string;
}
