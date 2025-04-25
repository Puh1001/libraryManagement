import { Logger, NotFoundException } from '@nestjs/common';
import {
  Connection,
  Document,
  FilterQuery,
  Model,
  SaveOptions,
  Types,
  UpdateQuery,
} from 'mongoose';
import { PaginatedParamsDto } from 'src/common/dto/paginated-query.dto';

/**
 * Abstract Repository Class
 * Generic base repository for MongoDB document operations.
 * Provides common CRUD operations and pagination for MongoDB collections.
 */
export abstract class AbstractRepository<TDocument extends Document> {
  protected abstract readonly logger: Logger;

  /**
   * Constructor for AbstractRepository
   * @param model - Mongoose model for the document type
   * @param connection - MongoDB connection instance
   */
  constructor(
    protected readonly model: Model<TDocument>,
    private readonly connection: Connection,
  ) {}

  /**
   * Creates a new document in the database
   * @param document - Document data to create (without _id)
   * @param options - Optional save options for MongoDB
   * @returns Promise with the created document
   */
  async create(
    document: Omit<TDocument, '_id'>,
    options?: SaveOptions,
  ): Promise<TDocument> {
    const createdDocument = new this.model({
      ...document,
      _id: new Types.ObjectId(),
    });
    return (
      await createdDocument.save(options)
    ).toJSON() as unknown as TDocument;
  }

  /**
   * Finds a single document matching the filter criteria
   * @param filterQuery - Query conditions to match document
   * @param message - Custom error message if document not found
   * @throws NotFoundException if document not found
   * @returns Promise with the found document
   */
  async findOne(
    filterQuery: FilterQuery<TDocument>,
    message = 'Document not found.',
  ): Promise<TDocument> {
    const document = await this.model.findOne(filterQuery, {}, { lean: true });

    if (!document) {
      this.logger.warn('Document not found with filterQuery', filterQuery);
      throw new NotFoundException(message);
    }
    return document as TDocument;
  }

  /**
   * Finds a document by filter and updates it
   * @param filterQuery - Query conditions to match document
   * @param update - Update operations to apply
   * @throws NotFoundException if document not found
   * @returns Promise with the updated document
   */
  async findOneAndUpdate(
    filterQuery: FilterQuery<TDocument>,
    update: UpdateQuery<TDocument>,
  ) {
    const document = await this.model.findOneAndUpdate(filterQuery, update, {
      new: true,
    });

    if (!document) {
      this.logger.warn(`Document not found with filterQuery:`, filterQuery);
      throw new NotFoundException('Document not found.');
    }

    return document;
  }

  /**
   * Updates an existing document or creates it if not found (upsert)
   * @param filterQuery - Query conditions to match document
   * @param document - Document data to upsert
   * @returns Promise with the upserted document
   */
  async upsert(
    filterQuery: FilterQuery<TDocument>,
    document: Partial<TDocument>,
  ) {
    return this.model.findOneAndUpdate(filterQuery, document, {
      lean: true,
      upsert: true,
      new: true,
    }) as unknown as TDocument;
  }

  /**
   * Finds all documents matching the filter criteria
   * @param filterQuery - Query conditions to match documents
   * @returns Promise with array of matching documents
   */
  async find(filterQuery: FilterQuery<TDocument>) {
    return this.model
      .find(filterQuery, {}, { _id: 0, __v: 0 })
      .lean() as unknown as TDocument[];
  }

  /**
   * Removes a document matching the filter criteria
   * @param filterQuery - Query conditions to match document for deletion
   * @returns Promise with deletion result
   */
  async remove(filterQuery: FilterQuery<TDocument>) {
    return this.model.deleteOne(filterQuery, {});
  }

  /**
   * Starts a MongoDB transaction
   * @returns Promise with the MongoDB session
   */
  async startTransaction() {
    const session = await this.connection.startSession();
    session.startTransaction();
    return session;
  }

  /**
   * Retrieves paginated results with metadata
   * @param queryParams - Pagination parameters (page, pageSize)
   * @param filterQuery - Query conditions to match documents
   * @returns Promise with paginated results and metadata
   */
  async findAllWithPaginated(
    queryParams: PaginatedParamsDto,
    filterQuery: FilterQuery<TDocument> = {},
  ) {
    // Extract pagination parameters with defaults
    const { page = 1, pageSize = 10 } = queryParams as PaginatedParamsDto;
    const skip = (page - 1) * pageSize;

    // Fetch total count and documents in parallel
    const [totalItems, documents] = await Promise.all([
      this.model.countDocuments(filterQuery),
      this.model.find(filterQuery).limit(pageSize).skip(skip),
    ]);

    // Calculate pagination metadata
    const totalPages = Math.ceil(totalItems / pageSize);
    return {
      prevPage: page > 1 ? page - 1 : null,
      nextPage: page >= totalPages ? null : +page + 1,
      totalPages: +totalPages,
      totalItems: +totalItems,
      page: +page,
      pageSize: +pageSize,
      data: documents,
    };
  }
}
