import { Test, TestingModule } from '@nestjs/testing';
import { DigitalBookController } from './digital-book.controller';

describe('DigitalBookController', () => {
  let controller: DigitalBookController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [DigitalBookController],
    }).compile();

    controller = module.get<DigitalBookController>(DigitalBookController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
