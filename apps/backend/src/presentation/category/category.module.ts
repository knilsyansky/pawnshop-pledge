import { Module } from '@nestjs/common';
import { CategoryController } from './category.controller';
import { CategoryService } from '../../application/category/category.service';
import { PrismaService } from '../../infrastructure/prisma/prisma.service';

@Module({
  controllers: [CategoryController],
  providers: [CategoryService, PrismaService]
})
export class CategoryModule {}
