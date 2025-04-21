import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsEnum, IsNumber, IsOptional, Min } from 'class-validator';
import { BookType } from '../schemas/book.schema';

export class UpdateBookTypesDto {
  @ApiProperty({
    enum: BookType,
    isArray: true,
    example: ['physical', 'digital'],
    description: 'Types of book formats available',
  })
  @IsArray()
  @IsEnum(BookType, { each: true })
  types: BookType[] = [];

  @ApiProperty({
    example: 5,
    description: 'Number of physical copies (if applicable)',
    required: false,
  })
  @IsOptional()
  @IsNumber()
  @Min(0)
  stockCount?: number;
}
