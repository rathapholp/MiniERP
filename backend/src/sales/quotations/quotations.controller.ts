import { Controller, Get, Post, Put, Delete, Patch, Param, Body, Query, UseGuards, ParseIntPipe } from '@nestjs/common';
import { QuotationsService } from './quotations.service';
import { CreateQuotationDto } from './dto/create-quotation.dto';
import { UpdateQuotationStatusDto } from './dto/update-quotation-status.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { QuotationStatus } from '@prisma/client';

@UseGuards(JwtAuthGuard)
@Controller('quotations')
export class QuotationsController {
  constructor(private service: QuotationsService) {}

  @Get()
  findAll(@Query('search') search?: string, @Query('status') status?: QuotationStatus) {
    return this.service.findAll(search, status);
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) { return this.service.findOne(id); }

  @Post()
  create(@Body() dto: CreateQuotationDto) { return this.service.create(dto); }

  @Patch(':id/status')
  updateStatus(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateQuotationStatusDto) {
    return this.service.updateStatus(id, dto);
  }

  @Post(':id/convert-invoice')
  convertToInvoice(@Param('id', ParseIntPipe) id: number) {
    return this.service.convertToInvoice(id);
  }

  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) { return this.service.remove(id); }
}
