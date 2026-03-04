import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { DocumentSequenceService } from '../../sales/document-sequence.service';
import { CreatePurchaseOrderDto } from './dto/create-purchase-order.dto';
import { UpdatePoStatusDto } from './dto/update-po-status.dto';
import { PurchaseOrderStatus } from '@prisma/client';

function calcLines(lines: any[]) {
  return lines.map((l) => {
    const vatRate = l.vatRate ?? 7;
    const lineSubtotal = Number(l.qty) * Number(l.unitPrice);
    const vatAmount = lineSubtotal * (vatRate / 100);
    return { ...l, vatRate, vatAmount, amount: lineSubtotal + vatAmount };
  });
}

function sumTotals(lines: any[]) {
  const subtotal = lines.reduce((s, l) => s + Number(l.qty) * Number(l.unitPrice), 0);
  const vatAmount = lines.reduce((s, l) => s + Number(l.vatAmount), 0);
  return { subtotal, vatAmount, total: subtotal + vatAmount };
}

@Injectable()
export class PurchaseOrdersService {
  constructor(private prisma: PrismaService, private seqService: DocumentSequenceService) {}

  findAll(search?: string, status?: PurchaseOrderStatus) {
    return this.prisma.purchaseOrder.findMany({
      where: {
        ...(status && { status }),
        ...(search && { OR: [{ number: { contains: search, mode: 'insensitive' } }, { contact: { name: { contains: search, mode: 'insensitive' } } }] }),
      },
      include: { contact: { select: { name: true, code: true } } },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: number) {
    const po = await this.prisma.purchaseOrder.findUnique({
      where: { id },
      include: { contact: true, lines: { include: { product: { select: { code: true, name: true, unit: true } } } } },
    });
    if (!po) throw new NotFoundException(`PurchaseOrder #${id} not found`);
    return po;
  }

  async create(dto: CreatePurchaseOrderDto) {
    const number = await this.seqService.nextNumber('PO');
    const lines = calcLines(dto.lines);
    const { subtotal, vatAmount, total } = sumTotals(lines);
    return this.prisma.purchaseOrder.create({
      data: {
        number,
        contactId: dto.contactId,
        date: new Date(dto.date),
        expectedDate: dto.expectedDate ? new Date(dto.expectedDate) : null,
        note: dto.note,
        subtotal,
        vatAmount,
        total,
        lines: {
          create: lines.map((l) => ({
            productId: l.productId ?? null,
            description: l.description,
            qty: l.qty,
            unitPrice: l.unitPrice,
            vatRate: l.vatRate,
            vatAmount: l.vatAmount,
            amount: l.amount,
          })),
        },
      },
      include: { contact: true, lines: true },
    });
  }

  async updateStatus(id: number, dto: UpdatePoStatusDto) {
    await this.findOne(id);
    return this.prisma.purchaseOrder.update({ where: { id }, data: { status: dto.status } });
  }

  async remove(id: number) {
    await this.findOne(id);
    return this.prisma.purchaseOrder.delete({ where: { id } });
  }
}
