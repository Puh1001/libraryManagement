import { ApiProperty } from '@nestjs/swagger';

export class PaginatedParamsDto {
  @ApiProperty({ description: 'Page number', example: 1, required: false })
  page?: number = 1;

  @ApiProperty({
    description: 'Number of items per page',
    example: 10,
    required: false,
  })
  pageSize?: number = 10;

  @ApiProperty({
    description: 'Search query',
    example: 'keyword',
    required: false,
  })
  query?: string = '';
}
