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
  UnauthorizedException,
} from '@nestjs/common';
import { AdminService } from './admin.service';
import { CreateAdminDto } from './dto/create-admin.dto';
import { UpdateAdminDto } from './dto/update-admin.dto';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { Request } from 'express';
import { ChangeStatusAdminDto } from './dto/change-status-admin.dto';
import { applyRbac } from 'utilities/functions';

@ApiTags('Gestion des administrateurs')
@ApiBearerAuth()
@UseGuards(AuthGuard('jwt'))
@Controller('admin')
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  @Post()
  create(@Body() createAdminDto: CreateAdminDto, @Req() request: Request) {
    let userAuthenticated = request['user'];
    applyRbac(userAuthenticated, 'admin_create');
    let userId = userAuthenticated['id'];

    return this.adminService.create(createAdminDto, userAuthenticated);
  }

  @Get()
  findAll(@Req() request: Request) {
    let userAuthenticated = request['user'];
    applyRbac(userAuthenticated, 'admin_find_all');

    return this.adminService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string, @Req() request: Request) {
    let userAuthenticated = request['user'];
    applyRbac(userAuthenticated, 'admin_find_one');

    return this.adminService.findOne(+id);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateAdminDto: UpdateAdminDto,
    @Req() request: Request,
  ) {
    let userAuthenticated = request['user'];
    applyRbac(userAuthenticated, 'admin_update');

    return this.adminService.update(+id, updateAdminDto);
  }

  @Patch('change-status/:id')
  changeStatus(
    @Param('id') id: string,
    @Body() changeStatusAdminDto: ChangeStatusAdminDto,
    @Req() request: Request,
  ) {
    let userAuthenticated = request['user'];
    applyRbac(userAuthenticated, 'admin_change_status');

    return this.adminService.changeStatus(+id, changeStatusAdminDto);
  }
}
