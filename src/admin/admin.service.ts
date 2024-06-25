import {
  ConflictException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { CreateAdminDto } from './dto/create-admin.dto';
import { UpdateAdminDto } from './dto/update-admin.dto';
import { PrismaService } from 'src/prisma/prisma.service';

import * as bcrypt from 'bcrypt';
import { genUserCode, getUiAvatar } from 'utilities/functions';
import { ChangeStatusAdminDto } from './dto/change-status-admin.dto';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class AdminService {
  constructor(
    private readonly prismaService: PrismaService,
    private readonly configService: ConfigService,
  ) {}

  async create(createAdminDto: CreateAdminDto, userAuthenticated: object) {
    const { lastname, firstname, email, phone, password } = createAdminDto;
    // Verify if the email is already used
    const user = await this.prismaService.user.findFirst({
      where: {
        email,
      },
    });
    if (user) throw new ConflictException('Email already used');

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);
    // Find the profile admin
    const profile = await this.prismaService.profile.findFirst({
      where: {
        value: 'admin',
      },
    });
    if (!profile)
      throw new InternalServerErrorException('Profile admin not found');
    // Create the user
    let admin = await this.prismaService.user.create({
      data: {
        code: genUserCode(),
        lastname,
        firstname,
        email,
        phone,
        password: hashedPassword,
        createdBy: userAuthenticated['id'],
        profileId: profile.id,
      },
    });
    if (!admin)
      throw new InternalServerErrorException('Error while creating the admin');
    // Return the response
    return {
      message: 'Admin created',
      data: admin,
    };
  }

  async findAll() {
    // Find all admins
    let admins = await this.prismaService.user.findMany({
      where: {
        profile: {
          value: 'admin',
        },
      },
      select: {
        id: true,
        code: true,
        lastname: true,
        firstname: true,
        email: true,
        phone: true,
        status: true,
        createdAt: true,
        updatedAt: true,
        profilePicture: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
    // generate ui avatar if profile picture is not available
    admins.forEach((admin) => {
      if (!admin.profilePicture) admin.profilePicture = getUiAvatar(admin);
    });
    // Return the response
    return {
      message: 'All admins',
      data: admins,
    };
  }

  async findOne(id: number) {
    // Find the admin
    let admin = await this.prismaService.user.findUnique({
      where: {
        id,
        profile: {
          value: 'admin',
        },
      },
      select: {
        id: true,
        code: true,
        lastname: true,
        firstname: true,
        email: true,
        phone: true,
        status: true,
        createdAt: true,
        updatedAt: true,
        profilePicture: true,
      },
    });
    if (!admin) throw new NotFoundException('Admin not found');
    // generate ui avatar if profile picture is not available
    if (!admin.profilePicture) admin.profilePicture = getUiAvatar(admin);
    // Return the response
    return {
      message: 'Admin found',
      data: admin,
    };
  }

  async update(id: number, updateAdminDto: UpdateAdminDto) {
    const { lastname, firstname, email, phone } = updateAdminDto;
    // Find the admin
    let admin = await this.prismaService.user.findUnique({
      where: {
        id,
        profile: {
          value: 'admin',
        },
      },
    });
    // Verify if the email is already used
    let email_used = await this.prismaService.user.findFirst({
      where: {
        email,
      },
    });
    if (email_used && email_used.id != admin.id)
      throw new ConflictException('Email already used');
    if (!admin) throw new NotFoundException('Admin not found');
    // Update the admin
    let admin_updated = await this.prismaService.user.update({
      where: {
        id,
        profile: {
          value: 'admin',
        },
      },
      data: {
        lastname,
        firstname,
        email,
        phone,
      },
    });
    if (!admin_updated)
      throw new InternalServerErrorException('Error while updating the admin');
    // Return the response
    return {
      message: 'Admin updated',
      data: admin_updated,
    };
  }

  async changeStatus(id: number, changeStatusAdminDto: ChangeStatusAdminDto) {
    const { status } = changeStatusAdminDto;
    // Find the admin
    let admin = await this.prismaService.user.findUnique({
      where: {
        id,
        profile: {
          value: 'admin',
        },
      },
    });
    if (!admin) throw new NotFoundException('Admin not found');
    // Verify if the status is different
    if (admin.status == status)
      throw new ConflictException('Status already set');
    // Update the admin
    let admin_updated = await this.prismaService.user.update({
      where: {
        id,
        profile: {
          value: 'admin',
        },
      },
      data: {
        status: status,
      },
    });
    if (!admin_updated)
      throw new InternalServerErrorException('Error while updating the admin');
    return {
      message: 'Admin status updated',
      data: admin_updated,
    };
  }
}
