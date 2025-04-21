import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Post,
  Query,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiConsumes,
  ApiBearerAuth,
  ApiParam,
  ApiBody,
} from '@nestjs/swagger';
import { diskStorage } from 'multer';
import { extname } from 'path';
import JwtAuthenticationGuard from '../../authentication/guards/jwt.guard';
import { RolesGuard } from 'src/common/guards/roles.guard';
import { Roles } from 'src/common/decorators/role.decorator';
import { UserRole } from '../../users/schemas/user.schemas';
import { CreateBookDto } from '../dto/create-book.dto';
import { UpdateBookDto } from '../dto/update-book.dto';
import { BooksService } from '../services/books.service';
import { UpdateBookTypesDto } from '../dto/update-book-types.dto';

@ApiTags('Books')
@Controller('api/v1/books')
export class BooksController {
  constructor(private readonly bookService: BooksService) {}

  @Post()
  @UseGuards(JwtAuthenticationGuard, RolesGuard)
  @Roles(UserRole.LIBRARIAN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create a new book (librarians only)' })
  create(@Body() createBookDto: CreateBookDto) {
    return this.bookService.create(createBookDto);
  }

  @Patch(':id/types')
  @UseGuards(JwtAuthenticationGuard, RolesGuard)
  @Roles(UserRole.LIBRARIAN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update book formats (physical/digital)' })
  @ApiParam({ name: 'id', description: 'Book ID' })
  updateBookTypes(
    @Param('id') id: string,
    @Body() updateTypesDto: UpdateBookTypesDto,
  ) {
    return this.bookService.updateBookTypes(id, updateTypesDto);
  }

  @Post(':id/cover')
  @UseGuards(JwtAuthenticationGuard, RolesGuard)
  @Roles(UserRole.LIBRARIAN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Upload book cover image (librarians only)' })
  @ApiParam({ name: 'id', description: 'Book ID' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: {
          type: 'string',
          format: 'binary',
          description: 'Book cover image (JPG, JPEG, PNG, GIF only)',
        },
      },
    },
  })
  @UseInterceptors(
    FileInterceptor('file', {
      storage: diskStorage({
        destination: './uploads/covers',
        filename: (req, file, cb) => {
          const randomName = Array(32)
            .fill(null)
            .map(() => Math.round(Math.random() * 16).toString(16))
            .join('');
          return cb(null, `${randomName}${extname(file.originalname)}`);
        },
      }),
      fileFilter: (req, file, cb) => {
        if (!file.originalname.match(/\.(jpg|jpeg|png|gif)$/)) {
          return cb(new Error('Only image files are allowed!'), false);
        }
        cb(null, true);
      },
    }),
  )
  async uploadCover(@Param('id') id: string, @UploadedFile() file) {
    return this.bookService.updateCoverImage(id, file.path);
  }

  @Post(':id/file')
  @UseGuards(JwtAuthenticationGuard, RolesGuard)
  @Roles(UserRole.LIBRARIAN)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Upload book file for digital books (librarians only)',
  })
  @ApiParam({ name: 'id', description: 'Book ID' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: {
          type: 'string',
          format: 'binary',
          description: 'Book file (PDF, EPUB, etc.)',
        },
      },
    },
  })
  @UseInterceptors(
    FileInterceptor('file', {
      storage: diskStorage({
        destination: './uploads/files',
        filename: (req, file, cb) => {
          const randomName = Array(32)
            .fill(null)
            .map(() => Math.round(Math.random() * 16).toString(16))
            .join('');
          return cb(null, `${randomName}${extname(file.originalname)}`);
        },
      }),
    }),
  )
  async uploadFile(@Param('id') id: string, @UploadedFile() file) {
    return this.bookService.updateBookFile(id, file.path);
  }

  @Get()
  findAll(@Query() queryParams) {
    return this.bookService.findAll(queryParams);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.bookService.findOne(id);
  }

  @Patch(':id')
  @UseGuards(JwtAuthenticationGuard, RolesGuard)
  @Roles(UserRole.LIBRARIAN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update a book (librarians only)' })
  update(@Param('id') id: string, @Body() updateBookDto: UpdateBookDto) {
    return this.bookService.update(id, updateBookDto);
  }

  @HttpCode(HttpStatus.NO_CONTENT)
  @Delete(':id')
  @UseGuards(JwtAuthenticationGuard, RolesGuard)
  @Roles(UserRole.LIBRARIAN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Delete a book (librarians only)' })
  remove(@Param('id') id: string) {
    return this.bookService.remove(id);
  }
}
