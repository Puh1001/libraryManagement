import { getModelToken } from '@nestjs/mongoose';
import { Test } from '@nestjs/testing';
import { Model } from 'mongoose';
import { Borrower } from './borrower.schema';

describe('Borrower Schema', () => {
  let borrowerModel: Model<Borrower>;

  beforeEach(async () => {
    const moduleRef = await Test.createTestingModule({
      providers: [
        {
          provide: getModelToken(Borrower.name),
          useValue: {
            create: jest.fn(),
          },
        },
      ],
    }).compile();

    borrowerModel = moduleRef.get<Model<Borrower>>(
      getModelToken(Borrower.name),
    );
  });

  it('should have a user field', async () => {
    const borrowerData = {
      name: 'Test Borrower',
      user: {
        toString: () => '60d21b4667d0d8992e610c85',
      },
    };

    (borrowerModel.create as jest.Mock).mockResolvedValue(borrowerData);

    const borrower = await borrowerModel.create({});

    expect(borrower.user).toBeDefined();
    expect(borrower.user.toString()).toBe('60d21b4667d0d8992e610c85');
  });
});
