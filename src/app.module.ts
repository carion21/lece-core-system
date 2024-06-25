import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule } from '@nestjs/config';
import { AuthModule } from './auth/auth.module';
import { PrismaModule } from './prisma/prisma.module';
import { MinioModule } from './minio/minio.module';
import { AdminModule } from './admin/admin.module';
import { AuthorModule } from './author/author.module';
import { GenreModule } from './genre/genre.module';
import { BookModule } from './book/book.module';
import { SubscriberModule } from './subscriber/subscriber.module';
import { MessageModule } from './message/message.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    PrismaModule,
    AuthModule,
    MinioModule,
    AdminModule,
    AuthorModule,
    GenreModule,
    BookModule,
    SubscriberModule,
    MessageModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
