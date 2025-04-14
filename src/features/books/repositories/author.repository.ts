import { Injectable, Logger } from '@nestjs/common';
import { InjectConnection, InjectModel } from '@nestjs/mongoose';
import { Connection, Model } from 'mongoose';
import { AbstractRepository } from 'src/features/db/abstract.repository';
import { Author, AuthorDocument } from '../schemas/author.schema';

@Injectable()
export class AuthorRepository extends AbstractRepository<AuthorDocument> {
  protected readonly logger = new Logger(AuthorRepository.name);

  constructor(
    @InjectModel(Author.name) orderModel: Model<AuthorDocument>,
    @InjectConnection() connection: Connection,
  ) {
    super(orderModel, connection);
  }
}
