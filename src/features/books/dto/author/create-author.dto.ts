import { IsISO8601, IsNotEmpty, IsString } from 'class-validator';

export class CreateAuthorDTO {
  @IsString()
  name: string;
  @IsNotEmpty()
  @IsISO8601({ strict: true }, { message: 'Invalid ISO 8601 date format' })
  birthDay: string;
}
