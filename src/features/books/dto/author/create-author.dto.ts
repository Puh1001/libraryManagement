import { ApiProperty } from '@nestjs/swagger';
import { IsISO8601, IsNotEmpty, IsString } from 'class-validator';

export class CreateAuthorDTO {
  @ApiProperty({
    description: 'Author name',
    example: 'Jane Austen',
  })
  @IsString()
  name: string;

  @ApiProperty({
    description: 'Author birth date (ISO 8601 format)',
    example: '1775-12-16',
  })
  @IsNotEmpty()
  @IsISO8601({ strict: true }, { message: 'Invalid ISO 8601 date format' })
  birthDay: string;
}
