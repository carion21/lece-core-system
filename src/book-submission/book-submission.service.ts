import {
  ConflictException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { CreateBookSubmissionDto } from './dto/create-book-submission.dto';
import { UpdateBookSubmissionDto } from './dto/update-book-submission.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { ConfigService } from '@nestjs/config';
import { MinioService } from 'src/minio/minio.service';
import { genBookSubmissionCode } from 'utilities/functions';

@Injectable()
export class BookSubmissionService {
  constructor(
    private readonly prismaService: PrismaService,
    private readonly configService: ConfigService,
    private readonly minioService: MinioService,
  ) {}

  async create(
    bookFile: Express.Multer.File,
    createBookSubmissionDto: CreateBookSubmissionDto,
  ) {
    const { name, email, phone, title, summary } = createBookSubmissionDto;

    const bookMinio = await this.minioService.uploadFile(bookFile, true);

    const bookSubmissionCode = genBookSubmissionCode();

    const bookSubmission = await this.prismaService.bookSubmission.create({
      data: {
        code: bookSubmissionCode,
        name,
        email,
        phone,
        title,
        summary,
        file: bookMinio.objectName,
      },
    });
    if (!bookSubmission)
      throw new InternalServerErrorException(
        'An error occurred while creating book submission',
      );

    bookSubmission['fileUrl'] = bookMinio.objectUrl;

    // Return the response
    return {
      message: 'Book submission created',
      data: bookSubmission,
    };
  }

  async findAll() {
    let bookSubmissions = await this.prismaService.bookSubmission.findMany({
      include: {
        viewer: {
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

    // Add the file URL
    bookSubmissions = await Promise.all(
      bookSubmissions.map(async (bookSubmission) => {
        bookSubmission['fileUrl'] = await this.minioService.getFileUrl(
          bookSubmission['file'],
        );
        return bookSubmission;
      }),
    );

    // Return the response
    return {
      message: 'Book submissions found',
      data: bookSubmissions,
    };
  }

  async findOne(id: number) {
    const bookSubmission = await this.prismaService.bookSubmission.findUnique({
      where: {
        id,
      },
    });
    if (!bookSubmission)
      throw new NotFoundException('Book submission not found');

    // Return the response
    return {
      message: 'Book submission found',
      data: bookSubmission,
    };
  }

  async viewOne(id: number, userAuthenticated: object) {
    const bookSubmission = await this.prismaService.bookSubmission.findUnique({
      where: {
        id,
      },
    });
    if (!bookSubmission)
      throw new NotFoundException('Book submission not found');
    if (bookSubmission['viewerId'])
      throw new ConflictException('Book submission already viewed');

    // Update the book submission
    const updatedBookSubmission =
      await this.prismaService.bookSubmission.update({
        where: {
          id,
        },
        data: {
          viewerId: userAuthenticated['id'],
          viewed: true,
        },
      });

    // Return the response
    return {
      message: 'Book submission viewed',
      data: updatedBookSubmission,
    };
  }
}
