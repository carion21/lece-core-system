import { PrismaClient } from '@prisma/client';
import { Consts } from '../utilities/constants';
import { genProfileCode, genUserCode } from '../utilities/functions';

import * as bcrypt from 'bcrypt';
import { ConfigService } from '@nestjs/config';

const prisma = new PrismaClient();
const configService = new ConfigService();

async function main() {
  Consts.DEFAULT_PROFILES.forEach(async (profile) => {
    await prisma.profile.deleteMany({});
    await new Promise((resolve) => setTimeout(resolve, 1000));
    await prisma.profile.create({
      data: {
        code: genProfileCode(),
        label: `Profil ${profile['label']}`,
        value: profile['value'],
        description: `Il s'agit du profil ${profile['value']}`,
      },
    });
  });

  // patienter 2 secondes
  await new Promise((resolve) => setTimeout(resolve, 2000));

  Consts.DEFAULT_USERS.forEach(async (user) => {
    const root_profile = await prisma.profile.findFirst({
      where: {
        value: 'root',
      },
    });
    const admin_profile = await prisma.profile.findFirst({
      where: {
        value: 'admin',
      },
    });
    let profileId =
      user.lastname === 'root' ? root_profile.id : admin_profile.id;

    const password = configService.get<string>('DEFAULT_PASSWORD');
    const hash = await bcrypt.hash(password, 10);
    await prisma.user.create({
      data: {
        code: genUserCode(),
        lastname: user.lastname,
        firstname: user.firstname,
        email: user.email,
        phone: user.phone,
        username: user.username,
        profileId: profileId,
        password: hash,
        status: true,
        createdBy: 1,
      },
    });
  });
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
