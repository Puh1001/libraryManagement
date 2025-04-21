import { IsNotEmpty, IsStrongPassword } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class ChangePasswordDTO {
  @ApiProperty({
    description: 'Current password',
    example: 'OldPassword123!',
  })
  @IsNotEmpty()
  oldPassword: string;

  @ApiProperty({
    description: 'New strong password',
    example: 'NewPassword456!',
  })
  @IsStrongPassword()
  newPassword: string;
}
