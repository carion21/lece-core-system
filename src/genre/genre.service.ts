import {
  ConflictException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { CreateGenreDto } from './dto/create-genre.dto';
import { UpdateGenreDto } from './dto/update-genre.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { genGenreCode, getSlug } from 'utilities/functions';
import { ChangeStatusGenreDto } from './dto/change-status-genre.dto';
import { MinioService } from 'src/minio/minio.service';

@Injectable()
export class GenreService {
  constructor(
    private readonly prismaService: PrismaService,
    private readonly minioService: MinioService,
  ) {}

  async create(createGenreDto: CreateGenreDto) {
    const { name, description } = createGenreDto;
    // Verify if the genre already exists
    const slug = getSlug(name);
    const genreExists = await this.prismaService.genre.findFirst({
      where: {
        slug,
      },
    });
    if (genreExists) throw new ConflictException('Genre already exists');

    const genre = await this.prismaService.genre.create({
      data: {
        code: genGenreCode(),
        name,
        description,
        slug,
      },
    });
    if (!genre)
      throw new InternalServerErrorException('Error while creating the genre');

    // Return the response
    return {
      message: 'Genre created',
      data: genre,
    };
  }

  async findAll() {
    let genres = await this.prismaService.genre.findMany({
      include: {
        editor: {
          select: {
            id: true,
            lastname: true,
            firstname: true,
          },
        },
        BookGenre: {
          select: {
            bookId: true,
          },
        },
      },
      where: {
        deleted: false,
      },
      orderBy: {
        // name: 'asc',
        createdAt: 'desc',
      },
    });

    genres = await Promise.all(
      genres.map(async (genre) => {
        let books = await this.prismaService.book.findMany({
          select: {
            id: true,
            title: true,
            slug: true,
            summary: true,
            cover: true,
          },
          where: {
            id: {
              in: genre.BookGenre.map((bg) => bg.bookId),
            },
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
        delete genre.BookGenre;
        genre['books'] = books;
        return genre;
      }),
    );

    // Return the response
    return genres;
  }

  async findOneBySlug(slug: string) {
    // Find the genre
    const genre = await this.prismaService.genre.findFirst({
      include: {
        editor: {
          select: {
            id: true,
            lastname: true,
            firstname: true,
          },
        },
        BookGenre: {
          select: {
            bookId: true,
          },
        },
      },
      where: {
        slug,
        deleted: false,
      },
    });
    if (!genre) throw new NotFoundException('Genre not found');

    let books = await this.prismaService.book.findMany({
      select: {
        id: true,
        title: true,
        slug: true,
        summary: true,
        cover: true,
      },
      where: {
        id: {
          in: genre.BookGenre.map((bg) => bg.bookId),
        },
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
    delete genre.BookGenre;
    genre['books'] = books;

    // Return the response
    return {
      message: 'Genre found',
      data: genre,
    };
  }

  async findOne(id: number) {
    // Find the genre
    const genre = await this.prismaService.genre.findUnique({
      include: {
        editor: {
          select: {
            id: true,
            lastname: true,
            firstname: true,
          },
        },
        BookGenre: {
          select: {
            bookId: true,
          },
        },
      },
      where: {
        id,
        deleted: false,
      },
    });
    if (!genre) throw new NotFoundException('Genre not found');

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
        id: {
          in: genre.BookGenre.map((bg) => bg.bookId),
        },
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

    // Return the response
    return {
      message: 'Genre found',
      data: genre,
    };
  }

  async update(id: number, updateGenreDto: UpdateGenreDto) {
    const { name, description } = updateGenreDto;
    // Find the genre
    const genre = this.prismaService.genre.findUnique({
      where: {
        id,
        deleted: false,
      },
    });
    if (!genre) throw new NotFoundException('Genre not found');

    const slug = getSlug(name);
    const genreExists = await this.prismaService.genre.findFirst({
      where: {
        id: {
          not: id,
        },
        slug,
      },
    });
    if (genreExists) throw new ConflictException('Genre already exists');

    const genreUpdated = await this.prismaService.genre.update({
      where: {
        id,
      },
      data: {
        name,
        description,
        slug,
      },
    });
    if (!genreUpdated)
      throw new InternalServerErrorException('Error while updating the genre');

    // Return the response
    return {
      message: 'Genre updated',
      data: genreUpdated,
    };
  }

  async changeStatus(id: number, changeStatusGenreDto: ChangeStatusGenreDto) {
    const { status } = changeStatusGenreDto;
    // Find the Genre
    let genre = await this.prismaService.genre.findUnique({
      where: {
        id,
        deleted: false,
      },
    });
    if (!genre) throw new NotFoundException('Genre not found');
    // Verify if the status is different
    if (genre.status == status)
      throw new ConflictException('Status already set');
    // Update the Genre
    let genreUpdated = await this.prismaService.genre.update({
      where: {
        id,
      },
      data: {
        status: status,
      },
    });
    if (!genreUpdated)
      throw new InternalServerErrorException('Error while updating the genre');
    return {
      message: 'Genre status updated',
      data: genreUpdated,
    };
  }
}
