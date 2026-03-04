import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { DocumentSequenceService } from '../../sales/document-sequence.service';
import { CreateBillDto } from './dto/create-bill.dto';
import { PayBillDto } from './dto/pay-bill.dto';
import { BillStatus } from '@prisma/client';

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
export class BillsService {
  constructor(private prisma: PrismaService, private seqService: DocumentSequenceService) {}

  findAll(search?: string, status?: BillStatus) {
    return this.prisma.bill.findMany({
      where: {
        ...(status && { status }),
        ...(search && { OR: [{ number: { contains: search, mode: 'insensitive' } }, { contact: { name: { contains: search, mode: 'insensitive' } } }] }),
      },
      include: { contact: { select: { name: true, code: true } } },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: number) {
    const bill = await this.prisma.bill.findUnique({
      where: { id },
      include: { contact: true, lines: { include: { product: { select: { code: true, name: true, unit: true } } } }, payments: true },
    });
    if (!bill) throw new NotFoundException(`Bill #${id} not found`);
    return bill;
  }

  async create(dto: CreateBillDto) {
    const number = await this.seqService.nextNumber('BL');
    const lines = calcLines(dto.lines);
    const { subtotal, vatAmount, total } = sumTotals(lines);

    return this.prisma.$transaction(async (tx) => {
      const bill = await tx.bill.create({
        data: {
          number,
          contactId: dto.contactId,
          purchaseOrderId: dto.purchaseOrderId ?? null,
          date: new Date(dto.date),
          dueDate: dto.dueDate ? new Date(dto.dueDate) : null,
          note: dto.note,
          status: 'RECEIVED',
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

      // Increase stock for product lines
      for (const line of lines) {
        if (line.productId) {
          const product = await tx.product.findUnique({ where: { id: line.productId } });
          if (product) {
            const newQty = Number(product.stockQty) + Number(line.qty);
            await tx.product.update({ where: { id: line.productId }, data: { stockQty: newQty } });
            await tx.stockMovement.create({
              data: { productId: line.productId, type: 'IN', qty: Number(line.qty), balanceQty: newQty, refType: 'BILL', refId: bill.id },
            });
          }
        }
      }

      return bill;
    });
  }

  async pay(id: number, dto: PayBillDto) {
    const bill = await this.findOne(id);
    if (bill.status === 'PAID') throw new BadRequestException('Bill already paid');
    if (bill.status === 'CANCELLED') throw new BadRequestException('Cannot pay a cancelled bill');

    return this.prisma.$transaction(async (tx) => {
      const payment = await tx.billPayment.create({
        data: {
          billId: id,
          date: new Date(dto.date),
          amount: dto.amount,
          paymentMethod: dto.paymentMethod,
          reference: dto.reference,
          note: dto.note,
        },
      });
      const newPaid = Number(bill.paidAmount) + dto.amount;
      const newStatus = newPaid >= Number(bill.total) ? 'PAID' : 'PARTIAL';
      await tx.bill.update({ where: { id }, data: { paidAmount: newPaid, status: newStatus } });
      return payment;
    });
  }

  async remove(id: number) {
    await this.findOne(id);
    return this.prisma.bill.delete({ where: { id } });
  }
}
