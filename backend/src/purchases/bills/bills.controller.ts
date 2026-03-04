import { Controller, Get, Post, Delete, Param, Body, Query, UseGuards, ParseIntPipe } from '@nestjs/common';
import { BillsService } from './bills.service';
import { CreateBillDto } from './dto/create-bill.dto';
import { PayBillDto } from './dto/pay-bill.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { BillStatus } from '@prisma/client';

@UseGuards(JwtAuthGuard)
@Controller('bills')
export class BillsController {
  constructor(private service: BillsService) {}

  @Get()
  findAll(@Query('search') search?: string, @Query('status') status?: BillStatus) {
    return this.service.findAll(search, status);
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) { return this.service.findOne(id); }

  @Post()
  create(@Body() dto: CreateBillDto) { return this.service.create(dto); }

  @Post(':id/pay')
  pay(@Param('id', ParseIntPipe) id: number, @Body() dto: PayBillDto) {
    return this.service.pay(id, dto);
  }

  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) { return this.service.remove(id); }
}
