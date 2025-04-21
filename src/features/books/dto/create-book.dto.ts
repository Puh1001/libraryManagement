import { ApiProperty } from '@nestjs/swagger';
import {
  IsArray,
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

  @ApiProperty({
    example: 5,
    description: 'Number of physical copies (if applicable)',
  })
  @IsNumber()
  @Min(0)
  @IsOptional()
  stockCount?: number = 0;

  @ApiProperty({
    enum: BookType,
    isArray: true,
    example: ['physical', 'digital'],
    description: 'Types of book formats available',
  })
  @IsArray()
  @IsEnum(BookType, { each: true })
  types: BookType[] = [BookType.PHYSICAL];

  @ApiProperty({
    required: false,
    description: 'URL to digital file (required if digital type is included)',
  })
  @IsString()
  @IsOptional()
  fileUrl?: string;
}
