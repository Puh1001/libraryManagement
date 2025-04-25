import {
  BadRequestException,
  Injectable,
  ForbiddenException,
  NotFoundException,
} from '@nestjs/common';
import { PaginatedParamsDto } from '../../../common/dto/paginated-query.dto';
import { BooksService } from '../../books/services/books.service';
import { BorrowersService } from '../../borrowers/services/borrowers.service';
import { CreateLoanDto, StatusEnum } from '../dto/create-loan.dto';
import { BookLoanRepository } from '../repository/loan.repository';
import { UserRole } from '../../users/schemas/user.schemas';
import { BorrowerRepository } from '../../borrowers/repositories/borrower.repository';
import { BookType } from '../../books/schemas/book.schema';

/**
 * Loans Service
 *
 * Manages the business logic for book loan operations including:
 * - Creating new loans (checking out books)
 * - Returning books
 * - Recalling books by librarians
 * - Querying loan history
 * - Managing loan status transitions
 */
@Injectable()
export class LoansService {
  /**
   * Creates an instance of LoansService
   *
   * @param bookLoanRepository - Repository for loan data operations
   * @param bookService - Service for book-related operations
   * @param borrowerService - Service for borrower-related operations
   */
  constructor(
    private readonly bookLoanRepository: BookLoanRepository,
    private readonly bookService: BooksService,
    private readonly borrowerService: BorrowersService,
  ) {}

  /**
   * Creates a new loan (checks out a book to a borrower)
   *
   * @param CreateLoanDto - Contains borrowerId and bookId for the loan
   * @throws BadRequestException - When book is not physical or out of stock
   * @returns The newly created loan record
   */
  async createLoan({ borrowerId, bookId }: CreateLoanDto) {
    // Fetch both borrower and book information in parallel
    const [borrower, book] = await Promise.all([
      this.borrowerService.findOne(borrowerId),
      this.bookService.findOne(bookId),
    ]);

    // Validate book is a physical copy that can be borrowed
    if (!book.types.includes(BookType.PHYSICAL)) {
      throw new BadRequestException('Only physical books can be borrowed');
    }

    // Check book availability in inventory
    if (book.stockCount < 1) {
      throw new BadRequestException('Book out of stock.');
    }

    // Create the loan record with initial LENT status
    const result = await this.bookLoanRepository.create({
      borrower: borrower._id,
      book: book._id,
      status: StatusEnum.LENT,
      loanDate: new Date(),
    } as any);

    // Update book inventory count
    await this.bookService.lentBook(bookId);
    return result;
  }

  /**
   * Retrieves all loans with pagination
   *
   * @param queryParams - Pagination parameters (page, pageSize)
   * @returns Paginated list of all loans
   */
  findAll(queryParams: PaginatedParamsDto) {
    return this.bookLoanRepository.findAllWithPaginated(queryParams);
  }

  /**
   * Finds all loans for a specific borrower
   *
   * @param borrowerId - ID of the borrower
   * @param queryParams - Pagination parameters
   * @returns Paginated list of loans for the specified borrower
   */
  findByBorrower(borrowerId: string, queryParams: PaginatedParamsDto) {
    return this.bookLoanRepository.findAllWithPaginated(queryParams, {
      borrower: borrowerId,
    });
  }

  /**
   * Finds a specific loan by its ID
   *
   * @param id - Loan ID to search for
   * @returns The loan record if found
   * @throws NotFoundException - When loan with given ID doesn't exist
   */
  findOne(id: string) {
    return this.bookLoanRepository.findOne({ _id: id });
  }

  /**
   * Gets loan history for a specific user
   *
   * @param userId - User ID to get loan history for
   * @param queryParams - Pagination parameters
   * @returns Paginated list of user's loan history
   * @throws NotFoundException - When no borrower profile exists for the user
   */
  async getLoanHistoryForUser(userId: string, queryParams: PaginatedParamsDto) {
    // Find the borrower profile linked to this user account
    const borrower = await this.borrowerService.findByUserId(userId);
    if (!borrower) {
      throw new NotFoundException('No borrower profile found for this user');
    }

    // Get loans for this borrower
    return this.findByBorrower(borrower._id as string, queryParams);
  }

  /**
   * Removes a loan record completely and returns the book to inventory
   *
   * @param id - ID of the loan to remove
   * @returns Confirmation message of successful deletion
   */
  async remove(id: string) {
    // Get loan details first to identify the book
    const loans = await this.findOne(id);

    // Remove the loan and return the book in parallel
    await Promise.all([
      this.bookLoanRepository.remove({ _id: loans._id }),
      this.bookService.returnBook(loans.book),
    ]);
    return {
      message: 'Successfully deleted loan book',
    };
  }

  /**
   * Processes a book return by a borrower
   *
   * @param id - ID of the loan to mark as returned
   * @returns Confirmation message of successful return
   */
  async returnBook(id: string) {
    // Get loan details first to identify the book
    const loans = await this.findOne(id);

    // Update loan status to RETURNED and return book to inventory
    await Promise.all([
      this.bookLoanRepository.findOneAndUpdate(
        { _id: id },
        {
          status: StatusEnum.RETURNED,
          returnDate: new Date(),
        },
      ),
      this.bookService.returnBook(loans.book),
    ]);
    return {
      message: 'Successfully returned book',
    };
  }

  /**
   * Allows a librarian to recall a book (mark it as returned)
   *
   * @param id - ID of the loan to recall
   * @param user - User performing the action (must be a librarian)
   * @returns Confirmation message of successful recall
   * @throws ForbiddenException - When user is not a librarian
   * @throws BadRequestException - When loan is not in LENT status
   */
  async recallBook(id: string, user) {
    // Verify user is a librarian
    if (user.role !== UserRole.LIBRARIAN) {
      throw new ForbiddenException('Only librarians can recall books');
    }

    // Verify loan is active (status is LENT)
    const loans = await this.findOne(id);
    if (loans.status !== StatusEnum.LENT) {
      throw new BadRequestException('Only active loans can be recalled');
    }

    // Update loan status to RETURNED and return book to inventory
    await Promise.all([
      this.bookLoanRepository.findOneAndUpdate(
        { _id: id },
        {
          status: StatusEnum.RETURNED,
          returnDate: new Date(),
        },
      ),
      this.bookService.returnBook(loans.book),
    ]);
    return {
      message: 'Successfully recalled book',
    };
  }
}
