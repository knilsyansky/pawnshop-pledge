import { Module } from '@nestjs/common';
import { ClientController } from './client.controller';
import { ClientService } from '../../application/client/client.service';
import { PrismaService } from '../../infrastructure/prisma/prisma.service';

@Module({
  controllers: [ClientController],
  providers: [ClientService, PrismaService]
})
export class ClientModule {}
