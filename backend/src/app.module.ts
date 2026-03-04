import { Module } from '@nestjs/common';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { ContactsModule } from './contacts/contacts.module';
import { ProductsModule } from './products/products.module';
import { SalesModule } from './sales/sales.module';
import { PurchasesModule } from './purchases/purchases.module';
import { InventoryModule } from './inventory/inventory.module';
import { ReportsModule } from './reports/reports.module';

@Module({
  imports: [
    PrismaModule,
    AuthModule,
    UsersModule,
    ContactsModule,
    ProductsModule,
    SalesModule,
    PurchasesModule,
    InventoryModule,
    ReportsModule,
  ],
})
export class AppModule {}
