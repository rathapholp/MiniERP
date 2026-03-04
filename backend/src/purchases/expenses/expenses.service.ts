import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { DocumentSequenceService } from '../../sales/document-sequence.service';
import { CreateExpenseDto } from './dto/create-expense.dto';

@Injectable()
export class ExpensesService {
  constructor(private prisma: PrismaService, private seqService: DocumentSequenceService) {}

  findAll(search?: string) {
    return this.prisma.expense.findMany({
      where: search ? { description: { contains: search, mode: 'insensitive' } } : undefined,
      include: { category: { select: { name: true } } },
      orderBy: { date: 'desc' },
    });
  }

  async findOne(id: number) {
    const e = await this.prisma.expense.findUnique({ where: { id }, include: { category: true } });
    if (!e) throw new NotFoundException(`Expense #${id} not found`);
    return e;
  }

  async create(dto: CreateExpenseDto) {
    const number = await this.seqService.nextNumber('EX');
    const vatAmount = dto.vatAmount ?? 0;
    const total = dto.amount + vatAmount;
    return this.prisma.expense.create({
      data: {
        number,
        categoryId: dto.categoryId ?? null,
        date: new Date(dto.date),
        description: dto.description,
        amount: dto.amount,
        vatAmount,
        total,
        paymentMethod: dto.paymentMethod ?? null,
        reference: dto.reference,
        note: dto.note,
      },
      include: { category: true },
    });
  }

  async remove(id: number) {
    await this.findOne(id);
    return this.prisma.expense.delete({ where: { id } });
  }

  findCategories() {
    return this.prisma.expenseCategory.findMany({ orderBy: { name: 'asc' } });
  }

  createCategory(name: string) {
    return this.prisma.expenseCategory.create({ data: { name } });
  }
}
