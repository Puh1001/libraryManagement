import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { BorrowersController } from './borrowers.controller';
import { BorrowerRepository } from './repositories/borrower.repository';
import { Borrower, BorrowerSchema } from './schemas/borrower.schema';
import { BorrowersService } from './services/borrowers.service';

@Module({
  imports: [
    MongooseModule.forFeature([
      {
        name: Borrower.name,
        schema: BorrowerSchema,
      },
    ]),
  ],
  controllers: [BorrowersController],
  providers: [BorrowersService, BorrowerRepository],
  exports: [BorrowersService],
})
export class BorrowersModule {}
