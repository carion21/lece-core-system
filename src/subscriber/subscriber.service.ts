import { Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { CreateSubscriberDto } from './dto/create-subscriber.dto';
import { UpdateSubscriberDto } from './dto/update-subscriber.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { genSubscriberCode } from 'utilities/functions';

@Injectable()
export class SubscriberService {
  constructor(private readonly prismaService: PrismaService) {}

  async create(createSubscriberDto: CreateSubscriberDto) {
    const { name, email } = createSubscriberDto;

    const subscriber = await this.prismaService.subscriber.create({
      data: {
        code: genSubscriberCode(),
        name,
        email,
      },
    });
    if (!subscriber)
      throw new InternalServerErrorException('Error while creating subscriber');

    return {
      message: 'Subscriber created',
      data: subscriber,
    };
  }

  async findAll() {
    const subscribers = await this.prismaService.subscriber.findMany({
      where: {
        status: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
    // Return the response
    return {
      message: 'Subscribers found',
      data: subscribers,
    };
  }

  async findOne(id: number) {
    const subscriber = await this.prismaService.subscriber.findUnique({
      where: {
        id,
      },
    });
    if (!subscriber) throw new NotFoundException('Subscriber not found');

    return {
      message: 'Subscriber found',
      data: subscriber,
    };
  }
}
