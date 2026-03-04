import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { DocumentSequenceService } from '../document-sequence.service';
import { CreateReceiptDto } from './dto/create-receipt.dto';

@Injectable()
export class ReceiptsService {
  constructor(private prisma: PrismaService, private seqService: DocumentSequenceService) {}

  findAll(invoiceId?: number) {
    return this.prisma.receipt.findMany({
      where: invoiceId ? { invoiceId } : undefined,
      include: { invoice: { select: { number: true, total: true, contact: { select: { name: true } } } } },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: number) {
    const r = await this.prisma.receipt.findUnique({ where: { id }, include: { invoice: true } });
    if (!r) throw new NotFoundException(`Receipt #${id} not found`);
    return r;
  }

  async create(dto: CreateReceiptDto) {
    const invoice = await this.prisma.invoice.findUnique({ where: { id: dto.invoiceId } });
    if (!invoice) throw new NotFoundException(`Invoice #${dto.invoiceId} not found`);
    if (invoice.status === 'PAID') throw new BadRequestException('Invoice is already fully paid');
    if (invoice.status === 'VOID' || invoice.status === 'CANCELLED') throw new BadRequestException('Cannot pay a voided/cancelled invoice');

    const number = await this.seqService.nextNumber('RC');

    return this.prisma.$transaction(async (tx) => {
      const receipt = await tx.receipt.create({
        data: {
          number,
          invoiceId: dto.invoiceId,
          date: new Date(dto.date),
          amount: dto.amount,
          paymentMethod: dto.paymentMethod,
          reference: dto.reference,
          note: dto.note,
        },
      });

      const newPaid = Number(invoice.paidAmount) + dto.amount;
      const newStatus = newPaid >= Number(invoice.total) ? 'PAID' : 'PARTIAL';
      await tx.invoice.update({ where: { id: dto.invoiceId }, data: { paidAmount: newPaid, status: newStatus } });

      return receipt;
    });
  }

  async remove(id: number) {
    await this.findOne(id);
    return this.prisma.receipt.delete({ where: { id } });
  }
}
