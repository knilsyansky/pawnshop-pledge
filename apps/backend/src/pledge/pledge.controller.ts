import { Controller, Get } from '@nestjs/common';

@Controller('pledges')
export class PledgeController {
  @Get()
  findAll() {
    return [];
  }
}
