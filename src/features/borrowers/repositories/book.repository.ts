import { Injectable, Logger } from '@nestjs/common';
import { InjectConnection, InjectModel } from '@nestjs/mongoose';
import { Connection, Model } from 'mongoose';
import { AbstractRepository } from 'src/features/db/abstract.repository';
import { Borrower, BorrowerDocument } from '../schemas/borrower.schema';

@Injectable()
export class BorrowerRepository extends AbstractRepository<BorrowerDocument> {
  protected readonly logger = new Logger(BorrowerRepository.name);

  constructor(
    @InjectModel(Borrower.name) borrowerModel: Model<BorrowerDocument>,
    @InjectConnection() connection: Connection,
  ) {
    super(borrowerModel, connection);
  }
}
