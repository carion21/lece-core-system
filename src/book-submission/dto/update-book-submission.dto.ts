import { PartialType } from '@nestjs/swagger';
import { CreateBookSubmissionDto } from './create-book-submission.dto';

export class UpdateBookSubmissionDto extends PartialType(CreateBookSubmissionDto) {}
