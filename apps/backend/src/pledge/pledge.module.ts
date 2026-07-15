import { Module } from '@nestjs/common';
import { PledgeController } from './pledge.controller';
import { PledgeService } from './pledge.service';
import { PrismaService } from '../prisma/prisma.service';

@Module({
  controllers: [PledgeController],
  providers: [PledgeService, PrismaService]
})
export class PledgeModule {}
