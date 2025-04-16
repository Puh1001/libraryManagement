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
} from '@nestjs/swagger';
import JwtAuthenticationGuard from '../authentication/guards/jwt.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/role.decorator';
import { CreateLoanDto } from './dto/create-loan.dto';
import { LoansService } from './loan.service';
import { UserRole } from '../users/schemas/user.schemas';
import { CurrentUser } from 'src/common/decorators/current-user.decorator';

@ApiTags('Loans')
@Controller('api/v1/book-loans')
export class LoansController {
  constructor(private readonly loansService: LoansService) {}

  @Post()
  @UseGuards(JwtAuthenticationGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create a new loan' })
  @ApiResponse({ status: 201, description: 'Loan created successfully.' })
  createLoan(@Body() createLoanDto: CreateLoanDto) {
    return this.loansService.createLoan(createLoanDto);
  }

  @Get()
  @UseGuards(JwtAuthenticationGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get all loans' })
  findAll(@Query() queryParams) {
    return this.loansService.findAll(queryParams);
  }

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

  @Get(':id')
  @UseGuards(JwtAuthenticationGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get a loan by ID' })
  findOne(@Param('id') id: string) {
    return this.loansService.findOne(id);
  }

  @Patch(':id/return')
  @UseGuards(JwtAuthenticationGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Return a book' })
  returnBook(@Param('id') id: string) {
    return this.loansService.returnBook(id);
  }

  @Patch(':id/recall')
  @UseGuards(JwtAuthenticationGuard, RolesGuard)
  @Roles(UserRole.LIBRARIAN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Recall a book (librarians only)' })
  recallBook(@Param('id') id: string, @CurrentUser() user) {
    return this.loansService.recallBook(id, user);
  }

  @Delete(':id')
  @UseGuards(JwtAuthenticationGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Delete a loan' })
  remove(@Param('id') id: string) {
    return this.loansService.remove(id);
  }
}
