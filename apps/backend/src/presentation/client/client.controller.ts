import { Controller, Get } from '@nestjs/common';

@Controller('clients')
export class ClientController {
  @Get()
  findAll() {
    return [];
  }
}
