import { Module } from '@nestjs/common';
import { ProductsService } from './products.service';
import { ProductsController } from './products.controller';
import { CategoriesService } from './categories.service';
import { CategoriesController } from './categories.controller';

@Module({
  providers: [ProductsService, CategoriesService],
  controllers: [ProductsController, CategoriesController],
  exports: [ProductsService],
})
export class ProductsModule {}
