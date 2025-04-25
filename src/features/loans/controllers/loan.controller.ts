import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiParam,
} from '@nestjs/swagger';
import JwtAuthenticationGuard from '../../authentication/guards/jwt.guard';
import { RolesGuard } from '../../../common/guards/roles.guard';
import { Roles } from '../../../common/decorators/role.decorator';
import { CreateLoanDto } from '../dto/create-loan.dto';
import { LoansService } from '../services/loan.service';
import { UserDocument, UserRole } from '../../users/schemas/user.schemas';
import { CurrentUser } from '../../../common/decorators/current-user.decorator';
import { BorrowersService } from '../../borrowers/services/borrowers.service';
import { PaginatedParamsDto } from '../../../common/dto/paginated-query.dto';

/**
 * Controller responsible for managing book loan operations in the library system.
 * Provides endpoints for creating, retrieving, updating, and deleting loan records,
 * as well as specialized operations like borrowing books, returning books, and recalling loans.
 */
@ApiTags('Loans')
@Controller('api/v1/book-loans')
export class LoansController {
  constructor(
    private readonly loansService: LoansService,
    private readonly borrowerService: BorrowersService,
  ) {}

  /**
   * Creates a new book loan record in the system.
   * @param createLoanDto - Data transfer object containing loan information (borrower ID, book ID, etc.)
   * @returns The newly created loan record
   */
  @Post()
  @UseGuards(JwtAuthenticationGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create a new loan' })
  @ApiResponse({ status: 201, description: 'Loan created successfully.' })
  createLoan(@Body() createLoanDto: CreateLoanDto) {
    return this.loansService.createLoan(createLoanDto);
  }

  /**
   * Retrieves all loan records with optional filtering via query parameters.
   * @param queryParams - Optional parameters for filtering, pagination, and sorting
   * @returns A collection of loan records, potentially paginated
   */
  @Get()
  @UseGuards(JwtAuthenticationGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get all loans' })
  findAll(@Query() queryParams) {
    return this.loansService.findAll(queryParams);
  }

  /**
   * Retrieves all loans associated with a specific borrower.
   * @param borrowerId - The unique identifier of the borrower
   * @param queryParams - Optional parameters for filtering, pagination, and sorting
   * @returns A collection of loan records for the specified borrower
   */
  @Get('borrower/:borrowerId')
  @UseGuards(JwtAuthenticationGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get loans by borrower' })
  findByBorrower(
    @Param('borrowerId') borrowerId: string,
    @Query() queryParams,
  ) {
    return this.loansService.findByBorrower(borrowerId, queryParams);
  }

  /**
   * Retrieves a specific loan record by its ID.
   * @param id - The unique identifier of the loan
   * @returns The loan record if found
   */
  @Get(':id')
  @UseGuards(JwtAuthenticationGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get a loan by ID' })
  findOne(@Param('id') id: string) {
    return this.loansService.findOne(id);
  }

  /**
   * Processes the return of a borrowed book, updating the loan record accordingly.
   * @param id - The unique identifier of the loan to be marked as returned
   * @returns The updated loan record with return information
   */
  @Patch(':id/return')
  @UseGuards(JwtAuthenticationGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Return a book' })
  returnBook(@Param('id') id: string) {
    return this.loansService.returnBook(id);
  }

  /**
   * Initiates a recall for a borrowed book, requesting early return.
   * Only accessible by users with librarian role.
   * @param id - The unique identifier of the loan to recall
   * @param user - The current authenticated user initiating the recall
   * @returns The updated loan record with recall information
   */
  @Patch(':id/recall')
  @UseGuards(JwtAuthenticationGuard, RolesGuard)
  @Roles(UserRole.LIBRARIAN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Recall a book (librarians only)' })
  recallBook(@Param('id') id: string, @CurrentUser() user) {
    return this.loansService.recallBook(id, user);
  }

  /**
   * Removes a loan record from the system.
   * @param id - The unique identifier of the loan to be deleted
   * @returns Information about the deletion operation
   */
  @Delete(':id')
  @UseGuards(JwtAuthenticationGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Delete a loan' })
  remove(@Param('id') id: string) {
    return this.loansService.remove(id);
  }

  /**
   * Retrieves the loan history for a specific user.
   * @param userId - The unique identifier of the user
   * @param queryParams - Parameters for pagination and filtering of the results
   * @returns Paginated collection of the user's loan history
   */
  @Get('user/:userId/history')
  @UseGuards(JwtAuthenticationGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get loan history for user' })
  getLoanHistoryForUser(
    @Param('userId') userId: string,
    @Query() queryParams: PaginatedParamsDto,
  ) {
    return this.loansService.getLoanHistoryForUser(userId, queryParams);
  }

  /**
   * Allows the currently authenticated user to borrow a specific book.
   * Automatically creates/uses a borrower profile for the user.
   * @param bookId - The unique identifier of the book to borrow
   * @param user - The currently authenticated user who is borrowing the book
   * @returns The newly created loan record
   * @throws {NotFoundException} If the book is not found or not available
   */
  @Post('borrow/:bookId')
  @UseGuards(JwtAuthenticationGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Borrow a book as logged in user' })
  @ApiParam({ name: 'bookId', description: 'ID of the book to borrow' })
  @ApiResponse({ status: 201, description: 'Book borrowed successfully' })
  @ApiResponse({ status: 404, description: 'Book not found or unavailable' })
  async borrowBook(
    @Param('bookId') bookId: string,
    @CurrentUser() user: UserDocument,
  ) {
    let borrower = await this.borrowerService.findByUserId(user.id);

    if (!borrower) {
      borrower = await this.borrowerService.registerUserAsBorrower(user);
    }

    return this.loansService.createLoan({
      borrowerId: borrower.id,
      bookId,
    });
  }

  /**
   * Retrieves all loans for the currently authenticated user.
   * @param user - The currently authenticated user
   * @param queryParams - Parameters for pagination and filtering of the results
   * @returns Paginated collection of the user's loans
   */
  @Get('my-loans')
  @UseGuards(JwtAuthenticationGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: "Get current user's loans" })
  @ApiResponse({ status: 200, description: "List of user's loans" })
  async getMyLoans(
    @CurrentUser() user: UserDocument,
    @Query() queryParams: PaginatedParamsDto,
  ) {
    return this.loansService.getLoanHistoryForUser(user.id, queryParams);
  }
}
