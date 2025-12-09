import { Body, Controller, Get, Param, Patch, Post, Query, UseGuards, ForbiddenException } from '@nestjs/common';
import { NotificationsService } from './notifications.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CurrentUser, RequestUser } from '../auth/current-user.decorator';
import { CreateNotificationDto } from './dto/create-notification.dto';

@UseGuards(JwtAuthGuard)
@Controller('notifications')
export class NotificationsController {
  constructor(private readonly notificationsService: NotificationsService) {}

  @Get()
  list(@CurrentUser() user: RequestUser, @Query('isRead') isRead?: string) {
    return this.notificationsService.listForUser(user.userId, this.toBoolean(isRead));
  }

  @Post()
  create(@Body() dto: CreateNotificationDto, @CurrentUser() user: RequestUser) {
    if (dto.userId !== user.userId) {
      throw new ForbiddenException('Users can only create notifications for themselves');
    }
    return this.notificationsService.create(dto);
  }

  @Patch(':id/read')
  markRead(@Param('id') id: string, @CurrentUser() user: RequestUser) {
    return this.notificationsService.markAsRead(id, user.userId);
  }

  @Patch('read-all')
  markAll(@CurrentUser() user: RequestUser) {
    return this.notificationsService.markAllAsRead(user.userId);
  }

  private toBoolean(value?: string) {
    if (value === undefined) return undefined;
    return value === 'true' || value === '1';
  }
}
