import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
} from '@nestjs/common';
import { ObjectIdValidationPipe } from 'src/common/pipes/object-id-validation/object-id-validation.pipe';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UsersService } from './users.service';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';

/**
 * Controller responsible for handling HTTP requests related to user management.
 * Provides RESTful API endpoints for CRUD operations on user resources.
 * Path prefix: 'api/v1/users'
 */
@ApiTags('Users')
@Controller('api/v1/users')
export class UsersController {
  /**
   * Injects the UsersService to handle business logic for user operations
   * @param usersService - Service containing user management methods
   */
  constructor(private readonly usersService: UsersService) {}

  /**
   * Handles POST requests to create a new user
   * Endpoint: POST /api/v1/users
   *
   * @param createUserDto - Data transfer object containing new user information
   * @returns The newly created user document
   */
  @Post()
  @ApiOperation({ summary: 'Create a new user' })
  @ApiResponse({ status: 201, description: 'User created successfully.' })
  @ApiResponse({ status: 400, description: 'Invalid input.' })
  create(@Body() createUserDto: CreateUserDto) {
    return this.usersService.create(createUserDto);
  }

  /**
   * Handles GET requests to retrieve all users
   * Endpoint: GET /api/v1/users
   *
   * @returns Array containing all user documents
   */
  @Get()
  @ApiOperation({ summary: 'Get all users' })
  @ApiResponse({ status: 200, description: 'List of users.' })
  findAll() {
    return this.usersService.findAll();
  }

  /**
   * Handles GET requests to retrieve a specific user by ID
   * Endpoint: GET /api/v1/users/:id
   *
   * @param id - MongoDB ObjectId of the user to retrieve (validated by pipe)
   * @returns User document if found
   */
  @Get(':id')
  @ApiOperation({ summary: 'Get a user by ID' })
  @ApiResponse({ status: 200, description: 'User found.' })
  @ApiResponse({ status: 404, description: 'User not found.' })
  findOne(@Param('id', ObjectIdValidationPipe) id: string) {
    return this.usersService.findOne(id);
  }

  /**
   * Handles PATCH requests to update a specific user by ID
   * Endpoint: PATCH /api/v1/users/:id
   *
   * @param id - MongoDB ObjectId of the user to update (validated by pipe)
   * @param updateUserDto - Data transfer object containing fields to update
   * @returns Updated user document
   */
  @Patch(':id')
  @ApiOperation({ summary: 'Update a user by ID' })
  @ApiResponse({ status: 200, description: 'User updated successfully.' })
  @ApiResponse({ status: 404, description: 'User not found.' })
  update(
    @Param('id', ObjectIdValidationPipe) id: string,
    @Body() updateUserDto: UpdateUserDto,
  ) {
    return this.usersService.update(id, updateUserDto);
  }

  /**
   * Handles DELETE requests to remove a specific user by ID
   * Endpoint: DELETE /api/v1/users/:id
   *
   * @param id - MongoDB ObjectId of the user to delete (validated by pipe)
   * @returns Object indicating success status
   */
  @Delete(':id')
  @ApiOperation({ summary: 'Delete a user by ID' })
  @ApiResponse({ status: 200, description: 'User deleted successfully.' })
  @ApiResponse({ status: 404, description: 'User not found.' })
  remove(@Param('id', ObjectIdValidationPipe) id: string) {
    return this.usersService.remove(id);
  }
}
