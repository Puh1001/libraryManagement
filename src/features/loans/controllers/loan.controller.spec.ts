import { Test, TestingModule } from '@nestjs/testing';
import { LoansController } from './loan.controller';
import { LoansService } from '../services/loan.service';
import { BorrowersService } from '../../borrowers/services/borrowers.service';
import { UserDocument } from '../../users/schemas/user.schemas';

describe('LoansController', () => {
  let controller: LoansController;
  let loansService: LoansService;
  let borrowersService: BorrowersService;

  const mockLoansService = {
    createLoan: jest.fn(),
    findAll: jest.fn(),
    findByBorrower: jest.fn(),
    findOne: jest.fn(),
    returnBook: jest.fn(),
    getLoanHistoryForUser: jest.fn(),
  };

  const mockBorrowersService = {
    findByUserId: jest.fn(),
    registerUserAsBorrower: jest.fn(),
  };

  beforeEach(async () => {
    /**
     * Creates and configures a NestJS testing module for the LoansController.
     * This test setup provides mock implementations for both LoansService and BorrowersService,
     * allowing isolated testing of the controller's functionality without actual
     * service dependencies. The mock services are injected through the NestJS dependency
     * injection container to replace real implementations during testing.
     */
    const module: TestingModule = await Test.createTestingModule({
      controllers: [LoansController],
      providers: [
        {
          provide: LoansService,
          useValue: mockLoansService,
        },
        {
          provide: BorrowersService,
          useValue: mockBorrowersService,
        },
      ],
    }).compile();

    controller = module.get<LoansController>(LoansController);
    loansService = module.get<LoansService>(LoansService);
    borrowersService = module.get<BorrowersService>(BorrowersService);
  });

  describe('borrowBook', () => {
    it('should allow an authenticated user to borrow a book', async () => {
      const mockUser = {
        id: 'user-id',
        name: 'Test User',
      } as UserDocument;

      const mockBorrower = {
        id: 'borrower-id',
        name: 'Test User',
        user: 'user-id',
      };

      const bookId = 'book-id';
      const mockLoan = {
        id: 'loan-id',
        book: bookId,
        borrower: mockBorrower.id,
        loanDate: new Date(),
        status: 'LENT',
      };

      mockBorrowersService.findByUserId.mockResolvedValue(mockBorrower);
      mockLoansService.createLoan.mockResolvedValue(mockLoan);

      const result = await controller.borrowBook(bookId, mockUser);

      expect(mockBorrowersService.findByUserId).toHaveBeenCalledWith(
        mockUser.id,
      );
      expect(mockLoansService.createLoan).toHaveBeenCalledWith({
        borrowerId: mockBorrower.id,
        bookId: bookId,
      });
      expect(result).toEqual(mockLoan);
    });

    it('should register a new borrower if user has no borrower profile', async () => {
      const mockUser = {
        id: 'user-id',
        name: 'Test User',
      } as UserDocument;

      const mockBorrower = {
        id: 'borrower-id',
        name: 'Test User',
        user: 'user-id',
      };

      const bookId = 'book-id';
      const mockLoan = {
        id: 'loan-id',
        book: bookId,
        borrower: mockBorrower.id,
        loanDate: new Date(),
        status: 'LENT',
      };

      mockBorrowersService.findByUserId.mockResolvedValue(null);
      mockBorrowersService.registerUserAsBorrower.mockResolvedValue(
        mockBorrower,
      );
      mockLoansService.createLoan.mockResolvedValue(mockLoan);

      const result = await controller.borrowBook(bookId, mockUser);

      expect(mockBorrowersService.findByUserId).toHaveBeenCalledWith(
        mockUser.id,
      );
      expect(mockBorrowersService.registerUserAsBorrower).toHaveBeenCalledWith(
        mockUser,
      );
      expect(mockLoansService.createLoan).toHaveBeenCalledWith({
        borrowerId: mockBorrower.id,
        bookId: bookId,
      });
      expect(result).toEqual(mockLoan);
    });
  });
});
