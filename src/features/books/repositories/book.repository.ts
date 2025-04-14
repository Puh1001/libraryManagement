import { Injectable, Logger } from '@nestjs/common';
import { InjectConnection, InjectModel } from '@nestjs/mongoose';
import { Connection, Model } from 'mongoose';
import { AbstractRepository } from 'src/features/db/abstract.repository';
import { Book, BookDocument } from '../schemas/book.schema';

@Injectable()
export class BookRepository extends AbstractRepository<BookDocument> {
  protected readonly logger = new Logger(BookRepository.name);

  constructor(
    @InjectModel(Book.name) orderModel: Model<BookDocument>,
    @InjectConnection() connection: Connection,
  ) {
    super(orderModel, connection);
  }
}
