import Decimal from 'decimal.js';

Decimal.set({ precision: 20, rounding: Decimal.ROUND_HALF_EVEN });

/** Canonical stored/serialized money: decimal text, scale 2. */
export type MoneyString = string;

const MONEY_PATTERN = /^-?\d+(\.\d{1,8})?$/;

export function parseMoney(value: string): Decimal {
  const trimmed = value.trim();
  if (!MONEY_PATTERN.test(trimmed)) {
    throw new Error(`Invalid money value: ${value}`);
  }
  const parsed = new Decimal(trimmed);
  if (!parsed.isFinite()) {
    throw new Error(`Invalid money value: ${value}`);
  }
  return parsed;
}

export function moneyString(value: string | Decimal): MoneyString {
  const parsed = value instanceof Decimal ? value : parseMoney(value);
  if (!parsed.isFinite()) {
    throw new Error('Invalid money value');
  }
  return parsed.toFixed(2);
}

export function addMoney(a: MoneyString, b: MoneyString): MoneyString {
  return moneyString(parseMoney(a).plus(parseMoney(b)));
}

export function subtractMoney(a: MoneyString, b: MoneyString): MoneyString {
  return moneyString(parseMoney(a).minus(parseMoney(b)));
}

export function negateMoney(value: MoneyString): MoneyString {
  return moneyString(parseMoney(value).negated());
}

export function compareMoney(a: MoneyString, b: MoneyString): number {
  return parseMoney(a).comparedTo(parseMoney(b));
}

export function isZeroMoney(value: MoneyString): boolean {
  return parseMoney(value).isZero();
}

/** Transaction amounts are a positive magnitude. Opening balance may be zero. */
export function assertPositiveAmount(value: string): MoneyString {
  const parsed = parseMoney(value);
  if (parsed.lte(0)) {
    throw new Error('Amount must be greater than zero');
  }
  return moneyString(parsed);
}

export function assertNonNegativeMoney(value: string): MoneyString {
  const parsed = parseMoney(value);
  if (parsed.lt(0)) {
    throw new Error('Amount must not be negative');
  }
  return moneyString(parsed);
}

export function formatMoneyDisplay(value: MoneyString, currency: string, locale = 'en-US'): string {
  const amount = Number(moneyString(value));
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency,
    currencyDisplay: 'narrowSymbol',
  }).format(amount);
}
