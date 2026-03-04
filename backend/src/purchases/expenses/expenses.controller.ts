import { Controller, Get, Post, Delete, Param, Body, Query, UseGuards, ParseIntPipe } from '@nestjs/common';
import { ExpensesService } from './expenses.service';
import { CreateExpenseDto } from './dto/create-expense.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { IsString } from 'class-validator';

class CreateCategoryDto { @IsString() name: string; }

@UseGuards(JwtAuthGuard)
@Controller('expenses')
export class ExpensesController {
  constructor(private service: ExpensesService) {}

  @Get()
  findAll(@Query('search') search?: string) { return this.service.findAll(search); }

  @Get('categories')
  findCategories() { return this.service.findCategories(); }

  @Post('categories')
  createCategory(@Body() body: CreateCategoryDto) { return this.service.createCategory(body.name); }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) { return this.service.findOne(id); }

  @Post()
  create(@Body() dto: CreateExpenseDto) { return this.service.create(dto); }

  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) { return this.service.remove(id); }
}
