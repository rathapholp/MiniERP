import { IsEnum } from 'class-validator';
import { PurchaseOrderStatus } from '@prisma/client';

export class UpdatePoStatusDto {
  @IsEnum(PurchaseOrderStatus)
  status: PurchaseOrderStatus;
}
