import {
  BadRequestException,
  ConflictException,
  Injectable,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import mongoose from 'mongoose';
import { EnvironmentConstants } from '../../../common/constants/environment.constants';
import { PaginatedParamsDto } from '../../../common/dto/paginated-query.dto';
import { CreateBookDto } from '../dto/create-book.dto';
import { UpdateBookDto } from '../dto/update-book.dto';
import { AuthorRepository } from '../repositories/author.repository';
import { BookRepository } from '../repositories/book.repository';
import { BookType } from '../schemas/book.schema';
import { UpdateBookTypesDto } from '../dto/update-book-types.dto';

@Injectable()
export class BooksService {
  constructor(
    private readonly configService: ConfigService,
    private readonly bookRepository: BookRepository,
    private readonly authorRepository: AuthorRepository,
  ) {}

  async create(payload: CreateBookDto) {
    try {
      const author = await this.authorRepository.findOne(
        new mongoose.Types.ObjectId(payload.authorId),
        'Author with given id not found.',
      );

      if (payload.types.includes(BookType.DIGITAL) && !payload.fileUrl) {
        throw new BadRequestException('File URL is required for digital books');
      }

      if (
        payload.types.includes(BookType.PHYSICAL) &&
        (!payload.stockCount || payload.stockCount <= 0)
      ) {
        throw new BadRequestException(
          'Stock count must be greater than 0 for physical books',
        );
      }

      return await this.bookRepository.create({
        ...payload,
        author: author._id,
      } as any);
    } catch (error) {
      if (
        error.code ===
        +this.configService.get(EnvironmentConstants.DUPLICATE_ERROR_KEY)
      ) {
        throw new ConflictException(
          `Book with name(${payload.name}) already exists.`,
        );
      }
      throw error;
    }
  }

  findAll(queryParams: PaginatedParamsDto) {
    let filter = {};
    if (queryParams.query) {
      filter = {
        $or: [
          { name: { $regex: queryParams.query, $options: 'i' } },
          { description: { $regex: queryParams.query, $options: 'i' } },
        ],
      };
    }
    return this.bookRepository.findAllWithPaginated(queryParams, filter);
  }

  async findOne(id: string) {
    const book = await this.bookRepository.findOne(
      {
        _id: id,
      },
      'Book with given id not found.',
    );
    return book;
  }

  async update(id: string, updateBookDto: UpdateBookDto) {
    const book = await this.findOne(id);
    return this.bookRepository.findOneAndUpdate(
      { id: book.id },
      { ...updateBookDto },
    );
  }

  async updateCoverImage(id: string, coverImagePath: string) {
    const book = await this.findOne(id);
    return this.bookRepository.findOneAndUpdate(
      { id: book.id },
      { coverImage: coverImagePath },
    );
  }

  async updateBookFile(id: string, filePath: string) {
    const book = await this.findOne(id);

    const types = book.types || [];
    if (!types.includes(BookType.DIGITAL)) {
      types.push(BookType.DIGITAL);
    }

    return this.bookRepository.findOneAndUpdate(
      { id: book.id },
      {
        fileUrl: filePath,
        types,
      },
    );
  }

  async remove(id: string) {
    const book = await this.findOne(id);
    await this.bookRepository.remove({ _id: book._id });
    return { success: true };
  }

  async lentBook(id: string) {
    const book = await this.findOne(id);
    return this.bookRepository.findOneAndUpdate(
      { id: book.id },
      { stockCount: book.stockCount - 1 },
    );
  }

  async returnBook(id: string) {
    const book = await this.findOne(id);
    return this.bookRepository.findOneAndUpdate(
      { id: book.id },
      { stockCount: book.stockCount + 1 },
    );
  }

  async updateBookTypes(id: string, updateTypesDto: UpdateBookTypesDto) {
    const book = await this.findOne(id);

    if (updateTypesDto.types.includes(BookType.DIGITAL) && !book.fileUrl) {
      throw new BadRequestException(
        'Cannot set digital type when no file is uploaded. Please upload a file first.',
      );
    }

    if (
      updateTypesDto.types.includes(BookType.PHYSICAL) &&
      updateTypesDto.stockCount === undefined &&
      book.stockCount === 0
    ) {
      throw new BadRequestException(
        'Stock count must be provided when adding physical type.',
      );
    }

    const updateData: any = { types: updateTypesDto.types };

    if (updateTypesDto.stockCount !== undefined) {
      updateData.stockCount = updateTypesDto.stockCount;
    }

    return this.bookRepository.findOneAndUpdate({ id: book.id }, updateData);
  }
}
