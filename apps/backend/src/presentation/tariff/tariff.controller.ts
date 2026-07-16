import { Controller, Get } from '@nestjs/common';
import { TariffService } from '../../application/tariff/tariff.service';

@Controller('tariffs')
export class TariffController {
  constructor(private readonly tariffService: TariffService) {}

  @Get()
  findAll() {
    return this.tariffService.findAll();
  }
}
