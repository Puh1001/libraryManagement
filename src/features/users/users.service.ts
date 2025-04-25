import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectModel } from '@nestjs/mongoose';
import * as bcrypt from 'bcryptjs';
import { Model } from 'mongoose';
import { EnvironmentConstants } from '../../common/constants/environment.constants';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { User } from './schemas/user.schemas';

/**
 * Service responsible for handling user management operations
 * Provides CRUD operations and authentication-related functions
 */
@Injectable()
export class UsersService {
  constructor(
    @InjectModel(User.name) private UserModel: Model<User>,
    private readonly configService: ConfigService,
  ) {}

  /**
   * Creates a new user in the database
   * @param payload - User data transfer object containing user information
   * @returns Newly created user document
   * @throws ConflictException if user with same email already exists
   */
  async create(payload: CreateUserDto) {
    try {
      const createdUserDocument = new this.UserModel(payload);
      await createdUserDocument.save();
      return createdUserDocument;
    } catch (error) {
      if (
        error.code ===
        +this.configService.get(EnvironmentConstants.DUPLICATE_ERROR_KEY)
      ) {
        throw new ConflictException(
          `User with email(${payload.email}) already exists.`,
        );
      }
      throw error;
    }
  }

  /**
   * Retrieves all users from the database
   * @returns Array of user documents
   */
  findAll() {
    return this.UserModel.find();
  }

  /**
   * Finds a user by their email address
   * @param email - Email address to search for
   * @returns User document if found, otherwise null
   */
  findByEmail(email: string) {
    return this.UserModel.findOne({ email });
  }

  /**
   * Finds a user by ID and throws exception if not found
   * @param id - User's unique identifier
   * @returns User document
   * @throws NotFoundException if user doesn't exist
   */
  async findOneOrFail(id: string) {
    const user = await this.UserModel.findById(id);
    if (!user) {
      throw new NotFoundException(`User with given id ${id} not found.`);
    }
    return user;
  }

  /**
   * Finds a user by ID without throwing exception if not found
   * @param id - User's unique identifier
   * @returns User document if found, otherwise null
   */
  async findOne(id: string) {
    const user = await this.UserModel.findById(id);
    return user;
  }

  /**
   * Updates user information
   * @param id - User's unique identifier
   * @param updateUserDto - Data transfer object containing fields to update
   * @returns Updated user document
   */
  async update(id: string, updateUserDto: UpdateUserDto) {
    const updatedUser = await this.UserModel.findOneAndUpdate(
      { _id: id },
      updateUserDto,
      {
        new: true,
      },
    );
    return updatedUser;
  }

  /**
   * Updates a user's password with hashed value
   * @param id - User's unique identifier
   * @param password - New password (plain text)
   * @returns Updated user document
   */
  async updatePassword(id: string, password: string) {
    const hashedPassword = await bcrypt.hash(password, 10);
    const updatedUser = await this.UserModel.findOneAndUpdate(
      { _id: id },
      { password: hashedPassword },
    );
    return updatedUser;
  }

  /**
   * Removes a user from the database
   * @param id - User's unique identifier
   * @returns Object with success status
   * @throws NotFoundException if user doesn't exist
   */
  async remove(id: string) {
    await Promise.all([
      await this.findOneOrFail(id),
      await this.UserModel.deleteOne({ _id: id }),
    ]);
    return { success: true };
  }
}
