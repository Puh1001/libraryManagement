import { SetMetadata } from '@nestjs/common';
import { UserRole } from '../../features/users/schemas/user.schemas';

export const ROLES_KEY = 'roles';
export const Roles = (...roles: UserRole[]) => SetMetadata(ROLES_KEY, roles);
