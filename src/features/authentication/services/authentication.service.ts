import {
  BadRequestException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import * as bcrypt from 'bcryptjs';
import { UserDocument } from '../../users/schemas/user.schemas';
import { UsersService } from '../../users/users.service';
import { ChangePasswordDTO } from '../dto/change-password.dto';
import { LoginDTO } from '../dto/login.dto';
import { RegisterDto } from '../dto/register.dto';

@Injectable()
export class AuthenticationService {
  constructor(private readonly usersService: UsersService) {}
  async register(payload: RegisterDto) {
    return this.usersService.create(payload);
  }

  async login({ email, password }: LoginDTO) {
    const user = await this.usersService.findByEmail(email);
    if (!user) {
      throw new UnauthorizedException('Invalid email / password');
    }
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      throw new UnauthorizedException('Invalid email / password');
    }
    return user;
  }
  async logout() {
    return { success: true };
  }
  async changePassword(
    user: UserDocument,
    { oldPassword, newPassword }: ChangePasswordDTO,
  ) {
    const isOldPasswordCorrect = await bcrypt.compare(
      oldPassword,
      user.password,
    );
    if (!isOldPasswordCorrect) {
      throw new BadRequestException('Incorrect old password.');
    }
    await this.usersService.updatePassword(user.id, newPassword);
    return { success: true, message: 'Successfully changed the password.' };
  }
  async deleteAccount(user: UserDocument) {
    await this.usersService.remove(user.id);
    return { success: true };
  }
}
