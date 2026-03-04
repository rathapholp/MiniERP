import { Controller, Get, Post, Body, Query, UseGuards, ParseIntPipe, ParseFloatPipe, Optional } from '@nestjs/common';
import { InventoryService } from './inventory.service';
import { AdjustStockDto } from './dto/adjust-stock.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';

@UseGuards(JwtAuthGuard)
@Controller('inventory')
export class InventoryController {
  constructor(private service: InventoryService) {}

  @Get()
  getStockList(@Query('search') search?: string) {
    return this.service.getStockList(search);
  }

  @Get('movements')
  getMovements(
    @Query('productId') productId?: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    return this.service.getMovements(
      productId ? parseInt(productId) : undefined,
      page ? parseInt(page) : 1,
      limit ? parseInt(limit) : 50,
    );
  }

  @Post('adjust')
  adjust(@Body() dto: AdjustStockDto) {
    return this.service.adjust(dto);
  }
}
