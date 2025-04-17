import {
  BadRequestException,
  Injectable,
  ForbiddenException,
  NotFoundException,
} from '@nestjs/common';
import { PaginatedParamsDto } from 'src/common/dto/paginated-query.dto';
import { BooksService } from 'src/features/books/books.service';
import { BorrowersService } from 'src/features/borrowers/services/borrowers.service';
import { CreateLoanDto, StatusEnum } from './dto/create-loan.dto';
import { BookLoanRepository } from './repository/loan.repository';
import { UserRole } from 'src/features/users/schemas/user.schemas';

@Injectable()
export class LoansService {
  constructor(
    private readonly bookLoanRepository: BookLoanRepository,
    private readonly bookService: BooksService,
    private readonly borrowerService: BorrowersService,
  ) {}

  async createLoan({ borrowerId, bookId }: CreateLoanDto) {
    const [borrower, book] = await Promise.all([
      this.borrowerService.findOne(borrowerId),
      this.bookService.findOne(bookId),
    ]);
    if (book.stockCount < 1) {
      throw new BadRequestException('Book out of stock.');
    }
    const result = await this.bookLoanRepository.create({
      borrower: borrower._id,
      book: book._id,
      status: StatusEnum.LENT,
      loanDate: new Date(),
    } as any);
    await this.bookService.lentBook(bookId);
    return result;
  }

  findAll(queryParams: PaginatedParamsDto) {
    return this.bookLoanRepository.findAllWithPaginated(queryParams);
  }

  findByBorrower(borrowerId: string, queryParams: PaginatedParamsDto) {
    return this.bookLoanRepository.findAllWithPaginated(queryParams, {
      borrower: borrowerId,
    });
  }

  findOne(id: string) {
    return this.bookLoanRepository.findOne({ _id: id });
  }

  async getLoanHistoryForUser(userId: string, queryParams: PaginatedParamsDto) {
    const borrower = await this.borrowerRepository.findOne({ user: userId });
    if (!borrower) {
      throw new NotFoundException('No borrower profile found for this user');
    }

    return this.findByBorrower(borrower._id, queryParams);
  }

  async remove(id: string) {
    const loans = await this.findOne(id);
    await Promise.all([
      this.bookLoanRepository.remove({ _id: loans._id }),
      this.bookService.returnBook(loans.book),
    ]);
    return {
      message: 'Successfully deleted loan book',
    };
  }

  async returnBook(id: string) {
    const loans = await this.findOne(id);
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

  async recallBook(id: string, user) {
    // Verify user is a librarian
    if (user.role !== UserRole.LIBRARIAN) {
      throw new ForbiddenException('Only librarians can recall books');
    }

    const loans = await this.findOne(id);
    if (loans.status !== StatusEnum.LENT) {
      throw new BadRequestException('Only active loans can be recalled');
    }

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
