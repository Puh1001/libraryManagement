import { PickType } from '@nestjs/mapped-types';
import { RegisterDto } from './register.dto';

export class LoginDTO extends PickType(RegisterDto, ['email', 'password']) {}
