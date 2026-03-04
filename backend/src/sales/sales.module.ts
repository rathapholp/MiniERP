import { Module } from '@nestjs/common';
import { DocumentSequenceService } from './document-sequence.service';
import { QuotationsService } from './quotations/quotations.service';
import { QuotationsController } from './quotations/quotations.controller';
import { InvoicesService } from './invoices/invoices.service';
import { InvoicesController } from './invoices/invoices.controller';
import { ReceiptsService } from './receipts/receipts.service';
import { ReceiptsController } from './receipts/receipts.controller';

@Module({
  providers: [DocumentSequenceService, QuotationsService, InvoicesService, ReceiptsService],
  controllers: [QuotationsController, InvoicesController, ReceiptsController],
  exports: [DocumentSequenceService],
})
export class SalesModule {}
