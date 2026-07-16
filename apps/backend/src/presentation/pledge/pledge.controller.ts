import { Body, Controller, Get, Param, Patch, Post } from '@nestjs/common';
import { PledgeService } from '../../application/pledge/pledge.service';
import { CreatePledgeDto } from './dto/create-pledge.dto';

@Controller('pledges')
export class PledgeController {
  constructor(private readonly pledgeService: PledgeService) {}

  @Get()
  findAll() {
    return this.pledgeService.findAll();
  }

  @Post()
  create(@Body() createPledgeDto: CreatePledgeDto) {
    return this.pledgeService.create(createPledgeDto);
  }

  @Patch(':id/redeem')
  redeem(@Param('id') id: string) {
    return this.pledgeService.redeem(Number(id));
  }
}
