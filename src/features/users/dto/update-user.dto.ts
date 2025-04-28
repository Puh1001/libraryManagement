import { PartialType, PickType } from '@nestjs/mapped-types';
import { CreateUserDto } from './create-user.dto';
import { IsEnum, IsOptional } from 'class-validator';
import { UserRole } from '../schemas/user.schemas';

export class UpdateUserDto extends PartialType(
  PickType(CreateUserDto, ['email', 'name']),
) {
  @IsOptional()
  @IsEnum(UserRole)
  role?: UserRole;
}
