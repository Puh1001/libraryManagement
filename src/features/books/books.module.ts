import { Module } from '@nestjs/common';
import { BooksService } from './books.service';
import { BooksController } from './books.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { Book, BookSchema } from './schemas/book.schema';
import { Author, AuthorSchema } from './schemas/author.schema';
import { BookRepository } from './repositories/book.repository';
import { AuthorRepository } from './repositories/author.repository';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Book.name, schema: BookSchema },
      { name: Author.name, schema: AuthorSchema },
    ]),
  ],
  controllers: [BooksController],
  providers: [BooksService, BookRepository, AuthorRepository],
  exports: [BooksService],
})
export class BooksModule {}
