import { IsInt, IsOptional, IsString, IsDateString, IsNumber, Min, IsEnum } from 'class-validator';
import { Type } from 'class-transformer';
import { PaymentMethod } from '@prisma/client';

export class CreateReceiptDto {
  @Type(() => Number)
  @IsInt()
  invoiceId: number;

  @IsDateString()
  date: string;

  @Type(() => Number)
  @IsNumber()
  @Min(0.01)
  amount: number;

  @IsEnum(PaymentMethod)
  paymentMethod: PaymentMethod;

  @IsOptional()
  @IsString()
  reference?: string;

  @IsOptional()
  @IsString()
  note?: string;
}
