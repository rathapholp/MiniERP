import { Controller, Get, Post, Put, Delete, Patch, Param, Body, Query, UseGuards, ParseIntPipe } from '@nestjs/common';
import { InvoicesService } from './invoices.service';
import { CreateInvoiceDto } from './dto/create-invoice.dto';
import { UpdateInvoiceStatusDto } from './dto/update-invoice-status.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { InvoiceStatus } from '@prisma/client';

@UseGuards(JwtAuthGuard)
@Controller('invoices')
export class InvoicesController {
  constructor(private service: InvoicesService) {}

  @Get()
  findAll(@Query('search') search?: string, @Query('status') status?: InvoiceStatus) {
    return this.service.findAll(search, status);
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) { return this.service.findOne(id); }

  @Post()
  create(@Body() dto: CreateInvoiceDto) { return this.service.create(dto); }

  @Patch(':id/status')
  updateStatus(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateInvoiceStatusDto) {
    return this.service.updateStatus(id, dto);
  }

  @Post(':id/void')
  void(@Param('id', ParseIntPipe) id: number) { return this.service.void(id); }

  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) { return this.service.remove(id); }
}
