import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { DocumentSequenceService } from '../document-sequence.service';
import { CreateQuotationDto } from './dto/create-quotation.dto';
import { UpdateQuotationStatusDto } from './dto/update-quotation-status.dto';
import { QuotationStatus } from '@prisma/client';

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
export class QuotationsService {
  constructor(private prisma: PrismaService, private seqService: DocumentSequenceService) {}

  findAll(search?: string, status?: QuotationStatus) {
    return this.prisma.quotation.findMany({
      where: {
        ...(status && { status }),
        ...(search && { OR: [{ number: { contains: search, mode: 'insensitive' } }, { contact: { name: { contains: search, mode: 'insensitive' } } }] }),
      },
      include: { contact: { select: { name: true, code: true } } },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: number) {
    const q = await this.prisma.quotation.findUnique({
      where: { id },
      include: { contact: true, lines: { include: { product: { select: { code: true, name: true, unit: true } } } } },
    });
    if (!q) throw new NotFoundException(`Quotation #${id} not found`);
    return q;
  }

  async create(dto: CreateQuotationDto) {
    const number = await this.seqService.nextNumber('QT');
    const lines = calcLines(dto.lines);
    const { subtotal, vatAmount, total } = sumTotals(lines);
    return this.prisma.quotation.create({
      data: {
        number,
        contactId: dto.contactId,
        date: new Date(dto.date),
        validUntil: dto.validUntil ? new Date(dto.validUntil) : null,
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

  async updateStatus(id: number, dto: UpdateQuotationStatusDto) {
    await this.findOne(id);
    return this.prisma.quotation.update({ where: { id }, data: { status: dto.status } });
  }

  async convertToInvoice(id: number) {
    const qt = await this.findOne(id);
    if (qt.status !== 'ACCEPTED') throw new BadRequestException('Quotation must be ACCEPTED to convert');
    const { InvoicesService } = await import('../invoices/invoices.service');
    // Return the quotation data for invoice creation
    return qt;
  }

  async remove(id: number) {
    await this.findOne(id);
    return this.prisma.quotation.delete({ where: { id } });
  }
}
