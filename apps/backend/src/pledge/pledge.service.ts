import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class PledgeService {
  constructor(private readonly prisma: PrismaService) {}
}
