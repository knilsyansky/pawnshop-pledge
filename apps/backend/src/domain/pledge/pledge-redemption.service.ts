import { Prisma } from '@prisma/client/index-browser';

export class PledgeRedemptionService {
  static calculateRedeemedAmount(
    amount: Prisma.Decimal,
    dueDate: Date,
    basePeriodRate: Prisma.Decimal,
    overdueRate: Prisma.Decimal,
    today = new Date()
  ): Prisma.Decimal {
    const normalizedToday = new Date(today);
    normalizedToday.setHours(0, 0, 0, 0);

    const normalizedDueDate = new Date(dueDate);
    normalizedDueDate.setHours(0, 0, 0, 0);

    const msPerDay = 1000 * 60 * 60 * 24;
    const overdueDays = Math.max(
      0,
      Math.floor((normalizedToday.getTime() - normalizedDueDate.getTime()) / msPerDay)
    );

    const baseInterest = amount.mul(basePeriodRate).div(new Prisma.Decimal(100));
    const overdueInterest = amount
      .mul(overdueRate)
      .div(new Prisma.Decimal(100))
      .mul(new Prisma.Decimal(overdueDays));

    const total = amount.add(baseInterest).add(overdueInterest);
    return new Prisma.Decimal(total.toFixed(2));
  }
}
