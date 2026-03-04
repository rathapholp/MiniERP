import { IsInt, IsOptional, IsString, IsDateString, IsArray, ValidateNested, IsNumber, Min } from 'class-validator';
import { Type } from 'class-transformer';

export class PurchaseOrderLineDto {
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

export class CreatePurchaseOrderDto {
  @Type(() => Number)
  @IsInt()
  contactId: number;

  @IsDateString()
  date: string;

  @IsOptional()
  @IsDateString()
  expectedDate?: string;

  @IsOptional()
  @IsString()
  note?: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => PurchaseOrderLineDto)
  lines: PurchaseOrderLineDto[];
}
