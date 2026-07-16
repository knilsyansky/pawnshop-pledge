import { Prisma } from '@prisma/client/index-browser';
import { Pledge, PledgeItem } from './pledge.entity';
import { Money } from '../value-objects/money';
import Decimal from 'decimal.js';

export class PledgeFactory {
  static createFromData(
    clientId: number,
    tariffId: string,
    createdAt: Date,
    dueDate: Date,
    items: PledgeItem[]
  ): Pledge {
    const amount = items.reduce((sum, item) => sum + Number(item.estimatedValue), 0);
    return new Pledge(clientId, tariffId, createdAt, dueDate, Money.from(amount), 'ACTIVE', items);
  }

  static toPrismaCreate(pledge: Pledge) {
    return {
      clientId: pledge.clientId,
      tariffId: pledge.tariffId,
      createdAt: pledge.createdAt,
      dueDate: pledge.dueDate,
      amount: new Decimal(pledge.amount.toDecimal().toString()),
      status: pledge.status,
      items: {
        create: pledge.items.map(item => ({
          category: {
            connect: { id: item.categoryId }
          },
          name: item.name,
          estimatedValue: new Decimal(item.estimatedValue.toDecimal().toString()),
          specifications: item.specifications as Prisma.InputJsonValue
        }))
      }
    };
  }
}
