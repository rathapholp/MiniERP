import { IsInt, IsOptional, IsString, IsDateString, IsArray, ValidateNested, IsNumber, Min } from 'class-validator';
import { Type } from 'class-transformer';

export class InvoiceLineDto {
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  productId?: number;

  @IsString()
  description: string;

  @Type(() => Number)
  @IsNumber()
  @Min(0)
  qty: number;

  @Type(() => Number)
  @IsNumber()
  @Min(0)
  unitPrice: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  vatRate?: number;
}

export class CreateInvoiceDto {
  @Type(() => Number)
  @IsInt()
  contactId: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  quotationId?: number;

  @IsDateString()
  date: string;

  @IsOptional()
  @IsDateString()
  dueDate?: string;

  @IsOptional()
  @IsString()
  note?: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => InvoiceLineDto)
  lines: InvoiceLineDto[];
}
