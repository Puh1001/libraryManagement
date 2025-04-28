import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { BooksModule } from '../books/books.module';
import { BorrowersModule } from '../borrowers/borrowers.module';
import { LoansController } from './controllers/loan.controller';
import { BookLoanRepository } from './repository/loan.repository';
import { BookLoan, BookLoanSchema } from './schemas/loan.schema';
import { LoansService } from './services/loan.service';

@Module({
  imports: [
    BorrowersModule,
    BooksModule,
    MongooseModule.forFeature([
      {
        name: BookLoan.name,
        schema: BookLoanSchema,
      },
    ]),
  ],
  controllers: [LoansController],
  providers: [LoansService, BookLoanRepository],
})
export class LoansModule {}
