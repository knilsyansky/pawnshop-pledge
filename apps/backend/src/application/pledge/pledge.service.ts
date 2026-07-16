import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../infrastructure/prisma/prisma.service';
import { CreatePledgeDto } from '../../presentation/pledge/dto/create-pledge.dto';
import { PledgeFactory } from '../../domain/pledge/pledge.factory';
import { PledgeItem } from '../../domain/pledge/pledge.entity';
import { Prisma } from '@prisma/client/index-browser';
import { PledgeRedemptionService } from '../../domain/pledge/pledge-redemption.service';

@Injectable()
export class PledgeService {
  constructor(private readonly prisma: PrismaService) {}

  private formatAmount(amount: Prisma.Decimal | string | number): string {
    const decimalAmount = amount instanceof Prisma.Decimal ? amount : new Prisma.Decimal(String(amount));
    return decimalAmount.toFixed(2);
  }

  async findAll() {
    return this.prisma.pledge.findMany({
      include: {
        client: true,
        tariff: true,
        items: true
      }
    });
  }

  async create(createPledgeDto: CreatePledgeDto) {
    const tariff = await this.prisma.tariff.findUnique({
      where: { id: createPledgeDto.tariffId }
    });

    if (!tariff) {
      throw new Error('Tariff not found');
    }

    const createdAt = new Date();
    const dueDate = new Date(createdAt);
    dueDate.setDate(dueDate.getDate() + tariff.basePeriodDays);

    const items = createPledgeDto.items.map(
      item =>
        new PledgeItem(
          item.categoryId,
          item.name,
          new Prisma.Decimal(String(item.estimatedValue)),
          item.specifications
        )
    );

    const pledge = PledgeFactory.createFromData(
      createPledgeDto.clientId,
      createPledgeDto.tariffId,
      createdAt,
      dueDate,
      items
    );

    const createdPledge = await this.prisma.pledge.create({
      data: PledgeFactory.toPrismaCreate(pledge),
      include: { items: true }
    });

    return {
      ...createdPledge,
      amount: this.formatAmount(createdPledge.amount)
    };
  }

  async redeem(pledgeId: number) {
    const pledge = await this.prisma.pledge.findUnique({
      where: { id: pledgeId },
      include: { tariff: true }
    });

    if (!pledge) {
      throw new Error('Pledge not found');
    }

    if (pledge.status !== 'ACTIVE') {
      throw new Error('Only active pledges can be redeemed');
    }

    const redeemedAmount = PledgeRedemptionService.calculateRedeemedAmount(
      pledge.amount,
      pledge.dueDate,
      pledge.tariff.basePeriodRate,
      pledge.tariff.overdueRate
    );

    const updatedPledge = await this.prisma.pledge.update({
      where: { id: pledgeId },
      data: {
        status: 'REDEEMED',
        redeemedAt: new Date(),
        redeemedAmount
      }
    });

    return {
      ...updatedPledge,
      amount: this.formatAmount(updatedPledge.amount),
      redeemedAmount: this.formatAmount(updatedPledge.redeemedAmount!) 
    };
  }
}
