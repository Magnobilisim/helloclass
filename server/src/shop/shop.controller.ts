import { Body, Controller, Delete, Get, Param, Patch, Post, Query, UseGuards } from '@nestjs/common';
import { ShopService } from './shop.service';
import { CreateShopItemDto } from './dto/create-shop-item.dto';
import { UpdateShopItemDto } from './dto/update-shop-item.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { PurchaseItemDto } from './dto/purchase-item.dto';
import { CurrentUser, RequestUser } from '../auth/current-user.decorator';

@Controller('shop')
export class ShopController {
  constructor(private readonly shopService: ShopService) {}

  @Get('items')
  listItems(@Query('includeInactive') includeInactive?: string) {
    return this.shopService.listItems(!this.toBoolean(includeInactive));
  }

  @UseGuards(JwtAuthGuard)
  @Post('items')
  createItem(@Body() dto: CreateShopItemDto) {
    return this.shopService.createItem(dto);
  }

  @UseGuards(JwtAuthGuard)
  @Patch('items/:id')
  updateItem(@Param('id') id: string, @Body() dto: UpdateShopItemDto) {
    return this.shopService.updateItem(id, dto);
  }

  @UseGuards(JwtAuthGuard)
  @Delete('items/:id')
  deleteItem(@Param('id') id: string) {
    return this.shopService.deleteItem(id);
  }

  @UseGuards(JwtAuthGuard)
  @Post('purchase')
  purchase(@Body() dto: PurchaseItemDto, @CurrentUser() user: RequestUser) {
    return this.shopService.purchaseItem(user.userId, dto);
  }

  @UseGuards(JwtAuthGuard)
  @Get('purchases')
  listPurchases(@CurrentUser() user: RequestUser) {
    return this.shopService.listPurchases(user.userId);
  }

  private toBoolean(value?: string) {
    return value === 'true' || value === '1';
  }
}
