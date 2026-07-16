import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../infrastructure/prisma/prisma.service';
import { CreateClientDto } from '../../presentation/client/dto/create-client.dto';
import { Prisma } from '@prisma/client';
import { RedemptionCalculator } from '../../domain/pledge/pledge-redemption.service';

@Injectable()
export class ClientService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(withPledges: boolean) {
    const clients = await this.prisma.client.findMany({
        include: withPledges ? { pledges: { include: { tariff: true, items: true } } } : undefined
    });

    if (!withPledges) {
        return clients;
    }


    return clients.map(client => ({
        ...client,
        pledges: (client as any).pledges.map((pledge: { 
            status: string; 
            amount: Prisma.Decimal; 
            dueDate: Date; 
            tariff: { basePeriodRate: Prisma.Decimal; overdueRate: Prisma.Decimal; }; 
            redeemedAmount: string | null; 
        }) => ({
        ...pledge,

        redemptionAmount:
            pledge.status === 'ACTIVE'
            ? RedemptionCalculator.calculate(
                pledge.amount,
                pledge.dueDate,
                pledge.tariff.basePeriodRate,
                pledge.tariff.overdueRate,
                )
            : pledge.redeemedAmount,
        })),
    }));
  }

  async create(createClientDto: CreateClientDto) {
    try {
      return await this.prisma.client.create({
        data: createClientDto
      });
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2002'
      ) {
        throw new ConflictException('Клиент с таким номером телефона уже существует.');
      }
      throw error;
    }
  }
}
