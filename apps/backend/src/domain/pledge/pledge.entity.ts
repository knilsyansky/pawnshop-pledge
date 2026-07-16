import { Money } from "../value-objects/money";

export type PledgeStatus = 'ACTIVE' | 'REDEEMED';

export class PledgeItem {
  constructor(
    public readonly categoryId: string,
    public readonly name: string,
    public readonly estimatedValue: Money,
    public readonly specifications: unknown
  ) {}
}

export class Pledge {
  constructor(
    public readonly clientId: number,
    public readonly tariffId: string,
    public readonly createdAt: Date,
    public readonly dueDate: Date,
    public readonly amount: Money,
    public readonly status: PledgeStatus,
    public readonly items: PledgeItem[]
  ) {}
}
