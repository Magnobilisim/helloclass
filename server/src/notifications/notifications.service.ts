import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';
import { CreateNotificationDto } from './dto/create-notification.dto';

@Injectable()
export class NotificationsService {
  constructor(private readonly prisma: PrismaService) {}

  listForUser(userId: string, isRead?: boolean) {
    return this.prisma.notification.findMany({
      where: {
        userId,
        ...(isRead === undefined ? {} : { isRead }),
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  create(dto: CreateNotificationDto) {
    return this.prisma.notification.create({
      data: {
        userId: dto.userId,
        title: dto.title,
        message: dto.message,
        type: dto.type,
        link: dto.link,
      },
    });
  }

  async markAsRead(notificationId: string, userId: string) {
    const notif = await this.prisma.notification.findUnique({ where: { id: notificationId } });
    if (!notif) {
      throw new NotFoundException('Notification not found');
    }
    if (notif.userId !== userId) {
      throw new ForbiddenException('Cannot modify notification belonging to another user');
    }

    return this.prisma.notification.update({
      where: { id: notificationId },
      data: { isRead: true },
    });
  }

  markAllAsRead(userId: string) {
    return this.prisma.notification.updateMany({
      where: { userId, isRead: false },
      data: { isRead: true },
    });
  }
}
