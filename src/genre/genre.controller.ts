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
} from '@nestjs/common';
import { GenreService } from './genre.service';
import { CreateGenreDto } from './dto/create-genre.dto';
import { UpdateGenreDto } from './dto/update-genre.dto';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { ChangeStatusGenreDto } from './dto/change-status-genre.dto';
import { applyRbac } from 'utilities/functions';
import { Request } from 'express';

@ApiTags('Gestion des genres')
@Controller('genre')
export class GenreController {
  constructor(private readonly genreService: GenreService) {}

  @ApiBearerAuth()
  @UseGuards(AuthGuard('jwt'))
  @Post()
  create(@Body() createGenreDto: CreateGenreDto, @Req() request: Request) {
    let userAuthenticated = request['user'];
    applyRbac(userAuthenticated, 'genre_create');

    return this.genreService.create(createGenreDto);
  }

  @Get()
  findAll() {
    return this.genreService.findAll();
  }

  @Get('by-slug/:slug')
  findOneBySlug(@Param('slug') slug: string) {
    return this.genreService.findOneBySlug(slug);
  }

  @ApiBearerAuth()
  @UseGuards(AuthGuard('jwt'))
  @Get(':id')
  findOne(@Param('id') id: string, @Req() request: Request) {
    let userAuthenticated = request['user'];
    applyRbac(userAuthenticated, 'genre_find_one');

    return this.genreService.findOne(+id);
  }

  @ApiBearerAuth()
  @UseGuards(AuthGuard('jwt'))
  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateGenreDto: UpdateGenreDto,
    @Req() request: Request,
  ) {
    let userAuthenticated = request['user'];
    applyRbac(userAuthenticated, 'genre_update');

    return this.genreService.update(+id, updateGenreDto);
  }

  @ApiBearerAuth()
  @UseGuards(AuthGuard('jwt'))
  @Patch('change-status/:id')
  changeStatus(
    @Param('id') id: string,
    @Body() changeStatusGenreDto: ChangeStatusGenreDto,
    @Req() request: Request,
  ) {
    let userAuthenticated = request['user'];
    applyRbac(userAuthenticated, 'genre_change_status');

    return this.genreService.changeStatus(+id, changeStatusGenreDto);
  }
}
