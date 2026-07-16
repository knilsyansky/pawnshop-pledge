import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../infrastructure/prisma/prisma.service';

@Injectable()
export class TariffService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll() {
    return this.prisma.tariff.findMany();
  }
}
