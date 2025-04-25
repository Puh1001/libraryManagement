import { Test, TestingModule } from '@nestjs/testing';
import { BorrowersService } from './borrowers.service';
import { BorrowerRepository } from '../repositories/borrower.repository';
import { ConfigService } from '@nestjs/config';
import { UserDocument } from '../../users/schemas/user.schemas';

describe('BorrowersService', () => {
  let service: BorrowersService;
  let borrowerRepository: BorrowerRepository;

  const mockBorrowerRepository = {
    create: jest.fn(),
    findOne: jest.fn(),
    findAllWithPaginated: jest.fn(),
    findOneAndUpdate: jest.fn(),
    remove: jest.fn(),
  };

  const mockConfigService = {
    get: jest.fn(),
  };

  beforeEach(async () => {
    mockBorrowerRepository.findOne.mockReset();
    mockBorrowerRepository.create.mockReset();
    /**
     * Sets up a TestingModule for testing the BorrowersService.
     *
     * This module configuration:
     * - Provides the actual BorrowersService that will be tested
     * - Injects a mock BorrowerRepository instead of the real implementation
     * - Injects a mock ConfigService instead of the real implementation
     *
     * The mocked dependencies allow for isolated testing of the BorrowersService
     * without relying on actual database connections or configuration.
     */
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        BorrowersService,
        {
          provide: BorrowerRepository,
          useValue: mockBorrowerRepository,
        },
        {
          provide: ConfigService,
          useValue: mockConfigService,
        },
      ],
    }).compile();

    service = module.get<BorrowersService>(BorrowersService);
    borrowerRepository = module.get<BorrowerRepository>(BorrowerRepository);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('registerUserAsBorrower', () => {
    it('should register current user as borrower', async () => {
      const user = {
        id: 'user-id',
        name: 'Test User',
      } as UserDocument;

      const mockBorrower = {
        id: 'borrower-id',
        name: 'Test User',
        user: 'user-id',
      };

      mockBorrowerRepository.create.mockResolvedValue(mockBorrower);

      const result = await service.registerUserAsBorrower(user);

      expect(mockBorrowerRepository.create).toHaveBeenCalledWith({
        name: user.name,
        user: user.id,
      });
      expect(result).toEqual(mockBorrower);
    });

    it('should use existing borrower if user already registered', async () => {
      const user = {
        id: 'user-id',
        name: 'Test User',
      } as UserDocument;

      const mockBorrower = {
        id: 'borrower-id',
        name: 'Test User',
        user: 'user-id',
      };

      mockBorrowerRepository.findOne.mockImplementation(() => mockBorrower);

      const result = await service.registerUserAsBorrower(user);

      expect(mockBorrowerRepository.findOne).toHaveBeenCalledWith(
        { user: user.id },
        'No borrower profile found for this user',
      );
      expect(mockBorrowerRepository.create).not.toHaveBeenCalled();
      expect(result).toEqual(mockBorrower);
    });
  });

  describe('findByUserId', () => {
    it('should find borrower by user ID', async () => {
      const userId = 'user-id';
      const mockBorrower = {
        id: 'borrower-id',
        name: 'Test User',
        user: userId,
      };

      mockBorrowerRepository.findOne.mockResolvedValue(mockBorrower);

      const result = await service.findByUserId(userId);

      expect(mockBorrowerRepository.findOne).toHaveBeenCalledWith(
        { user: userId },
        'No borrower profile found for this user',
      );
      expect(result).toEqual(mockBorrower);
    });
  });
});
