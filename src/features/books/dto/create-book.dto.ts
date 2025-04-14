import { ApiProperty } from '@nestjs/swagger';
import {
  IsEnum,
  IsMongoId,
  IsNumber,
  IsOptional,
  IsString,
  Min,
} from 'class-validator';
import { BookType } from '../schemas/book.schema';

export class CreateBookDto {
  @ApiProperty({ example: 'Clean Code' })
  @IsString()
  name: string;

  @ApiProperty({ example: 'A book about writing clean code' })
  @IsString()
  description: string;

  @ApiProperty({ example: '60d21b4667d0d8992e610c85' })
  @IsMongoId()
  authorId: string;

  @ApiProperty({ example: 5 })
  @IsNumber()
  @Min(1)
  stockCount: number;

  @ApiProperty({ enum: BookType, default: BookType.PHYSICAL })
  @IsEnum(BookType)
  @IsOptional()
  type?: BookType = BookType.PHYSICAL;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  fileUrl?: string;
}
