import Decimal from 'decimal.js';
import {
  AdjustmentDirection,
  type AdjustmentDirection as AdjustmentDirectionType,
  TransactionType,
  type TransactionType as TransactionTypeName,
  TransferLeg,
  type TransferLeg as TransferLegType,
} from './enums';
import { moneyString, parseMoney, type MoneyString } from './money';

export type BalanceTransaction = {
  type: TransactionTypeName;
  accountId: string;
  amount: MoneyString;
  transferLeg?: TransferLegType | null;
  adjustmentDirection?: AdjustmentDirectionType | null;
  deletedAt?: string | null;
};

export function transactionEffectOnAccount(tx: BalanceTransaction, accountId: string): Decimal {
  if (tx.deletedAt) {
    return new Decimal(0);
  }
  if (tx.accountId !== accountId) {
    return new Decimal(0);
  }

  const amount = parseMoney(tx.amount);

  switch (tx.type) {
    case TransactionType.INCOME:
    case TransactionType.REFUND:
      return amount;
    case TransactionType.EXPENSE:
      return amount.negated();
    case TransactionType.TRANSFER:
      return tx.transferLeg === TransferLeg.IN ? amount : amount.negated();
    case TransactionType.ADJUSTMENT:
      return tx.adjustmentDirection === AdjustmentDirection.INCREASE ? amount : amount.negated();
    default: {
      const _exhaustive: never = tx.type;
      return _exhaustive;
    }
  }
}

export function deriveAccountBalance(
  openingBalance: MoneyString,
  transactions: BalanceTransaction[],
  accountId: string,
): MoneyString {
  let total = parseMoney(openingBalance);
  for (const tx of transactions) {
    total = total.plus(transactionEffectOnAccount(tx, accountId));
  }
  return moneyString(total);
}

export type PeriodTotals = {
  income: MoneyString;
  expense: MoneyString;
};

export function derivePeriodTotals(
  transactions: Array<{
    type: TransactionTypeName;
    amount: MoneyString;
    deletedAt?: string | null;
  }>,
): PeriodTotals {
  let income = new Decimal(0);
  let expense = new Decimal(0);

  for (const tx of transactions) {
    if (tx.deletedAt) continue;
    if (tx.type === TransactionType.INCOME) {
      income = income.plus(parseMoney(tx.amount));
    } else if (tx.type === TransactionType.EXPENSE) {
      expense = expense.plus(parseMoney(tx.amount));
    }
  }

  return {
    income: moneyString(income),
    expense: moneyString(expense),
  };
}
