import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class CreateBorrowerDto {
  @ApiProperty({
    description: 'Full name of the borrower',
    example: 'Jane Smith',
    required: true,
  })
  @IsString()
  @IsNotEmpty()
  name: string;
}
