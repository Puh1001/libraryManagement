import { Injectable, Logger } from '@nestjs/common';
import { InjectConnection, InjectModel } from '@nestjs/mongoose';
import { Connection, Model } from 'mongoose';
import { AbstractRepository } from 'src/features/db/abstract.repository';
import { User, UserDocument } from './schemas/user.schemas';

@Injectable()
export class UserRepository extends AbstractRepository<UserDocument> {
  protected readonly logger = new Logger(UserRepository.name);

  constructor(
    @InjectModel(User.name) orderModel: Model<UserDocument>,
    @InjectConnection() connection: Connection,
  ) {
    super(orderModel, connection);
  }
}
