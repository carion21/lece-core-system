import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Req,
} from '@nestjs/common';
import { MessageService } from './message.service';
import { CreateMessageDto } from './dto/create-message.dto';
import { UpdateMessageDto } from './dto/update-message.dto';
import { ApiTags } from '@nestjs/swagger';
import { applyRbac } from 'utilities/functions';
import { Request } from 'express';

@ApiTags('Gestion des messages')
@Controller('message')
export class MessageController {
  constructor(private readonly messageService: MessageService) {}

  @Post()
  create(@Body() createMessageDto: CreateMessageDto) {
    return this.messageService.create(createMessageDto);
  }

  @Get()
  findAll(@Req() request: Request) {
    let userAuthenticated = request['user'];
    applyRbac(userAuthenticated, 'message_find_all');
    let userId = userAuthenticated['id'];

    return this.messageService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string, @Req() request: Request) {
    let userAuthenticated = request['user'];
    applyRbac(userAuthenticated, 'message_find_one');
    let userId = userAuthenticated['id'];

    return this.messageService.findOne(+id);
  }

  @Patch(':id')
  readOne(@Param('id') id: string, @Req() request: Request) {
    let userAuthenticated = request['user'];
    applyRbac(userAuthenticated, 'message_read_one');
    let userId = userAuthenticated['id'];

    return this.messageService.readOne(+id, userAuthenticated);
  }

}
