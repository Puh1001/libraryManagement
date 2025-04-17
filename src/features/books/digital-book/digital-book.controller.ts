// src/features/book/controllers/digital-book.controller.ts
import {
  Controller,
  Get,
  Param,
  Res,
  StreamableFile,
  NotFoundException,
  UseGuards,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiParam,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { Response } from 'express';
import { createReadStream } from 'fs';
import { join } from 'path';
import JwtAuthenticationGuard from '../../authentication/guards/jwt.guard';
import { BookService } from '../services/book.service';
import { BookType } from '../schemas/book.schema';

@ApiTags('Digital Books')
@Controller('api/v1/digital-books')
export class DigitalBookController {
  constructor(private readonly bookService: BookService) {}

  @Get(':id/view')
  @UseGuards(JwtAuthenticationGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'View a digital book online' })
  @ApiParam({ name: 'id', description: 'Book ID' })
  async viewBook(
    @Param('id') id: string,
    @Res({ passthrough: true }) res: Response,
  ) {
    const book = await this.bookService.findOne(id);

    if (book.type !== BookType.DIGITAL || !book.fileUrl) {
      throw new NotFoundException('Digital book file not found');
    }

    // Path là đường dẫn tương đối đến file
    const file = createReadStream(join(process.cwd(), book.fileUrl));

    // Set Content-Type dựa vào định dạng file
    // Ví dụ: nếu file là PDF
    res.set({
      'Content-Type': 'application/pdf',
      'Content-Disposition': `inline; filename="${book.name.replace(/\s+/g, '_')}.pdf"`,
    });

    return new StreamableFile(file);
  }
}
