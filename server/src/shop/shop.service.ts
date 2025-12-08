import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';
import { CreateShopItemDto } from './dto/create-shop-item.dto';
import { UpdateShopItemDto } from './dto/update-shop-item.dto';
import { PurchaseItemDto } from './dto/purchase-item.dto';

@Injectable()
export class ShopService {
  constructor(private readonly prisma: PrismaService) {}

  listItems(onlyActive = true) {
    return this.prisma.shopItem.findMany({
      where: onlyActive ? { isActive: true } : undefined,
      orderBy: { createdAt: 'desc' },
    });
  }

  async getItem(id: string) {
    const item = await this.prisma.shopItem.findUnique({ where: { id } });
    if (!item) {
      throw new NotFoundException('Shop item not found');
    }
    return item;
  }

  createItem(dto: CreateShopItemDto) {
    return this.prisma.shopItem.create({
      data: {
        name: dto.name,
        type: dto.type,
        price: dto.price,
        description: dto.description,
        metadata: dto.metadata,
        isActive: dto.isActive ?? true,
      },
    });
  }

  async updateItem(id: string, dto: UpdateShopItemDto) {
    await this.getItem(id);
    return this.prisma.shopItem.update({
      where: { id },
      data: {
        name: dto.name,
        type: dto.type,
        price: dto.price,
        description: dto.description,
        metadata: dto.metadata,
        isActive: dto.isActive,
      },
    });
  }

  async deleteItem(id: string) {
    await this.getItem(id);
    await this.prisma.shopItem.delete({ where: { id } });
    return { id };
  }

  async purchaseItem(userId: string, dto: PurchaseItemDto) {
    const item = await this.prisma.shopItem.findFirst({
      where: { id: dto.itemId, isActive: true },
    });

    if (!item) {
      throw new NotFoundException('Shop item not available');
    }

    const amount = dto.amountOverride ?? item.price;

    return this.prisma.purchase.create({
      data: {
        itemId: item.id,
        userId,
        amount,
        currency: dto.currency ?? 'POINTS',
        source: dto.source ?? 'APP',
        providerReference: dto.providerReference,
      },
      include: {
        item: true,
      },
    });
  }

  listPurchases(userId: string) {
    return this.prisma.purchase.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      include: { item: true },
    });
  }
}
