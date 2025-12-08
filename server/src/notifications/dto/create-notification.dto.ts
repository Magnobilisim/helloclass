import { IsIn, IsNotEmpty, IsOptional, IsString } from 'class-validator';

const NOTIFICATION_TYPES = ['info', 'success', 'warning', 'error'] as const;
export type NotificationType = (typeof NOTIFICATION_TYPES)[number];

export class CreateNotificationDto {
  @IsString()
  @IsNotEmpty()
  userId: string;

  @IsString()
  @IsNotEmpty()
  title: string;

  @IsString()
  @IsNotEmpty()
  message: string;

  @IsString()
  @IsIn(NOTIFICATION_TYPES)
  type: NotificationType;

  @IsOptional()
  @IsString()
  link?: string;
}
