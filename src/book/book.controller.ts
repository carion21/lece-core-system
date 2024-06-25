import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Req,
  UseInterceptors,
  UploadedFile,
  ParseFilePipe,
  MaxFileSizeValidator,
  FileTypeValidator,
  UploadedFiles,
  BadRequestException,
} from '@nestjs/common';
import { BookService } from './book.service';
import { CreateBookDto } from './dto/create-book.dto';
import { UpdateBookDto } from './dto/update-book.dto';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { Request } from 'express';
import { applyRbac } from 'utilities/functions';
import { ChangeStatusBookDto } from './dto/change-status-book.dto';
import { FileInterceptor } from '@nestjs/platform-express';

@ApiTags('Gestion des livres')
@Controller('book')
export class BookController {
  constructor(private readonly bookService: BookService) {}

  @ApiBearerAuth()
  @UseGuards(AuthGuard('jwt'))
  @Post()
  create(
    @Body() createBookDto: CreateBookDto,
    @Req() request: Request,
  ) {
    let userAuthenticated = request['user'];
    applyRbac(userAuthenticated, 'book_create');
    let userId = userAuthenticated['id'];

    return this.bookService.create(
      createBookDto,
      userAuthenticated,
    );
  }

  @ApiBearerAuth()
  @UseGuards(AuthGuard('jwt'))
  @UseInterceptors(FileInterceptor('file'))
  @Patch('add-book-file/:id')
  addBookFile(
    @Param('id') id: string,
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
    @Req() request: Request,
  ) {
    let userAuthenticated = request['user'];
    applyRbac(userAuthenticated, 'book_create');
    let userId = userAuthenticated['id'];

    return this.bookService.addBookFile(
      +id,
      bookFile,
      userAuthenticated,
    );
  }

  @ApiBearerAuth()
  @UseGuards(AuthGuard('jwt'))
  @UseInterceptors(FileInterceptor('file'))
  @Patch('add-cover-file/:id')
  addCoverFile(
    @Param('id') id: string,
    @UploadedFile(
      new ParseFilePipe({
        validators: [
          // 50MB and its png, jpeg, jpg
          new MaxFileSizeValidator({ maxSize: 5 * 1024 * 1024 }),
          new FileTypeValidator({ fileType: 'image' }),
        ],
      }),
    )
    coverFile: Express.Multer.File,
    @Req() request: Request,
  ) {
    let userAuthenticated = request['user'];
    applyRbac(userAuthenticated, 'book_create');
    let userId = userAuthenticated['id'];

    return this.bookService.addCoverFile(
      +id,
      coverFile,
      userAuthenticated,
    );
  }


  @Get()
  findAll() {
    return this.bookService.findAll();
  }

  @Get('by-slug/:slug')
  findOneBySlug(@Param('slug') slug: string) {
    return this.bookService.findOneBySlug(slug);
  }

  @ApiBearerAuth()
  @UseGuards(AuthGuard('jwt'))
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.bookService.findOne(+id);
  }

  @ApiBearerAuth()
  @UseGuards(AuthGuard('jwt'))
  @Patch(':id')
  update(@Param('id') id: string, @Body() updateBookDto: UpdateBookDto) {
    return this.bookService.update(+id, updateBookDto);
  }

  @ApiBearerAuth()
  @UseGuards(AuthGuard('jwt'))
  @Patch('change-status/:id')
  changeStatus(
    @Param('id') id: string,
    @Body() changeStatusBookDto: ChangeStatusBookDto,
    @Req() request: Request,
  ) {
    let userAuthenticated = request['user'];
    applyRbac(userAuthenticated, 'book_change_status');

    return this.bookService.changeStatus(+id, changeStatusBookDto);
  }
}
