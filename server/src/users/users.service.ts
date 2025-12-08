import { Injectable } from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';
import { RequestUser } from '../auth/current-user.decorator';

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

  async getOrCreateFromJwt(user: RequestUser) {
    if (!user?.userId) {
      throw new Error('JWT payload missing subject');
    }

    return this.prisma.user.upsert({
      where: { id: user.userId },
      update: {
        email: user.email ?? undefined,
        displayName: user.email ?? user.userId,
      },
      create: {
        id: user.userId,
        email: user.email ?? `${user.userId}@example.com`,
        displayName: user.email ?? user.userId,
        role: 'STUDENT',
      },
    });
  }
}
