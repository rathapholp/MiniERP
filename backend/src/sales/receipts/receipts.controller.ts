import { Controller, Get, Post, Delete, Param, Body, Query, UseGuards, ParseIntPipe } from '@nestjs/common';
import { ReceiptsService } from './receipts.service';
import { CreateReceiptDto } from './dto/create-receipt.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';

@UseGuards(JwtAuthGuard)
@Controller('receipts')
export class ReceiptsController {
  constructor(private service: ReceiptsService) {}

  @Get()
  findAll(@Query('invoiceId') invoiceId?: string) {
    return this.service.findAll(invoiceId ? parseInt(invoiceId) : undefined);
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) { return this.service.findOne(id); }

  @Post()
  create(@Body() dto: CreateReceiptDto) { return this.service.create(dto); }

  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) { return this.service.remove(id); }
}
