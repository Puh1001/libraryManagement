import { Test, TestingModule } from '@nestjs/testing';
import { AuthenticationService } from './authentication.service';
import { UsersService } from '../../users/users.service';
import { UnauthorizedException, BadRequestException } from '@nestjs/common';
import { User } from '../../users/schemas/user.schemas';
import * as bcrypt from 'bcryptjs';
import { Document } from 'mongoose';

describe('AuthenticationService', () => {
  let authService: AuthenticationService;
  let usersService: UsersService;

  const mockUser = {
    id: 'user-id',
    _id: 'user-id',
    name: 'Test User',
    email: 'test@example.com',
    password: 'hashedPassword123',
    comparePassword: jest.fn(),
    __v: 0,
    toJSON: () => ({
      id: 'user-id',
      name: 'Test User',
      email: 'test@example.com',
      password: 'hashedPassword123',
    }),
  } as unknown as Document<unknown, {}, User> &
    User &
    Required<{ _id: unknown }> & { __v: number };

  const mockUsersService = {
    create: jest.fn(),
    findByEmail: jest.fn(),
    updatePassword: jest.fn(),
    remove: jest.fn(),
  };

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthenticationService,
        {
          provide: UsersService,
          useValue: mockUsersService,
        },
      ],
    }).compile();

    authService = module.get<AuthenticationService>(AuthenticationService);
    usersService = module.get<UsersService>(UsersService);

    // Mock bcrypt
    jest.spyOn(bcrypt, 'compare').mockImplementation((pass, hash) => {
      return Promise.resolve(pass === 'correct-password');
    });
  });

  describe('register', () => {
    it('should create a new user', async () => {
      const createUserDto = {
        name: 'Test User',
        email: 'test@example.com',
        password: 'Password123!',
      };
      mockUsersService.create.mockResolvedValue(mockUser);

      const result = await authService.register(createUserDto);

      expect(mockUsersService.create).toHaveBeenCalledWith(createUserDto);
      expect(result).toEqual(mockUser);
    });
  });

  describe('login', () => {
    it('should return user if credentials are valid', async () => {
      const loginDto = {
        email: 'test@example.com',
        password: 'correct-password',
      };
      mockUsersService.findByEmail.mockResolvedValue(mockUser);

      const result = await authService.login(loginDto);

      expect(mockUsersService.findByEmail).toHaveBeenCalledWith(loginDto.email);
      expect(result).toEqual(mockUser);
    });

    it('should throw UnauthorizedException if user not found', async () => {
      const loginDto = {
        email: 'nonexistent@example.com',
        password: 'password',
      };
      mockUsersService.findByEmail.mockResolvedValue(null);

      await expect(authService.login(loginDto)).rejects.toThrow(
        UnauthorizedException,
      );
    });

    it('should throw UnauthorizedException if password is incorrect', async () => {
      const loginDto = {
        email: 'test@example.com',
        password: 'wrong-password',
      };
      mockUsersService.findByEmail.mockResolvedValue(mockUser);

      await expect(authService.login(loginDto)).rejects.toThrow(
        UnauthorizedException,
      );
    });
  });

  describe('changePassword', () => {
    it('should change password if old password is correct', async () => {
      const changePasswordDto = {
        oldPassword: 'correct-password',
        newPassword: 'NewPassword123!',
      };
      const successResponse = {
        success: true,
        message: 'Successfully changed the password.',
      };
      mockUsersService.updatePassword.mockResolvedValue({});

      const result = await authService.changePassword(
        mockUser,
        changePasswordDto,
      );

      expect(mockUsersService.updatePassword).toHaveBeenCalledWith(
        mockUser.id,
        changePasswordDto.newPassword,
      );
      expect(result).toEqual(successResponse);
    });

    it('should throw BadRequestException if old password is incorrect', async () => {
      const changePasswordDto = {
        oldPassword: 'wrong-password',
        newPassword: 'NewPassword123!',
      };

      await expect(
        authService.changePassword(mockUser, changePasswordDto),
      ).rejects.toThrow(BadRequestException);
      expect(mockUsersService.updatePassword).not.toHaveBeenCalled();
    });
  });

  describe('deleteAccount', () => {
    it('should delete user account', async () => {
      mockUsersService.remove.mockResolvedValue({ success: true });

      const result = await authService.deleteAccount(mockUser);

      expect(mockUsersService.remove).toHaveBeenCalledWith(mockUser.id);
      expect(result).toEqual({ success: true });
    });
  });
});
