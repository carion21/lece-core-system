import {
  ConflictException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { CreateMessageDto } from './dto/create-message.dto';
import { UpdateMessageDto } from './dto/update-message.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { genMessageCode } from 'utilities/functions';

@Injectable()
export class MessageService {
  constructor(private readonly prismaService: PrismaService) {}

  async create(createMessageDto: CreateMessageDto) {
    const { name, email, phone, subject, content } = createMessageDto;

    const message = await this.prismaService.message.create({
      data: {
        code: genMessageCode(),
        name,
        email,
        phone,
        subject,
        content,
      },
    });
    if (!message)
      throw new InternalServerErrorException('Error while creating message');

    // Return the response
    return {
      message: 'Message created',
      data: message,
    };
  }

  async findAll() {
    const messages = await this.prismaService.message.findMany({
      include: {
        reader: {
          select: {
            id: true,
            lastname: true,
            firstname: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    // Return the response
    return {
      message: 'Messages found',
      data: messages,
    };
  }

  async findOne(id: number) {
    const message = await this.prismaService.message.findUnique({
      where: {
        id,
      },
    });
    if (!message) throw new NotFoundException('Message not found');

    // Return the response
    return {
      message: 'Message found',
      data: message,
    };
  }

  async readOne(id: number, userAuthenticated: object) {
    const message = await this.prismaService.message.findUnique({
      where: {
        id,
      },
    });
    if (!message) throw new NotFoundException('Message not found');
    if (message['readerId'])
      throw new ConflictException('Message already read');

    // Update the message
    const updatedMessage = await this.prismaService.message.update({
      where: {
        id,
      },
      data: {
        readerId: userAuthenticated['id'],
      },
    });

    // Return the response
    return {
      message: 'Message read',
      data: updatedMessage,
    };
  }
}
