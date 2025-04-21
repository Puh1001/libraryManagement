import { Module } from '@nestjs/common';
import { BooksService } from './services/books.service';
import { BooksController } from './controllers/books.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { Book, BookSchema } from './schemas/book.schema';
import { Author, AuthorSchema } from './schemas/author.schema';
import { BookRepository } from './repositories/book.repository';
import { AuthorRepository } from './repositories/author.repository';
import { DigitalBookController } from './digital-book/digital-book.controller';
import { AuthorController } from './controllers/author.controller';
import { AuthorService } from './services/author.service';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Book.name, schema: BookSchema },
      { name: Author.name, schema: AuthorSchema },
    ]),
  ],
  controllers: [BooksController, DigitalBookController, AuthorController],
  providers: [BooksService, AuthorService, BookRepository, AuthorRepository],
  exports: [BooksService],
})
export class BooksModule {}
