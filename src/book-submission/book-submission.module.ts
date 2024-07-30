import { Module } from '@nestjs/common';
import { BookSubmissionService } from './book-submission.service';
import { BookSubmissionController } from './book-submission.controller';

@Module({
  controllers: [BookSubmissionController],
  providers: [BookSubmissionService],
})
export class BookSubmissionModule {}
