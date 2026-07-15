import { Module } from '@nestjs/common';
import { TariffController } from './tariff.controller';
import { TariffService } from '../../application/tariff/tariff.service';
import { PrismaService } from '../../infrastructure/prisma/prisma.service';

@Module({
  controllers: [TariffController],
  providers: [TariffService, PrismaService]
})
export class TariffModule {}
