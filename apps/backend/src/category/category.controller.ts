import { Controller, Get } from '@nestjs/common';

@Controller('categories')
export class CategoryController {
  @Get()
  findAll() {
    return [];
  }
}
