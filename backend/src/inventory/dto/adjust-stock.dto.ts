import { IsInt, IsNumber, IsOptional, IsString, IsPositive } from 'class-validator';
import { Type } from 'class-transformer';

export class AdjustStockDto {
  @Type(() => Number)
  @IsInt()
  productId: number;

  @Type(() => Number)
  @IsNumber()
  qty: number;

  @IsOptional()
  @IsString()
  note?: string;
}
