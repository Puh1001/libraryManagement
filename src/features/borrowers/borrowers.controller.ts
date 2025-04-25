import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
} from '@nestjs/common';

import { CreateBorrowerDto } from './dto/create-borrower.dto';
import { UpdateBorrowerDto } from './dto/update-borrower.dto';
import { BorrowersService } from './services/borrowers.service';
import { ObjectIdValidationPipe } from 'src/common/pipes/object-id-validation/object-id-validation.pipe';

/**
 * Controller responsible for handling borrower-related HTTP requests
 * Provides CRUD operations for borrower management in the library system
 */
@Controller('api/v1/borrowers')
export class BorrowersController {
  constructor(private readonly borrowersService: BorrowersService) {}

  /**
   * Creates a new borrower record in the system
   * @param createBorrowerDto - The DTO containing borrower information for creation
   * @returns The newly created borrower entity
   */
  @Post()
  create(@Body() createBorrowerDto: CreateBorrowerDto) {
    return this.borrowersService.create(createBorrowerDto);
  }

  /**
   * Retrieves all borrowers from the system with optional filtering
   * @param queryParams - Query parameters for filtering, pagination, or sorting
   * @returns An array of borrower entities matching the criteria
   */
  @Get()
  findAll(@Query() queryParams) {
    return this.borrowersService.findAll(queryParams);
  }

  /**
   * Retrieves a specific borrower by their unique identifier
   * @param id - The unique identifier of the borrower
   * @returns The borrower entity if found
   */
  @Get(':id')
  findOne(@Param('id', ObjectIdValidationPipe) id: string) {
    return this.borrowersService.findOne(id);
  }

  /**
   * Updates a borrower's information based on the provided data
   * @param id - The unique identifier of the borrower to update
   * @param updateBorrowerDto - The DTO containing the fields to update
   * @returns The updated borrower entity
   */
  @Patch(':id')
  update(
    @Param('id', ObjectIdValidationPipe) id: string,
    @Body() updateBorrowerDto: UpdateBorrowerDto,
  ) {
    return this.borrowersService.update(id, updateBorrowerDto);
  }

  /**
   * Removes a borrower from the system
   * @param id - The unique identifier of the borrower to delete
   * @returns The result of the deletion operation
   */
  @Delete(':id')
  remove(@Param('id', ObjectIdValidationPipe) id: string) {
    return this.borrowersService.remove(id);
  }
}
