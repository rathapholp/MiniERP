import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ReportsService {
  constructor(private prisma: PrismaService) {}

  async getDashboard() {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    const [
      totalReceivable,
      totalPayable,
      monthlyRevenue,
      overdueInvoices,
      lowStockProducts,
      recentInvoices,
      recentBills,
    ] = await Promise.all([
      this.prisma.invoice.aggregate({
        where: { status: { in: ['SENT', 'PARTIAL', 'OVERDUE'] } },
        _sum: { total: true, paidAmount: true },
      }),
      this.prisma.bill.aggregate({
        where: { status: { in: ['RECEIVED', 'PARTIAL'] } },
        _sum: { total: true, paidAmount: true },
      }),
      this.prisma.invoice.aggregate({
        where: { status: 'PAID', date: { gte: startOfMonth } },
        _sum: { total: true },
      }),
      this.prisma.invoice.count({ where: { status: 'OVERDUE' } }),
      this.prisma.product.count({ where: { stockQty: { lte: 5 } } }),
      this.prisma.invoice.findMany({
        take: 5,
        orderBy: { createdAt: 'desc' },
        include: { contact: { select: { name: true } } },
        select: { id: true, number: true, total: true, status: true, date: true, contact: { select: { name: true } } },
      }),
      this.prisma.bill.findMany({
        take: 5,
        orderBy: { createdAt: 'desc' },
        include: { contact: { select: { name: true } } },
        select: { id: true, number: true, total: true, status: true, date: true, contact: { select: { name: true } } },
      }),
    ]);

    const receivableAmount = Number(totalReceivable._sum.total ?? 0) - Number(totalReceivable._sum.paidAmount ?? 0);
    const payableAmount = Number(totalPayable._sum.total ?? 0) - Number(totalPayable._sum.paidAmount ?? 0);

    return {
      totalReceivable: receivableAmount,
      totalPayable: payableAmount,
      monthlyRevenue: Number(monthlyRevenue._sum.total ?? 0),
      overdueCount: overdueInvoices,
      lowStockCount: lowStockProducts,
      recentInvoices,
      recentBills,
    };
  }

  async getProfitLoss(startDate: string, endDate: string) {
    const start = new Date(startDate);
    const end = new Date(endDate);

    const [revenue, expenses, costOfGoods] = await Promise.all([
      this.prisma.invoice.aggregate({
        where: { status: 'PAID', date: { gte: start, lte: end } },
        _sum: { subtotal: true, vatAmount: true, total: true },
      }),
      this.prisma.expense.aggregate({
        where: { date: { gte: start, lte: end }, status: { in: ['APPROVED', 'PAID'] } },
        _sum: { total: true },
      }),
      // Cost of goods sold (from invoice lines using product costPrice)
      this.prisma.$queryRaw<{ cogs: number }[]>`
        SELECT COALESCE(SUM(p.cost_price * il.qty), 0) as cogs
        FROM invoice_lines il
        JOIN invoices i ON i.id = il.invoice_id
        JOIN products p ON p.id = il.product_id
        WHERE i.status = 'PAID'
        AND i.date >= ${start}
        AND i.date <= ${end}
      `,
    ]);

    const totalRevenue = Number(revenue._sum.subtotal ?? 0);
    const totalExpenses = Number(expenses._sum.total ?? 0);
    const cogs = costOfGoods[0]?.cogs ? Number(costOfGoods[0].cogs) : 0;
    const grossProfit = totalRevenue - cogs;
    const netProfit = grossProfit - totalExpenses;

    return { totalRevenue, cogs, grossProfit, totalExpenses, netProfit };
  }

  async getSalesSummary(startDate: string, endDate: string) {
    const start = new Date(startDate);
    const end = new Date(endDate);

    const invoices = await this.prisma.invoice.findMany({
      where: { date: { gte: start, lte: end } },
      include: { contact: { select: { name: true } } },
      orderBy: { date: 'desc' },
    });

    const summary = await this.prisma.invoice.aggregate({
      where: { date: { gte: start, lte: end } },
      _sum: { subtotal: true, vatAmount: true, total: true },
      _count: true,
    });

    return { summary, invoices };
  }

  async getReceivables() {
    return this.prisma.invoice.findMany({
      where: { status: { in: ['SENT', 'PARTIAL', 'OVERDUE'] } },
      include: { contact: { select: { name: true, code: true } } },
      orderBy: { dueDate: 'asc' },
    });
  }

  async getPayables() {
    return this.prisma.bill.findMany({
      where: { status: { in: ['RECEIVED', 'PARTIAL'] } },
      include: { contact: { select: { name: true, code: true } } },
      orderBy: { dueDate: 'asc' },
    });
  }

  async getInventoryValue() {
    const products = await this.prisma.product.findMany({
      include: { category: { select: { name: true } } },
      orderBy: { code: 'asc' },
    });

    const items = products.map((p) => ({
      ...p,
      stockValue: Number(p.stockQty) * Number(p.costPrice),
    }));

    const totalValue = items.reduce((s, p) => s + p.stockValue, 0);
    return { totalValue, items };
  }
}
