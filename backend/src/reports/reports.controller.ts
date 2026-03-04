import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { ReportsService } from './reports.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';

@UseGuards(JwtAuthGuard)
@Controller('reports')
export class ReportsController {
  constructor(private service: ReportsService) {}

  @Get('dashboard')
  getDashboard() { return this.service.getDashboard(); }

  @Get('profit-loss')
  getProfitLoss(@Query('startDate') startDate: string, @Query('endDate') endDate: string) {
    return this.service.getProfitLoss(startDate, endDate);
  }

  @Get('sales-summary')
  getSalesSummary(@Query('startDate') startDate: string, @Query('endDate') endDate: string) {
    return this.service.getSalesSummary(startDate, endDate);
  }

  @Get('receivables')
  getReceivables() { return this.service.getReceivables(); }

  @Get('payables')
  getPayables() { return this.service.getPayables(); }

  @Get('inventory-value')
  getInventoryValue() { return this.service.getInventoryValue(); }
}
