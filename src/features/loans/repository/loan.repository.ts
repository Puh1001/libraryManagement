import { Injectable, Logger } from '@nestjs/common';
import { InjectConnection, InjectModel } from '@nestjs/mongoose';
import { Connection, Model } from 'mongoose';
import { AbstractRepository } from '../../db/abstract.repository';
import { BookLoan, BookLoanDocument } from '../schemas/loan.schema';

@Injectable()
export class BookLoanRepository extends AbstractRepository<BookLoanDocument> {
  protected readonly logger = new Logger(BookLoanRepository.name);

  constructor(
    @InjectModel(BookLoan.name) bookLoan: Model<BookLoanDocument>,
    @InjectConnection() connection: Connection,
  ) {
    super(bookLoan, connection);
  }
}
