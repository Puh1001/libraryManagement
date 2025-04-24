import { Test, TestingModule } from '@nestjs/testing';
import { BooksService } from './books.service';
import { BookRepository } from '../repositories/book.repository';
import { AuthorRepository } from '../repositories/author.repository';
import { ConfigService } from '@nestjs/config';
import { BadRequestException, ConflictException } from '@nestjs/common';
import mongoose, { Types } from 'mongoose';
import { BookType } from '../schemas/book.schema';

describe('BooksService', () => {
  let service: BooksService;
  let bookRepository: BookRepository;
  let authorRepository: AuthorRepository;
  let configService: ConfigService;

  const mockBook = {
    id: 'book-id',
    _id: 'book-id',
    name: 'Clean Code',
    description: 'A book about writing clean code',
    author: 'author-id',
    stockCount: 5,
    types: [BookType.PHYSICAL],
  };

  const mockAuthor = {
    id: 'author-id',
    _id: 'author-id',
    name: 'Robert C. Martin',
    birthDay: new Date('1952-12-05'),
  };

  const mockBookRepository = {
    create: jest.fn(),
    findOne: jest.fn(),
    findOneAndUpdate: jest.fn(),
    findAllWithPaginated: jest.fn(),
    remove: jest.fn(),
  };

  const mockAuthorRepository = {
    findOne: jest.fn(),
  };

  const mockConfigService = {
    get: jest.fn(),
  };

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        BooksService,
        {
          provide: BookRepository,
          useValue: mockBookRepository,
        },
        {
          provide: AuthorRepository,
          useValue: mockAuthorRepository,
        },
        {
          provide: ConfigService,
          useValue: mockConfigService,
        },
      ],
    }).compile();

    service = module.get<BooksService>(BooksService);
    bookRepository = module.get<BookRepository>(BookRepository);
    authorRepository = module.get<AuthorRepository>(AuthorRepository);
    configService = module.get<ConfigService>(ConfigService);

    // Mock Types.ObjectId.createFromHexString
    jest.spyOn(mongoose.Types, 'ObjectId').mockImplementation(() => {
      return {
        toString: () => 'mocked-object-id',
      } as unknown as Types.ObjectId;
    });
  });

  describe('create', () => {
    const createBookDto = {
      name: 'Clean Code',
      description: 'A book about writing clean code',
      authorId: 'author-id',
      stockCount: 5,
      types: [BookType.PHYSICAL],
    };

    it('should create a physical book', async () => {
      mockAuthorRepository.findOne.mockResolvedValue(mockAuthor);
      mockBookRepository.create.mockResolvedValue(mockBook);

      const result = await service.create(createBookDto);

      expect(mockAuthorRepository.findOne).toHaveBeenCalled();
      expect(mockBookRepository.create).toHaveBeenCalledWith({
        ...createBookDto,
        author: mockAuthor._id,
      });
      expect(result).toEqual(mockBook);
    });

    it('should throw BadRequestException if digital book has no file URL', async () => {
      const digitalBookDto = {
        ...createBookDto,
        types: [BookType.DIGITAL],
      };
      mockAuthorRepository.findOne.mockResolvedValue(mockAuthor);

      await expect(service.create(digitalBookDto)).rejects.toThrow(
        BadRequestException,
      );
      expect(mockBookRepository.create).not.toHaveBeenCalled();
    });

    it('should throw BadRequestException if physical book has no stock count', async () => {
      const noStockDto = {
        ...createBookDto,
        stockCount: 0,
      };
      mockAuthorRepository.findOne.mockResolvedValue(mockAuthor);

      await expect(service.create(noStockDto)).rejects.toThrow(
        BadRequestException,
      );
      expect(mockBookRepository.create).not.toHaveBeenCalled();
    });

    it('should throw ConflictException if book with same name exists', async () => {
      mockAuthorRepository.findOne.mockResolvedValue(mockAuthor);
      mockBookRepository.create.mockRejectedValue({ code: 11000 });
      mockConfigService.get.mockReturnValue('11000');

      await expect(service.create(createBookDto)).rejects.toThrow(
        ConflictException,
      );
    });
  });

  describe('findOne', () => {
    it('should return a book by id', async () => {
      mockBookRepository.findOne.mockResolvedValue(mockBook);

      const result = await service.findOne('book-id');

      expect(mockBookRepository.findOne).toHaveBeenCalledWith(
        { _id: 'book-id' },
        'Book with given id not found.',
      );
      expect(result).toEqual(mockBook);
    });
  });

  describe('updateBookTypes', () => {
    it('should update book types', async () => {
      const updateTypesDto = {
        types: [BookType.PHYSICAL, BookType.DIGITAL],
        stockCount: 10,
      };

      mockBookRepository.findOne.mockResolvedValue({
        ...mockBook,
        fileUrl: 'file-url',
      });
      mockBookRepository.findOneAndUpdate.mockResolvedValue({
        ...mockBook,
        types: [BookType.PHYSICAL, BookType.DIGITAL],
        stockCount: 10,
      });

      const result = await service.updateBookTypes('book-id', updateTypesDto);

      expect(mockBookRepository.findOneAndUpdate).toHaveBeenCalledWith(
        { id: 'book-id' },
        { types: updateTypesDto.types, stockCount: updateTypesDto.stockCount },
      );
      expect(result.types).toEqual([BookType.PHYSICAL, BookType.DIGITAL]);
      expect(result.stockCount).toEqual(10);
    });

    it('should throw BadRequestException if setting digital type without file URL', async () => {
      const updateTypesDto = {
        types: [BookType.DIGITAL],
        stockCount: 0,
      };

      mockBookRepository.findOne.mockResolvedValue(mockBook); // No fileUrl

      await expect(
        service.updateBookTypes('book-id', updateTypesDto),
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('lentBook', () => {
    it('should decrease book stock count by 1', async () => {
      mockBookRepository.findOne.mockResolvedValue(mockBook);
      mockBookRepository.findOneAndUpdate.mockResolvedValue({
        ...mockBook,
        stockCount: 4,
      });

      const result = await service.lentBook('book-id');

      expect(mockBookRepository.findOneAndUpdate).toHaveBeenCalledWith(
        { id: 'book-id' },
        { stockCount: 4 },
      );
      expect(result.stockCount).toBe(4);
    });
  });

  describe('returnBook', () => {
    it('should increase book stock count by 1', async () => {
      mockBookRepository.findOne.mockResolvedValue(mockBook);
      mockBookRepository.findOneAndUpdate.mockResolvedValue({
        ...mockBook,
        stockCount: 6,
      });

      const result = await service.returnBook('book-id');

      expect(mockBookRepository.findOneAndUpdate).toHaveBeenCalledWith(
        { id: 'book-id' },
        { stockCount: 6 },
      );
      expect(result.stockCount).toBe(6);
    });
  });
});
