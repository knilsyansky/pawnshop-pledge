import { Module } from '@nestjs/common';
import { PledgeController } from './pledge.controller';
import { PledgeService } from '../../application/pledge/pledge.service';
import { PrismaService } from '../../infrastructure/prisma/prisma.service';

@Module({
  controllers: [PledgeController],
  providers: [PledgeService, PrismaService]
})
export class PledgeModule {}
