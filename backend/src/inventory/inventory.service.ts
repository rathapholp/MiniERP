import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { AdjustStockDto } from './dto/adjust-stock.dto';

@Injectable()
export class InventoryService {
  constructor(private prisma: PrismaService) {}

  async getStockList(search?: string) {
    return this.prisma.product.findMany({
      where: search
        ? { OR: [{ name: { contains: search, mode: 'insensitive' } }, { code: { contains: search, mode: 'insensitive' } }] }
        : undefined,
      select: { id: true, code: true, name: true, unit: true, stockQty: true, costPrice: true, sellPrice: true, category: { select: { name: true } } },
      orderBy: { code: 'asc' },
    });
  }

  async getMovements(productId?: number, page = 1, limit = 50) {
    const skip = (page - 1) * limit;
    const where = productId ? { productId } : undefined;
    const [data, total] = await Promise.all([
      this.prisma.stockMovement.findMany({
        where,
        include: { product: { select: { code: true, name: true, unit: true } } },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      this.prisma.stockMovement.count({ where }),
    ]);
    return { data, total, page, limit };
  }

  async adjust(dto: AdjustStockDto) {
    const product = await this.prisma.product.findUnique({ where: { id: dto.productId } });
    if (!product) throw new NotFoundException(`Product #${dto.productId} not found`);

    const newQty = Number(product.stockQty) + dto.qty;
    if (newQty < 0) throw new BadRequestException('Stock quantity cannot be negative');

    return this.prisma.$transaction(async (tx) => {
      const updated = await tx.product.update({
        where: { id: dto.productId },
        data: { stockQty: newQty },
      });
      await tx.stockMovement.create({
        data: {
          productId: dto.productId,
          type: 'ADJUST',
          qty: dto.qty,
          balanceQty: newQty,
          note: dto.note,
        },
      });
      return updated;
    });
  }
}
