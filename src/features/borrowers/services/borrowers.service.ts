import { ConflictException, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { EnvironmentConstants } from 'src/common/constants/environment.constants';
import { PaginatedParamsDto } from 'src/common/dto/paginated-query.dto';
import { CreateBorrowerDto } from '../dto/create-borrower.dto';
import { UpdateBorrowerDto } from '../dto/update-borrower.dto';
import { BorrowerRepository } from '../repositories/book.repository';

@Injectable()
export class BorrowersService {
  constructor(
    private readonly configService: ConfigService,
    private readonly borrowerRepository: BorrowerRepository,
  ) {}

  async create(payload: CreateBorrowerDto) {
    try {
      return await this.borrowerRepository.create({
        ...payload,
      } as any);
    } catch (error) {
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

  findAll(queryParams: PaginatedParamsDto) {
    return this.borrowerRepository.findAllWithPaginated(queryParams);
  }

  async findOne(id: string) {
    const borrower = await this.borrowerRepository.findOne(
      {
        _id: id,
      },
      'Borrower with given id not found.',
    );
    return borrower;
  }

  async update(id: string, updateBorrowerDto: UpdateBorrowerDto) {
    const borrower = await this.findOne(id);
    return this.borrowerRepository.findOneAndUpdate(
      { id: borrower.id },
      { ...updateBorrowerDto },
    );
  }

  async remove(id: string) {
    const borrower = await this.findOne(id);
    await this.borrowerRepository.remove({ _id: borrower._id });
    return { success: true };
  }
}
