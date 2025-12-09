import { IsBoolean, IsIn, IsInt, IsNotEmpty, IsOptional, IsString, Min } from 'class-validator';

export const SHOP_ITEM_TYPES = ['AVATAR_FRAME', 'JOKER_5050', 'JOKER_SKIP', 'BUNDLE', 'GENERIC'] as const;
export type ShopItemType = (typeof SHOP_ITEM_TYPES)[number];

export class CreateShopItemDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsIn(SHOP_ITEM_TYPES)
  type: ShopItemType;

  @IsInt()
  @Min(0)
  price: number;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  metadata?: Record<string, any>;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
