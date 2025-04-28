import { ConflictException, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { EnvironmentConstants } from '../../../common/constants/environment.constants';
import { PaginatedParamsDto } from '../../../common/dto/paginated-query.dto';
import { CreateBorrowerDto } from '../dto/create-borrower.dto';
import { UpdateBorrowerDto } from '../dto/update-borrower.dto';
import { BorrowerRepository } from '../repositories/borrower.repository';
import { UserDocument } from '../../users/schemas/user.schemas';
import { Types } from 'mongoose';

/**
 * Service responsible for managing borrowers in the library system
 * Handles CRUD operations and user-borrower association
 */
@Injectable()
export class BorrowersService {
  constructor(
    private readonly configService: ConfigService,
    private readonly borrowerRepository: BorrowerRepository,
  ) {}

  /**
   * Creates a new borrower
   * @param payload - Data required to create a borrower
   * @returns Newly created borrower
   * @throws ConflictException if borrower with the same name already exists
   */
  async create(payload: CreateBorrowerDto) {
    try {
      return await this.borrowerRepository.create({
        ...payload,
      } as any);
    } catch (error) {
      // Check if the error is due to duplicate entry
      if (
        error.code ===
        +this.configService.get(EnvironmentConstants.DUPLICATE_ERROR_KEY)
      ) {
        throw new ConflictException(
          `Borrower with name(${payload.name}) already exists.`,
        );
      }
      throw error;
    }
  }

  /**
   * Retrieves all borrowers with pagination
   * @param queryParams - Pagination parameters
   * @returns Paginated list of borrowers
   */
  findAll(queryParams: PaginatedParamsDto) {
    return this.borrowerRepository.findAllWithPaginated(queryParams);
  }

  /**
   * Finds a borrower by ID
   * @param id - Borrower ID to search for
   * @returns Borrower information
   * @throws Error if borrower not found
   */
  async findOne(id: string) {
    const borrower = await this.borrowerRepository.findOne(
      {
        $or: [
          { _id: Types.ObjectId.isValid(id) ? new Types.ObjectId(id) : id },
          { id: id },
        ],
      },
      'Borrower with given id not found.',
    );
    return borrower;
  }

  /**
   * Updates borrower information
   * @param id - ID of borrower to update
   * @param updateBorrowerDto - New data for the borrower
   * @returns Updated borrower information
   */
  async update(id: string, updateBorrowerDto: UpdateBorrowerDto) {
    const borrower = await this.findOne(id);
    return this.borrowerRepository.findOneAndUpdate(
      { id: borrower.id },
      { ...updateBorrowerDto },
    );
  }

  /**
   * Deletes a borrower from the system
   * @param id - ID of borrower to remove
   * @returns Success status
   */
  async remove(id: string) {
    const borrower = await this.findOne(id);
    await this.borrowerRepository.remove({ _id: borrower._id });
    return { success: true };
  }

  /**
   * Finds a borrower profile by user ID
   * @param userId - The ID of associated user
   * @returns Borrower profile or null if not found
   */
  async findByUserId(userId: string) {
    try {
      return await this.borrowerRepository.findOne(
        { user: userId },
        'No borrower profile found for this user',
      );
    } catch (error) {
      // Return null instead of throwing error if borrower profile doesn't exist
      if (error.message === 'No borrower profile found for this user') {
        return null;
      }
      throw error;
    }
  }

  /**
   * Registers a user as a borrower or returns existing borrower profile
   * @param user - User document to register as borrower
   * @returns Existing or newly created borrower profile
   * @throws ConflictException if borrower with the user's name already exists
   */
  async registerUserAsBorrower(user: UserDocument) {
    try {
      // Check if user already has a borrower profile
      const existingBorrower = await this.findByUserId(user.id);
      if (existingBorrower) {
        return existingBorrower;
      }

      // Create new borrower profile for the user
      return await this.borrowerRepository.create({
        name: user.name,
        user: user.id,
      } as any);
    } catch (error) {
      // Handle duplicate name error
      if (
        error.code ===
        +this.configService.get(EnvironmentConstants.DUPLICATE_ERROR_KEY)
      ) {
        throw new ConflictException(
          `Borrower with name(${user.name}) already exists.`,
        );
      }
      throw error;
    }
  }
}
