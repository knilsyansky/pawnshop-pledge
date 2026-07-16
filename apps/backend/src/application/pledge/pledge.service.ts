import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../infrastructure/prisma/prisma.service';
import { CreatePledgeDto } from '../../presentation/pledge/dto/create-pledge.dto';
import { PledgeFactory } from '../../domain/pledge/pledge.factory';
import { PledgeItem } from '../../domain/pledge/pledge.entity';
import { Prisma } from '@prisma/client/index-browser';
import { RedemptionCalculator } from '../../domain/pledge/pledge-redemption.service';
import { Money } from '../../domain/value-objects/money';

@Injectable()
export class PledgeService {
  constructor(private readonly prisma: PrismaService) {}

  private formatAmount(amount: Prisma.Decimal | string | number): string {
    const decimalAmount = amount instanceof Prisma.Decimal ? amount.toFixed(2) : amount;
    return Money.from(decimalAmount.toString()).toString();
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
      throw new NotFoundException('Tariff not found');
    }

    const createdAt = new Date();
    const dueDate = new Date(createdAt);
    dueDate.setDate(dueDate.getDate() + tariff.basePeriodDays);

    const items = createPledgeDto.items.map(
      item =>
        new PledgeItem(
          item.categoryId,
          item.name,
          Money.from(item.estimatedValue.toFixed(2)),
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
    const result = await this.prisma.$transaction(async (tx) => {
        const pledge = await tx.pledge.findUnique({
            where: {
                id: pledgeId,
            },
            include: {
                tariff: true,
            },
        });

        if (!pledge) {
        throw new NotFoundException('Залог не найден');
        }

        if (pledge.status !== 'ACTIVE') {
        throw new ConflictException('Лишь активные залоги могут быть выкуплены.');
        }

        const redeemedAmount =
        RedemptionCalculator.calculate(
            pledge.amount,
            pledge.dueDate,
            pledge.tariff.basePeriodRate,
            pledge.tariff.overdueRate,
        );

        const updatedPledge = await tx.pledge.update({
        where: {
            id: pledgeId,
        },
        data: {
            status: 'REDEEMED',
            redeemedAt: new Date(),
            redeemedAmount,
        },
        });

        return updatedPledge;
    });

    return {
        ...result,
        amount: this.formatAmount(result.amount),
        redeemedAmount: result.redeemedAmount
        ? this.formatAmount(result.redeemedAmount)
        : null,
    };
    }
}
