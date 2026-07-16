import { Body, Controller, Get, Post, Query } from '@nestjs/common';
import { ClientService } from '../../application/client/client.service';
import { CreateClientDto } from './dto/create-client.dto';

@Controller('clients')
export class ClientController {
  constructor(private readonly clientService: ClientService) {}

  @Get()
  findAll(@Query('withPledges') withPledges: string) {
    console.log('withPledges', withPledges)
    return this.clientService.findAll(withPledges === 'true');
  }

  @Post()
  create(@Body() createClientDto: CreateClientDto) {
    return this.clientService.create(createClientDto);
  }
}
