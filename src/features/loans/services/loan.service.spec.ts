import { Test, TestingModule } from '@nestjs/testing';
import { LoansService } from './loan.service';
import { BookLoanRepository } from '../repository/loan.repository';
import { BooksService } from '../../books/services/books.service';
import { BorrowersService } from '../../borrowers/services/borrowers.service';
import { BadRequestException, ForbiddenException, NotFoundException } from '@nestjs/common';
import { StatusEnum } from '../dto/create-loan.dto';
import { BookType } from '../../books/schemas/book.schema';
import { UserRole } from '../../users/schemas/user.schemas';

describe('LoansService', () => {
  let service: LoansService;
  let bookLoanRepository: BookLoanRepository;
  let booksService: BooksService;
  let borrowersService: BorrowersService;

  const mockBook = {
    id: 'book-id',
    _id: 'book-id',
    name: 'Clean Code',
    types: [BookType.PHYSICAL],
    stockCount: 5,
  };

  const mockBorrower = {
    id: 'borrower-id',
    _id: 'borrower-id',
    name: 'John Doe',
  };

  const mockLoan = {
    id: 'loan-id',
    _id: 'loan-id',
    book: 'book-id',
    borrower: 'borrower-id',
    loanDate: new Date(),
    status: StatusEnum.LENT,
  };

  const mockBookLoanRepository = {
    create: jest.fn(),
    findOne: jest.fn(),
    findOneAndUpdate: jest.fn(),
    findAllWithPaginated: jest.fn(),
    remove: jest.fn(),
  };

  const mockBooksService = {
    findOne: jest.fn(),
    lentBook: jest.fn(),
    returnBook: jest.fn(),
  };

  const mockBorrowersService = {
    findOne: jest.fn(),
    findByUserId: jest.fn(),
  };

  beforeEach(async () => {
    jest.clearAllMocks();
    
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        LoansService,
        {
          provide: BookLoanRepository,
          useValue: mockBookLoanRepository,
        },
        {
          provide: BooksService,
          useValue: mockBooksService,
        },
        {
          provide: BorrowersService,
          useValue: mockBorrowersService,
        },
      ],
    }).compile();

    service = module.get<LoansService>(LoansService);
    bookLoanRepository = module.get<BookLoanRepository>(BookLoanRepository);
    booksService = module.get<BooksService>(BooksService);
    borrowersService = module.get<BorrowersService>(BorrowersService);
  });

  describe('createLoan', () => {
    it('should create a loan for a physical book', async () => {
      const createLoanDto = {
        borrowerId: 'borrower-id',
        bookId: 'book-id',
      };

      mockBorrowersService.findOne.mockResolvedValue(mockBorrower);
      mockBooksService.findOne.mockResolvedValue(mockBook);
      mockBookLoanRepository.create.mockResolvedValue(mockLoan);
      mockBooksService.lentBook.mockResolvedValue({ ...mockBook, stockCount: 4 });

      const result = await service.createLoan(createLoanDto);
      
      expect(mockBorrowersService.findOne).toHaveBeenCalledWith(createLoanDto.borrowerId);
      expect(mockBooksService.findOne).toHaveBeenCalledWith(createLoanDto.bookId);
      expect(mockBookLoanRepository.create).toHaveBeenCalledWith({
        borrower: mockBorrower._id,
        book: mockBook._id,
        status: StatusEnum.LENT,
        loanDate: expect.any(Date),
      });
      expect(mockBooksService.lentBook).toHaveBeenCalledWith(createLoanDto.bookId);
      expect(result).toEqual(mockLoan);
    });

    it('should throw BadRequestException if trying to borrow a digital-only book', async () => {
      const createLoanDto = {
        borrowerId: 'borrower-id',
        bookId: 'book-id',
      };

      mockBorrowersService.findOne.mockResolvedValue(mockBorrower);
      mockBooksService.findOne.mockResolvedValue({
        ...mockBook,
        types: [BookType.DIGITAL],
      });

      await expect(service.createLoan(createLoanDto)).rejects.toThrow(
        BadRequestException,
      );
      expect(mockBookLoanRepository.create).not.toHaveBeenCalled();
    });

    it('should throw BadRequestException if book is out of stock', async () => {
      const createLoanDto = {
        borrowerId: 'borrower-id',
        bookId: 'book-id',
      };

      mockBorrowersService.findOne.mockResolvedValue(mockBorrower);
      mockBooksService.findOne.mockResolvedValue({
        ...mockBook,
        stockCount: 0,
      });

      await expect(service.createLoan(createLoanDto)).rejects.toThrow(
        BadRequestException,
      );
      expect(mockBookLoanRepository.create).not.toHaveBeenCalled();
    });
  });

  describe('returnBook', () => {
    it('should mark a loan as returned', async () => {
      mockBookLoanRepository.findOne.mockResolvedValue(mockLoan);
      mockBookLoanRepository.findOneAndUpdate.mockResolvedValue({
        ...mockLoan,
        status: StatusEnum.RETURNED,
        returnDate: expect.any(Date),
      });
      mockBooksService.returnBook.mockResolvedValue({
        ...mockBook,
        stockCount: 6,
      });

      const result = await service.returnBook('loan-id');
      
      expect(mockBookLoanRepository.findOneAndUpdate).toHaveBeenCalledWith(
        { _id: 'loan-id' },
        {
          status: StatusEnum.RETURNED,
          returnDate: expect.any(Date),
        },
      );
      expect(mockBooksService.returnBook).toHaveBeenCalledWith(mockLoan.book);
      expect(result).toEqual({
        message: 'Successfully returned book',
      });
    });
  });

  describe('recallBook', () => {
    it('should allow librarians to recall a book', async () => {
      const librarian = { role: UserRole.LIBRARIAN };
      
      mockBookLoanRepository.findOne.mockResolvedValue(mockLoan);
      mockBookLoanRepository.findOneAndUpdate.mockResolvedValue({
        ...mockLoan,
        status: StatusEnum.RETURNED,
        returnDate: expect.any(Date),
      });
      mockBooksService.returnBook.mockResolvedValue({
        ...mockBook,
        stockCount: 6,
      });

      const result = await service.recallBook('loan-id', librarian);
      
      expect(mockBookLoanRepository.findOneAndUpdate).toHaveBeenCalledWith(
        { _id: 'loan-id' },
        {
          status: StatusEnum.RETURNED,
          returnDate: expect.any(Date),
        },
      );
      expect(mockBooksService.returnBook).toHaveBeenCalledWith(mockLoan.book);
      expect(result).toEqual({
        message: 'Successfully recalled book',
      });
    });

    it('should throw ForbiddenException if user is not a librarian', async () => {
      const reader = { role: UserRole.READER };

      await expect(service.recallBook('loan-id', reader)).rejects.toThrow(
        ForbiddenException,
      );
    });

    it('should throw BadRequestException if loan is not active', async () => {
      const librarian = { role: UserRole.LIBRARIAN };
      
      mockBookLoanRepository.findOne.mockResolvedValue({
        ...mockLoan,
        status: StatusEnum.RETURNED,
      });

      await expect(service.recallBook('loan-id', librarian)).rejects.toThrow(
        BadRequestException,
      );
    });
  });

  describe('getLoanHistoryForUser', () => {
    it('should return loan history for a user', async () => {
      const userId = 'user-id';
      const queryParams = { page: 1, pageSize: 10 };
      const paginatedResult = {
        data: [mockLoan],
        totalItems: 1,
        page: 1,
      };
      
      mockBorrowersService.findByUserId.mockResolvedValue(mockBorrower);
      mockBookLoanRepository.findAllWithPaginated.mockResolvedValue(paginatedResult);

      const result = await service.getLoanHistoryForUser(userId, queryParams);
      
      expect(mockBorrowersService.findByUserId).toHaveBeenCalledWith(userId);
      expect(mockBookLoanRepository.findAllWithPaginated).toHaveBeenCalledWith(
        queryParams,
        { borrower: mockBorrower._id },
      );
      expect(result).toEqual(paginatedResult);
    });

    it('should throw NotFoundException if no borrower profile found for user', async () => {
      const userId = 'user-id';
      const queryParams = { page: 1, pageSize: 10 };
      
      mockBorrowersService.findByUserId.mockResolvedValue(null);

      await expect(
        service.getLoanHistoryForUser(userId, queryParams)
      ).rejects.toThrow(NotFoundException);
    });
  });
});