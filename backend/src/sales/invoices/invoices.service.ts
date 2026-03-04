import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { DocumentSequenceService } from '../document-sequence.service';
import { CreateInvoiceDto } from './dto/create-invoice.dto';
import { UpdateInvoiceStatusDto } from './dto/update-invoice-status.dto';
import { InvoiceStatus } from '@prisma/client';

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
export class InvoicesService {
  constructor(private prisma: PrismaService, private seqService: DocumentSequenceService) {}

  findAll(search?: string, status?: InvoiceStatus) {
    return this.prisma.invoice.findMany({
      where: {
        ...(status && { status }),
        ...(search && { OR: [{ number: { contains: search, mode: 'insensitive' } }, { contact: { name: { contains: search, mode: 'insensitive' } } }] }),
      },
      include: { contact: { select: { name: true, code: true } } },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: number) {
    const inv = await this.prisma.invoice.findUnique({
      where: { id },
      include: { contact: true, lines: { include: { product: { select: { code: true, name: true, unit: true } } } }, receipts: true },
    });
    if (!inv) throw new NotFoundException(`Invoice #${id} not found`);
    return inv;
  }

  async create(dto: CreateInvoiceDto) {
    const number = await this.seqService.nextNumber('IV');
    const lines = calcLines(dto.lines);
    const { subtotal, vatAmount, total } = sumTotals(lines);

    return this.prisma.$transaction(async (tx) => {
      const invoice = await tx.invoice.create({
        data: {
          number,
          contactId: dto.contactId,
          quotationId: dto.quotationId ?? null,
          date: new Date(dto.date),
          dueDate: dto.dueDate ? new Date(dto.dueDate) : null,
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
        include: { contact: true, lines: { include: { product: true } } },
      });

      // Deduct stock for product lines
      for (const line of lines) {
        if (line.productId) {
          const product = await tx.product.findUnique({ where: { id: line.productId } });
          if (product) {
            const newQty = Number(product.stockQty) - Number(line.qty);
            await tx.product.update({ where: { id: line.productId }, data: { stockQty: newQty } });
            await tx.stockMovement.create({
              data: { productId: line.productId, type: 'OUT', qty: -Number(line.qty), balanceQty: newQty, refType: 'INVOICE', refId: invoice.id },
            });
          }
        }
      }

      return invoice;
    });
  }

  async updateStatus(id: number, dto: UpdateInvoiceStatusDto) {
    await this.findOne(id);
    return this.prisma.invoice.update({ where: { id }, data: { status: dto.status } });
  }

  async void(id: number) {
    const inv = await this.findOne(id);
    if (inv.status === 'VOID') throw new BadRequestException('Invoice already voided');
    return this.prisma.invoice.update({ where: { id }, data: { status: 'VOID' } });
  }

  async remove(id: number) {
    await this.findOne(id);
    return this.prisma.invoice.delete({ where: { id } });
  }
}
