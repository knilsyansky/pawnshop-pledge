import { Controller, Get } from '@nestjs/common';

@Controller('tariffs')
export class TariffController {
  @Get()
  findAll() {
    return [];
  }
}
