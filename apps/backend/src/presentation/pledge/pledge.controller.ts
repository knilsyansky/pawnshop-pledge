import { Body, Controller, Get, Param, Patch, Post } from '@nestjs/common';
import { PledgeService } from '../../application/pledge/pledge.service';
import { CreatePledgeDto } from './dto/create-pledge.dto';

@Controller('pledges')
export class PledgeController {
  constructor(private readonly pledgeService: PledgeService) {}

  @Post()
  create(@Body() createPledgeDto: CreatePledgeDto) {
    return this.pledgeService.create(createPledgeDto);
  }

  @Patch('redeem/:id')
  redeem(@Param('id') id: string) {
    return this.pledgeService.redeem(Number(id));
  }
}
