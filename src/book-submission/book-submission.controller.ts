import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Req, UseInterceptors, UploadedFile, ParseFilePipe, MaxFileSizeValidator, FileTypeValidator } from '@nestjs/common';
import { BookSubmissionService } from './book-submission.service';
import { CreateBookSubmissionDto } from './dto/create-book-submission.dto';
import { UpdateBookSubmissionDto } from './dto/update-book-submission.dto';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { applyRbac } from 'utilities/functions';
import { FileInterceptor } from '@nestjs/platform-express';

@ApiTags('Gestion des soumissions de livres')
@Controller('book-submission')
export class BookSubmissionController {
  constructor(private readonly bookSubmissionService: BookSubmissionService) {}

  @UseInterceptors(FileInterceptor('file'))
  @Post()
  create(
    @UploadedFile(
      new ParseFilePipe({
        validators: [
          // 20MB and its pdf
          new MaxFileSizeValidator({ maxSize: 20 * 1024 * 1024 }),
          new FileTypeValidator({ fileType: 'application/pdf' }),
        ],
      }),
    )
    bookFile: Express.Multer.File,
    @Body() createBookSubmissionDto: CreateBookSubmissionDto,
  ) {

    return this.bookSubmissionService.create(
      bookFile,
      createBookSubmissionDto
    );
  }

  @ApiBearerAuth()
  @UseGuards(AuthGuard('jwt'))
  @Get()
  findAll(@Req() request: Request) {
    let userAuthenticated = request['user'];
    applyRbac(userAuthenticated, 'book_submission_find_all');
    let userId = userAuthenticated['id'];

    return this.bookSubmissionService.findAll();
  }

  @ApiBearerAuth()
  @UseGuards(AuthGuard('jwt'))
  @Get(':id')
  findOne(@Param('id') id: string, @Req() request: Request) {
    let userAuthenticated = request['user'];
    applyRbac(userAuthenticated, 'book_submission_find_one');
    let userId = userAuthenticated['id'];

    return this.bookSubmissionService.findOne(+id);
  }

  @ApiBearerAuth()
  @UseGuards(AuthGuard('jwt'))
  @Patch(':id')
  viewOne(@Param('id') id: string, @Req() request: Request) {
    let userAuthenticated = request['user'];
    applyRbac(userAuthenticated, 'book_submission_view_one');
    let userId = userAuthenticated['id'];

    return this.bookSubmissionService.viewOne(+id, userAuthenticated);
  }
}
