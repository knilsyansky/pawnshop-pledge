import { Prisma } from '@prisma/client';

const HUNDRED = new Prisma.Decimal(100);

export class RedemptionCalculator {
  static calculate(
    amount: Prisma.Decimal,
    dueDate: Date,
    basePeriodRate: Prisma.Decimal,
    overdueRate: Prisma.Decimal,
    today = new Date(),
  ): Prisma.Decimal {
    const currentDate = this.startOfDay(today);
    const due = this.startOfDay(dueDate);

    const overdueDays = Math.max(
      0,
      Math.floor(
        (currentDate.getTime() - due.getTime()) /
          (1000 * 60 * 60 * 24),
      ),
    );



    const baseInterest = amount
      .mul(basePeriodRate)
      .div(HUNDRED);



    const overdueInterest = amount
      .mul(overdueRate)
      .div(HUNDRED)
      .mul(overdueDays);



    return new Prisma.Decimal(
      amount
        .add(baseInterest)
        .add(overdueInterest)
        .toFixed(2),
    );
  }

  private static startOfDay(date: Date): Date {
    return new Date(
      date.getFullYear(),
      date.getMonth(),
      date.getDate(),
    );
  }
}