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

@Controller('api/v1/borrowers')
export class BorrowersController {
  constructor(private readonly borrowersService: BorrowersService) {}

  @Post()
  create(@Body() createBorrowerDto: CreateBorrowerDto) {
    return this.borrowersService.create(createBorrowerDto);
  }

  @Get()
  findAll(@Query() queryParams) {
    return this.borrowersService.findAll(queryParams);
  }

  @Get(':id')
  findOne(@Param('id', ObjectIdValidationPipe) id: string) {
    return this.borrowersService.findOne(id);
  }

  @Patch(':id')
  update(
    @Param('id', ObjectIdValidationPipe) id: string,
    @Body() updateBorrowerDto: UpdateBorrowerDto,
  ) {
    return this.borrowersService.update(id, updateBorrowerDto);
  }

  @Delete(':id')
  remove(@Param('id', ObjectIdValidationPipe) id: string) {
    return this.borrowersService.remove(id);
  }
}
