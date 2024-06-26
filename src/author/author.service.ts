import {
  ConflictException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { CreateAuthorDto } from './dto/create-author.dto';
import { UpdateAuthorDto } from './dto/update-author.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { ConfigService } from '@nestjs/config';
import { MinioService } from 'src/minio/minio.service';
import { genAuthorCode, getSlug } from 'utilities/functions';
import { ChangeStatusAuthorDto } from './dto/change-status-author.dto';

@Injectable()
export class AuthorService {
  constructor(
    private readonly prismaService: PrismaService,
    private readonly configService: ConfigService,
    private readonly minioService: MinioService,
  ) {}

  async create(
    photoFile: Express.Multer.File,
    createAuthorDto: CreateAuthorDto,
    userAuthenticated: object,
  ) {
    const { name, email, biography } = createAuthorDto;

    const authorExists = await this.prismaService.author.findFirst({
      where: {
        email,
      },
    });
    if (authorExists)
      throw new ConflictException('Author with this email already exists');

    const photoMinio = await this.minioService.uploadFile(photoFile, true);

    const authorCode = genAuthorCode();

    const author = await this.prismaService.author.create({
      data: {
        code: authorCode,
        name,
        email,
        biography,
        slug: getSlug(authorCode + '-' + name),
        photo: photoMinio.objectName,
        editorId: userAuthenticated['id'],
      },
    });
    if (!author)
      throw new InternalServerErrorException(
        'An error occurred while creating author',
      );

    author['photoUrl'] = photoMinio.objectUrl;

    // Return the response
    return {
      message: 'Author created successfully',
      data: author,
    };
  }

  async findAll() {
    let authors = await this.prismaService.author.findMany({
      include: {
        editor: {
          select: {
            id: true,
            lastname: true,
            firstname: true,
          },
        },
      },
      where: {
        status: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    // Get the photo URL
    authors = await Promise.all(
      authors.map(async (author) => {
        author['photoUrl'] = author.photo
          ? await this.minioService.getFileUrl(author.photo)
          : null;
        return author;
      }),
    );

    // Return the response
    return {
      message: 'Authors found',
      data: authors,
    };
  }

  async findOneBySlug(slug: string) {
    const author = await this.prismaService.author.findFirst({
      include: {
        editor: {
          select: {
            id: true,
            lastname: true,
            firstname: true,
          },
        },
      },
      where: {
        slug,
      },
    });
    if (!author) throw new NotFoundException('Author not found');

    // Get the photo URL
    author['photoUrl'] = author.photo
      ? await this.minioService.getFileUrl(author.photo)
      : null;

    let books = await this.prismaService.book.findMany({
      select: {
        id: true,
        title: true,
        slug: true,
        summary: true,
        cover: true,
      },
      where: {
        authorId: author.id,
      },
    });
    books = await Promise.all(
      books.map(async (book) => {
        book['coverUrl'] = book.cover
          ? await this.minioService.getFileUrl(book.cover)
          : null;
        return book;
      }),
    );

    author['books'] = books;

    // Return the response
    return {
      message: 'Author found',
      data: author,
    };
  }

  async findOne(id: number) {
    const author = await this.prismaService.author.findUnique({
      include: {
        editor: {
          select: {
            id: true,
            lastname: true,
            firstname: true,
          },
        },
      },
      where: {
        id,
      },
    });
    if (!author) throw new NotFoundException('Author not found');

    // Get the photo URL
    author['photoUrl'] = await this.minioService.getFileUrl(author.photo);

    let books = await this.prismaService.book.findMany({
      select: {
        id: true,
        title: true,
        slug: true,
        summary: true,
        file: true,
        cover: true,
      },
      where: {
        authorId: author.id,
      },
    });
    books = await Promise.all(
      books.map(async (book) => {
        book['fileUrl'] = book.file
          ? await this.minioService.getFileUrl(book.file)
          : null;
        book['coverUrl'] = book.cover
          ? await this.minioService.getFileUrl(book.cover)
          : null;
        return book;
      }),
    );

    author['books'] = books;

    // Return the response
    return {
      message: 'Author found',
      data: author,
    };
  }

  async update(
    id: number,
    photoFile: Express.Multer.File,
    updateAuthorDto: UpdateAuthorDto,
    userAuthenticated: object,
  ) {
    const { name, email, biography } = updateAuthorDto;

    const author = await this.prismaService.author.findUnique({
      where: {
        id,
      },
    });
    if (!author) throw new NotFoundException('Author not found');

    const authorExists = await this.prismaService.author.findFirst({
      where: {
        id: {
          not: id,
        },
        email,
      },
    });
    if (authorExists)
      throw new ConflictException('Author with this email already exists');

    const photoMinio = await this.minioService.uploadFile(photoFile);

    const authorUpdated = await this.prismaService.author.update({
      where: {
        id,
      },
      data: {
        name,
        email,
        biography,
        photo: photoMinio.objectName,
        slug: getSlug(author.code + '-' + name),
      },
    });

    // Return the response
    return {
      message: 'Author updated',
      data: authorUpdated,
    };
  }

  async changeStatus(id: number, changeStatusAuthorDto: ChangeStatusAuthorDto) {
    const { status } = changeStatusAuthorDto;
    // Find the Author
    let author = await this.prismaService.author.findUnique({
      where: {
        id,
      },
    });
    if (!author) throw new NotFoundException('Author not found');
    // Verify if the status is different
    if (author.status == status)
      throw new ConflictException('Status already set');
    // Update the Author
    let authorUpdated = await this.prismaService.author.update({
      where: {
        id,
      },
      data: {
        status: status,
      },
    });
    if (!authorUpdated)
      throw new InternalServerErrorException('Error while updating the author');
    return {
      message: 'Author status updated',
      data: authorUpdated,
    };
  }
}
