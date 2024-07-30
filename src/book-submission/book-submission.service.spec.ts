import { Test, TestingModule } from '@nestjs/testing';
import { BookSubmissionService } from './book-submission.service';

describe('BookSubmissionService', () => {
  let service: BookSubmissionService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [BookSubmissionService],
    }).compile();

    service = module.get<BookSubmissionService>(BookSubmissionService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
