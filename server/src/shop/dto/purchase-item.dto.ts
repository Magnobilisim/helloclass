import { IsIn, IsInt, IsNotEmpty, IsOptional, IsString, Min } from 'class-validator';

const PURCHASE_CURRENCIES = ['POINTS', 'TRY'] as const;

export class PurchaseItemDto {
  @IsString()
  @IsNotEmpty()
  itemId: string;

  @IsOptional()
  @IsInt()
  @Min(0)
  amountOverride?: number;

  @IsOptional()
  @IsString()
  @IsIn(PURCHASE_CURRENCIES)
  currency?: (typeof PURCHASE_CURRENCIES)[number];

  @IsOptional()
  @IsString()
  source?: string;

  @IsOptional()
  @IsString()
  providerReference?: string;
}
