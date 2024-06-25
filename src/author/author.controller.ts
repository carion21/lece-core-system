import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseInterceptors,
  UploadedFile,
  ParseFilePipe,
  MaxFileSizeValidator,
  FileTypeValidator,
  Req,
  UseGuards,
} from '@nestjs/common';
import { AuthorService } from './author.service';
import { CreateAuthorDto } from './dto/create-author.dto';
import { UpdateAuthorDto } from './dto/update-author.dto';
import { FileInterceptor } from '@nestjs/platform-express';
import { Request } from 'express';
import { applyRbac } from 'utilities/functions';
import { ChangeStatusAuthorDto } from './dto/change-status-author.dto';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';

@ApiTags('Gestion des auteurs')
@Controller('author')
export class AuthorController {
  constructor(private readonly authorService: AuthorService) {}

  @ApiBearerAuth()
  @UseGuards(AuthGuard('jwt'))
  @UseInterceptors(FileInterceptor('photo'))
  @Post()
  create(
    @UploadedFile(
      new ParseFilePipe({
        validators: [
          // 20MB and its png, jpeg, jpg
          new MaxFileSizeValidator({ maxSize: 20 * 1024 * 1024 }),
          new FileTypeValidator({ fileType: 'image' }),
        ],
      }),
    )
    photoFile: Express.Multer.File,
    @Body() createAuthorDto: CreateAuthorDto,
    @Req() request: Request,
  ) {
    let userAuthenticated = request['user'];
    applyRbac(userAuthenticated, 'author_create');
    let userId = userAuthenticated['id'];

    return this.authorService.create(
      photoFile,
      createAuthorDto,
      userAuthenticated,
    );
  }

  @Get()
  findAll() {
    return this.authorService.findAll();
  }

  @Get('by-slug/:slug')
  findOneBySlug(@Param('slug') slug: string) {
    return this.authorService.findOneBySlug(slug);
  }

  @ApiBearerAuth()
  @UseGuards(AuthGuard('jwt'))
  @Get(':id')
  findOne(@Param('id') id: string, @Req() request: Request) {
    let userAuthenticated = request['user'];
    applyRbac(userAuthenticated, 'author_find_one');

    return this.authorService.findOne(+id);
  }

  @ApiBearerAuth()
  @UseGuards(AuthGuard('jwt'))
  @UseInterceptors(FileInterceptor('photo'))
  @Patch(':id')
  update(
    @Param('id') id: string,
    @UploadedFile(
      new ParseFilePipe({
        validators: [
          // 20MB and its pdf
          new MaxFileSizeValidator({ maxSize: 20 * 1024 * 1024 }),
          new FileTypeValidator({ fileType: 'image' }),
        ],
      }),
    )
    photoFile: Express.Multer.File,
    @Body() updateAuthorDto: UpdateAuthorDto,
    @Req() request: Request,
  ) {
    let userAuthenticated = request['user'];
    applyRbac(userAuthenticated, 'author_update');
    let userId = userAuthenticated['id'];

    return this.authorService.update(
      +id,
      photoFile,
      updateAuthorDto,
      userAuthenticated,
    );
  }

  @ApiBearerAuth()
  @UseGuards(AuthGuard('jwt'))
  @Patch('change-status/:id')
  changeStatus(
    @Param('id') id: string,
    @Body() changeStatusAuthorDto: ChangeStatusAuthorDto,
    @Req() request: Request,
  ) {
    let userAuthenticated = request['user'];
    applyRbac(userAuthenticated, 'author_change_status');

    return this.authorService.changeStatus(+id, changeStatusAuthorDto);
  }
}
