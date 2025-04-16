import { IsNotEmpty, IsString } from 'class-validator';

export class CreateBorrowerDto {
  @IsString()
  @IsNotEmpty()
  name: string;
}
