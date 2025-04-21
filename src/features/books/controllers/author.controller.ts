import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { ObjectIdValidationPipe } from 'src/common/pipes/object-id-validation/object-id-validation.pipe';
import { CreateAuthorDTO } from '../dto/author/create-author.dto';
import { UpdateAuthorDTO } from '../dto/author/update-author.dto';
import { AuthorService } from '../services/author.service';
import JwtAuthenticationGuard from '../../authentication/guards/jwt.guard';
import { RolesGuard } from 'src/common/guards/roles.guard';
import { Roles } from 'src/common/decorators/role.decorator';
import { UserRole } from '../../users/schemas/user.schemas';

@ApiTags('Authors')
@Controller('api/v1/authors')
export class AuthorController {
  constructor(private readonly authorService: AuthorService) {}

  @Post()
  @UseGuards(JwtAuthenticationGuard, RolesGuard)
  @Roles(UserRole.LIBRARIAN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create a new author (librarians only)' })
  @ApiResponse({ status: 201, description: 'Author created successfully' })
  createAuthor(@Body() createAuthorDTO: CreateAuthorDTO) {
    return this.authorService.createAuthor(createAuthorDTO);
  }

  @Get()
  @ApiOperation({ summary: 'Get all authors' })
  @ApiResponse({ status: 200, description: 'List of all authors' })
  getAuthors(@Query() queryParams) {
    return this.authorService.getAllAuthors(queryParams);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get author by ID' })
  @ApiResponse({ status: 200, description: 'Author details' })
  getAuthorById(@Param('id', ObjectIdValidationPipe) id: string) {
    return this.authorService.getAuthorById(id);
  }

  @Patch(':id')
  @UseGuards(JwtAuthenticationGuard, RolesGuard)
  @Roles(UserRole.LIBRARIAN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update an author (librarians only)' })
  @ApiResponse({ status: 200, description: 'Author updated successfully' })
  updateAuthor(
    @Param('id', ObjectIdValidationPipe) id: string,
    @Body() payload: UpdateAuthorDTO,
  ) {
    return this.authorService.updateAuthor(id, payload);
  }

  @Get(':id/books')
  @ApiOperation({ summary: 'Get books by an author' })
  @ApiResponse({ status: 200, description: 'List of books by the author' })
  getBooksOfAuthor(
    @Param('id', ObjectIdValidationPipe) id: string,
    @Query() queryParams,
  ) {
    return this.authorService.getBooksOfAuthor(id, queryParams);
  }
}
