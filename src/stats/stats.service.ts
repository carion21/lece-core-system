import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class StatsService {
  constructor(private readonly prismaService: PrismaService) {}

  async findAll() {
    const count_books = await this.prismaService.book.count({
      where: {
        deleted: false
      }
    });
    const count_authors = await this.prismaService.author.count({
      where: {
        deleted: false
      }
    });
    const count_genres = await this.prismaService.genre.count({
      where: {
        deleted: false
      }
    });

    const count_submissions = await this.prismaService.bookSubmission.count();
    const count_subscribers = await this.prismaService.subscriber.count();
    const count_messages = await this.prismaService.message.count();
    
    return {
      message: 'Stats found',
      data: {
        count_books: count_books,
        count_authors: count_authors,
        count_genres: count_genres,
        count_submissions: count_submissions,
        count_subscribers: count_subscribers,
        count_messages: count_messages,
      },
    }
  }
}
