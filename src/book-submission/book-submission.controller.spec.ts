import { Test, TestingModule } from '@nestjs/testing';
import { BookSubmissionController } from './book-submission.controller';
import { BookSubmissionService } from './book-submission.service';

describe('BookSubmissionController', () => {
  let controller: BookSubmissionController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [BookSubmissionController],
      providers: [BookSubmissionService],
    }).compile();

    controller = module.get<BookSubmissionController>(BookSubmissionController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
