import {
  ConflictException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { CreateBookDto } from './dto/create-book.dto';
import { UpdateBookDto } from './dto/update-book.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { ConfigService } from '@nestjs/config';
import { MinioService } from 'src/minio/minio.service';
import { ChangeStatusBookDto } from './dto/change-status-book.dto';
import { genBookCode, getSlug } from 'utilities/functions';

@Injectable()
export class BookService {
  constructor(
    private readonly prismaService: PrismaService,
    private readonly configService: ConfigService,
    private readonly minioService: MinioService,
  ) {}

  async create(createBookDto: CreateBookDto, userAuthenticated: object) {
    const { authorId, title, summary, pages, releaseDate, genres } =
      createBookDto;

    // Verify if the author exists
    const authorExists = await this.prismaService.author.findFirst({
      where: {
        id: authorId,
      },
    });
    if (!authorExists) throw new NotFoundException('Author not found');

    const bookCode = genBookCode();

    const book = await this.prismaService.book.create({
      data: {
        code: bookCode,
        title,
        summary,
        slug: getSlug(bookCode + '-' + title),
        authorId,
        pages,
        releaseDate: new Date(releaseDate),
        editorId: userAuthenticated['id'],
      },
    });
    if (!book)
      throw new InternalServerErrorException(
        'An error occurred while creating book',
      );

    // Add genres to the book
    genres.forEach(async (genre) => {
      // Create the book genre
      const bookGenre = await this.prismaService.bookGenre.create({
        data: {
          genreId: genre,
          bookId: book.id,
        },
      });
      if (!bookGenre)
        throw new InternalServerErrorException(
          'An error occurred while creating book genre',
        );
    });

    // Return the response
    return {
      message: 'Book created successfully',
      data: book,
    };
  }

  async addCoverFile(
    id: number,
    coverFile: Express.Multer.File,
    userAuthenticated: any,
  ) {
    const book = await this.prismaService.book.findUnique({
      where: {
        id,
      },
    });
    if (!book) throw new NotFoundException('Book not found');

    // Upload the file to Minio
    const coverMinio = await this.minioService.uploadFile(coverFile);

    // Update the book
    const bookUpdated = await this.prismaService.book.update({
      where: {
        id,
      },
      data: {
        cover: coverMinio.objectName,
      },
    });
    if (!bookUpdated)
      throw new InternalServerErrorException('Error while updating the book');

    // Return the response
    return {
      message: 'Cover file added',
      data: bookUpdated,
    };
  }
  async addBookFile(
    id: number,
    bookFile: Express.Multer.File,
    userAuthenticated: any,
  ) {
    const book = await this.prismaService.book.findUnique({
      where: {
        id,
      },
    });
    if (!book) throw new NotFoundException('Book not found');

    // Upload the file to Minio
    const fileMinio = await this.minioService.uploadFile(bookFile);

    // Update the book
    const bookUpdated = await this.prismaService.book.update({
      where: {
        id,
      },
      data: {
        file: fileMinio.objectName,
      },
    });
    if (!bookUpdated)
      throw new InternalServerErrorException('Error while updating the book');

    // Return the response
    return {
      message: 'Book file added',
      data: bookUpdated,
    };
  }

  async findAll() {
    let books = await this.prismaService.book.findMany({
      include: {
        author: {
          select: {
            id: true,
            name: true,
            slug: true,
            biography: true,
          },
        },
        editor: {
          select: {
            id: true,
            lastname: true,
            firstname: true,
          },
        },
        BookGenre: {
          select: {
            genreId: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    books = await Promise.all(
      books.map(async (book) => {
        // Get the genres
        const genres = await this.prismaService.genre.findMany({
          select: {
            id: true,
            name: true,
            slug: true,
          },
          where: {
            id: {
              in: book.BookGenre.map((bg) => bg.genreId),
            },
          },
        });
        // remove the BookGenre
        delete book.BookGenre;

        // Get the file URL
        // book['fileUrl'] = book.file
        //   ? await this.minioService.getFileUrl(book.file)
        //   : null;
        book['coverUrl'] = book.cover
          ? await this.minioService.getFileUrl(book.cover)
          : null;

        return book;
      }),
    );

    // Return the response
    return {
      message: 'Books found',
      data: books,
    };
  }

  async getTops() {
    let books = await this.prismaService.book.findMany({
      include: {
        author: {
          select: {
            id: true,
            name: true,
            slug: true,
            biography: true,
          },
        },
        editor: {
          select: {
            id: true,
            lastname: true,
            firstname: true,
          },
        },
        BookGenre: {
          select: {
            genreId: true,
          },
        },
      },
      where: {
        isInTop: true,
      },
      orderBy: {
        rankInTop: 'asc',
      },
    });

    books = await Promise.all(
      books.map(async (book) => {
        // Get the genres
        const genres = await this.prismaService.genre.findMany({
          select: {
            id: true,
            name: true,
            slug: true,
          },
          where: {
            id: {
              in: book.BookGenre.map((bg) => bg.genreId),
            },
          },
        });
        // remove the BookGenre
        delete book.BookGenre;

        // Get the file URL
        // book['fileUrl'] = book.file
        //   ? await this.minioService.getFileUrl(book.file)
        //   : null;
        book['coverUrl'] = book.cover
          ? await this.minioService.getFileUrl(book.cover)
          : null;

        return book;
      }),
    );

    // Return the response
    return {
      message: 'Books found',
      data: books,
    };
  }

  async findOneBySlug(slug: string) {
    const book = await this.prismaService.book.findFirst({
      include: {
        author: {
          select: {
            id: true,
            name: true,
            slug: true,
            biography: true,
          },
        },
        editor: {
          select: {
            id: true,
            lastname: true,
            firstname: true,
          },
        },
        BookGenre: {
          select: {
            genreId: true,
          },
        },
      },
      where: {
        slug,
      },
    });
    if (!book) throw new NotFoundException('Book not found');

    // Get the genres
    const genres = await this.prismaService.genre.findMany({
      select: {
        id: true,
        name: true,
        slug: true,
      },
      where: {
        id: {
          in: book.BookGenre.map((bg) => bg.genreId),
        },
      },
    });
    // remove the BookGenre
    delete book.BookGenre;
    book['genres'] = genres;

    // Get the file URL
    book['coverUrl'] = book.cover
      ? await this.minioService.getFileUrl(book.cover)
      : null;

    // Return the response
    return {
      message: 'Book found',
      data: book,
    };
  }

  async findOne(id: number) {
    const book = await this.prismaService.book.findUnique({
      include: {
        author: {
          select: {
            id: true,
            name: true,
            slug: true,
            biography: true,
          },
        },
        editor: {
          select: {
            id: true,
            lastname: true,
            firstname: true,
          },
        },
        BookGenre: {
          select: {
            genreId: true,
          },
        },
      },
      where: {
        id,
      },
    });
    if (!book) throw new NotFoundException('Book not found');

    // Get the genres
    const genres = await this.prismaService.genre.findMany({
      select: {
        id: true,
        name: true,
        slug: true,
      },
      where: {
        id: {
          in: book.BookGenre.map((bg) => bg.genreId),
        },
      },
    });
    // remove the BookGenre
    delete book.BookGenre;
    book['genres'] = genres;

    // Get the file URL
    book['fileUrl'] = book.file
      ? await this.minioService.getFileUrl(book.file)
      : null;
    book['coverUrl'] = book.cover
      ? await this.minioService.getFileUrl(book.cover)
      : null;

    // Return the response
    return {
      message: 'Book found',
      data: book,
    };
  }

  async update(id: number, updateBookDto: UpdateBookDto) {
    const { title, summary, pages, releaseDate, genres } = updateBookDto;

    // Find the Book
    let book = await this.prismaService.book.findUnique({
      where: {
        id,
      },
    });
    if (!book) throw new NotFoundException('Book not found');

    // Update the Book
    let bookUpdated = await this.prismaService.book.update({
      where: {
        id,
      },
      data: {
        title,
        summary,
        pages,
        releaseDate: new Date(releaseDate),
      },
    });
    if (!bookUpdated)
      throw new InternalServerErrorException('Error while updating the book');

    // Remove all genres
    await this.prismaService.bookGenre.deleteMany({
      where: {
        bookId: id,
      },
    });

    // Add genres to the book
    genres.forEach(async (genre) => {
      // Create the book genre
      const bookGenre = await this.prismaService.bookGenre.create({
        data: {
          genreId: genre,
          bookId: id,
        },
      });
      if (!bookGenre)
        throw new InternalServerErrorException(
          'An error occurred while creating book genre',
        );
    });

    return {
      message: 'Book updated',
      data: bookUpdated,
    };
  }

  async changeStatus(id: number, changeStatusBookDto: ChangeStatusBookDto) {
    const { status } = changeStatusBookDto;
    // Find the Book
    let book = await this.prismaService.book.findUnique({
      where: {
        id,
      },
    });
    if (!book) throw new NotFoundException('Book not found');
    // Verify if the status is different
    if (book.status == status)
      throw new ConflictException('Status already set');
    // Update the Book
    let bookUpdated = await this.prismaService.book.update({
      where: {
        id,
      },
      data: {
        status: status,
      },
    });
    if (!bookUpdated)
      throw new InternalServerErrorException('Error while updating the book');
    return {
      message: 'Book status updated',
      data: bookUpdated,
    };
  }
}
