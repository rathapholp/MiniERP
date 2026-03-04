import { Module } from '@nestjs/common';
import { SalesModule } from '../sales/sales.module';
import { PurchaseOrdersService } from './purchase-orders/purchase-orders.service';
import { PurchaseOrdersController } from './purchase-orders/purchase-orders.controller';
import { BillsService } from './bills/bills.service';
import { BillsController } from './bills/bills.controller';
import { ExpensesService } from './expenses/expenses.service';
import { ExpensesController } from './expenses/expenses.controller';

@Module({
  imports: [SalesModule],
  providers: [PurchaseOrdersService, BillsService, ExpensesService],
  controllers: [PurchaseOrdersController, BillsController, ExpensesController],
})
export class PurchasesModule {}
