import { Test, TestingModule } from '@nestjs/testing';
import { CategoriesService } from './categories.service';
import { getModelToken } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Category } from '../schemas/category.schema';
import { NotFoundException } from '@nestjs/common';

describe('CategoriesService', () => {
  let service: CategoriesService;
  let categoryModel: Model<Category>;

  const mockCategory = {
    id: 'category-id',
    _id: 'category-id',
    name: 'Fiction',
    description: 'Fiction books category',
  };

  const mockCategoryModel = {
    create: jest.fn(),
    find: jest.fn(),
    findById: jest.fn(),
    findByIdAndUpdate: jest.fn(),
    findByIdAndDelete: jest.fn(),
  };

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CategoriesService,
        {
          provide: getModelToken(Category.name),
          useValue: mockCategoryModel,
        },
      ],
    }).compile();

    service = module.get<CategoriesService>(CategoriesService);
    categoryModel = module.get<Model<Category>>(getModelToken(Category.name));
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    const createCategoryDto = {
      name: 'Fiction',
      description: 'Fiction books category',
    };

    it('should create a new category', async () => {
      mockCategoryModel.create.mockResolvedValue(mockCategory);

      const result = await service.create(createCategoryDto);

      expect(mockCategoryModel.create).toHaveBeenCalledWith(createCategoryDto);
      expect(result).toEqual(mockCategory);
    });
  });

  describe('findAll', () => {
    it('should return all categories', async () => {
      mockCategoryModel.find.mockResolvedValue([mockCategory]);

      const result = await service.findAll();

      expect(mockCategoryModel.find).toHaveBeenCalled();
      expect(result).toEqual([mockCategory]);
    });
  });

  describe('findOne', () => {
    it('should return a category by id', async () => {
      mockCategoryModel.findById.mockResolvedValue(mockCategory);

      const result = await service.findOne('category-id');

      expect(mockCategoryModel.findById).toHaveBeenCalledWith('category-id');
      expect(result).toEqual(mockCategory);
    });

    it('should throw NotFoundException if category not found', async () => {
      mockCategoryModel.findById.mockResolvedValue(null);

      await expect(service.findOne('nonexistent-id')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('update', () => {
    const updateCategoryDto = {
      name: 'Updated Fiction',
    };

    it('should update a category', async () => {
      mockCategoryModel.findByIdAndUpdate.mockResolvedValue({
        ...mockCategory,
        name: 'Updated Fiction',
      });

      const result = await service.update('category-id', updateCategoryDto);

      expect(mockCategoryModel.findByIdAndUpdate).toHaveBeenCalledWith(
        'category-id',
        updateCategoryDto,
        { new: true },
      );
      expect(result.name).toBe('Updated Fiction');
    });

    it('should throw NotFoundException if category to update not found', async () => {
      mockCategoryModel.findByIdAndUpdate.mockResolvedValue(null);

      await expect(
        service.update('nonexistent-id', updateCategoryDto),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('remove', () => {
    it('should remove a category', async () => {
      mockCategoryModel.findByIdAndDelete.mockResolvedValue(mockCategory);

      const result = await service.remove('category-id');

      expect(mockCategoryModel.findByIdAndDelete).toHaveBeenCalledWith(
        'category-id',
      );
      expect(result).toEqual(mockCategory);
    });

    it('should throw NotFoundException if category to remove not found', async () => {
      mockCategoryModel.findByIdAndDelete.mockResolvedValue(null);

      await expect(service.remove('nonexistent-id')).rejects.toThrow(
        NotFoundException,
      );
    });
  });
});
