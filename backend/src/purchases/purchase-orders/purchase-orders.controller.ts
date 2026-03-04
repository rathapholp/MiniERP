import { Controller, Get, Post, Delete, Patch, Param, Body, Query, UseGuards, ParseIntPipe } from '@nestjs/common';
import { PurchaseOrdersService } from './purchase-orders.service';
import { CreatePurchaseOrderDto } from './dto/create-purchase-order.dto';
import { UpdatePoStatusDto } from './dto/update-po-status.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { PurchaseOrderStatus } from '@prisma/client';

@UseGuards(JwtAuthGuard)
@Controller('purchase-orders')
export class PurchaseOrdersController {
  constructor(private service: PurchaseOrdersService) {}

  @Get()
  findAll(@Query('search') search?: string, @Query('status') status?: PurchaseOrderStatus) {
    return this.service.findAll(search, status);
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) { return this.service.findOne(id); }

  @Post()
  create(@Body() dto: CreatePurchaseOrderDto) { return this.service.create(dto); }

  @Patch(':id/status')
  updateStatus(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdatePoStatusDto) {
    return this.service.updateStatus(id, dto);
  }

  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) { return this.service.remove(id); }
}
