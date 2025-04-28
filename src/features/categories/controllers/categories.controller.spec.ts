import { Test, TestingModule } from '@nestjs/testing';
import { CategoriesController } from './categories.controller';
import { CategoriesService } from '../services/categories.service';

describe('CategoriesController', () => {
  let controller: CategoriesController;
  let service: CategoriesService;

  const mockCategory = {
    id: 'category-id',
    name: 'Fiction',
    description: 'Fiction books category',
  };

  const mockCategoriesService = {
    create: jest.fn(),
    findAll: jest.fn(),
    findOne: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
  };

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      controllers: [CategoriesController],
      providers: [
        {
          provide: CategoriesService,
          useValue: mockCategoriesService,
        },
      ],
    }).compile();

    controller = module.get<CategoriesController>(CategoriesController);
    service = module.get<CategoriesService>(CategoriesService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('create', () => {
    const createCategoryDto = {
      name: 'Fiction',
      description: 'Fiction books category',
    };

    it('should create a new category', async () => {
      mockCategoriesService.create.mockResolvedValue(mockCategory);

      const result = await controller.create(createCategoryDto);

      expect(service.create).toHaveBeenCalledWith(createCategoryDto);
      expect(result).toEqual(mockCategory);
    });
  });

  describe('findAll', () => {
    it('should return all categories', async () => {
      mockCategoriesService.findAll.mockResolvedValue([mockCategory]);

      const result = await controller.findAll();

      expect(service.findAll).toHaveBeenCalled();
      expect(result).toEqual([mockCategory]);
    });
  });

  describe('findOne', () => {
    it('should return a category by id', async () => {
      mockCategoriesService.findOne.mockResolvedValue(mockCategory);

      const result = await controller.findOne('category-id');

      expect(service.findOne).toHaveBeenCalledWith('category-id');
      expect(result).toEqual(mockCategory);
    });
  });

  describe('update', () => {
    const updateCategoryDto = {
      name: 'Updated Fiction',
    };

    it('should update a category', async () => {
      mockCategoriesService.update.mockResolvedValue({
        ...mockCategory,
        name: 'Updated Fiction',
      });

      const result = await controller.update('category-id', updateCategoryDto);

      expect(service.update).toHaveBeenCalledWith(
        'category-id',
        updateCategoryDto,
      );
      expect(result.name).toBe('Updated Fiction');
    });
  });

  describe('remove', () => {
    it('should remove a category', async () => {
      mockCategoriesService.remove.mockResolvedValue(mockCategory);

      const result = await controller.remove('category-id');

      expect(service.remove).toHaveBeenCalledWith('category-id');
      expect(result).toEqual(mockCategory);
    });
  });
});
