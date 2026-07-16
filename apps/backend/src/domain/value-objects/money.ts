import { Decimal } from 'decimal.js';

export class Money {
  constructor(private readonly value: Decimal) {}

  static from(value: string | number): Money {
    return new Money(new Decimal(value));
  }
  static zero() {
    return new Money(new Decimal(0));
  }

  add(other: Money): Money {
    return new Money(this.value.add(other.value));
  }

  multiply(value: Decimal.Value): Money {
    return new Money(this.value.mul(value));
  }

  divide(value: Decimal.Value): Money {
    return new Money(this.value.div(value));
  }

  round(): Money {
    return new Money(this.value.toDecimalPlaces(2));
  }

  toDecimal(): Decimal {
    return this.value;
  }

  toString(): string {
    return this.value.toFixed(2);
  }
}