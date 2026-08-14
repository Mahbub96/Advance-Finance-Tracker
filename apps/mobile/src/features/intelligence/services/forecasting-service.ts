import {
  moneyString,
  parseMoney,
  TransactionType,
  type MoneyString,
} from '@personal-finance/types';
import type { BudgetRepository } from '../../../repositories/budget-repository';
import type { TransactionRepository } from '../../../repositories/transaction-repository';
import { monthRange } from '../../../lib/clock';

export type MonthForecast = {
  currentSpend: MoneyString;
  dailyBurnRate: MoneyString;
  projectedMonthEndSpend: MoneyString;
  daysRemaining: number;
  totalDays: number;
  currentDay: number;
};

export type BudgetDepletionRisk = {
  budgetId: string;
  budgetName: string;
  budgetAmount: MoneyString;
  currentSpend: MoneyString;
  projectedSpend: MoneyString;
  projectedExhaustionDate: string | null;
  willExceed: boolean;
};

export class ForecastingService {
  constructor(
    private readonly transactions: TransactionRepository,
    private readonly budgets: BudgetRepository,
  ) {}

  async getMonthForecast(today = new Date()): Promise<MonthForecast> {
    const range = monthRange();
    const rows = await this.transactions.listByDateRange(range.from, range.to);

    const year = today.getUTCFullYear();
    const month = today.getUTCMonth();
    const currentDay = Math.max(1, today.getUTCDate());
    const totalDays = new Date(Date.UTC(year, month + 1, 0)).getUTCDate();
    const daysRemaining = Math.max(0, totalDays - currentDay);

    const currentSpend = rows
      .filter((tx) => tx.type === TransactionType.EXPENSE)
      .reduce((sum, tx) => moneyString(parseMoney(sum).plus(parseMoney(tx.amount))), '0.00');

    const dailyBurnDecimal = parseMoney(currentSpend).div(currentDay);
    const dailyBurnRate = moneyString(dailyBurnDecimal);

    const projectedSpendDecimal = parseMoney(currentSpend).plus(
      dailyBurnDecimal.times(daysRemaining),
    );
    const projectedMonthEndSpend = moneyString(projectedSpendDecimal);

    return {
      currentSpend,
      dailyBurnRate,
      projectedMonthEndSpend,
      daysRemaining,
      totalDays,
      currentDay,
    };
  }

  async getBudgetRisks(today = new Date()): Promise<BudgetDepletionRisk[]> {
    const activeBudgets = await this.budgets.list(false);
    const currentDay = Math.max(1, today.getUTCDate());
    const year = today.getUTCFullYear();
    const month = today.getUTCMonth();
    const totalDays = new Date(Date.UTC(year, month + 1, 0)).getUTCDate();
    const daysRemaining = Math.max(0, totalDays - currentDay);

    return Promise.all(
      activeBudgets.map(async (budget) => {
        const rows = await this.transactions.listByDateRange(budget.startDate, budget.endDate);
        const currentSpend = rows
          .filter((tx) => tx.type === TransactionType.EXPENSE)
          .filter((tx) => !budget.categoryId || tx.categoryId === budget.categoryId)
          .reduce((sum, tx) => moneyString(parseMoney(sum).plus(parseMoney(tx.amount))), '0.00');

        const dailyBurn = parseMoney(currentSpend).div(currentDay);
        const projectedSpend = moneyString(
          parseMoney(currentSpend).plus(dailyBurn.times(daysRemaining)),
        );

        const willExceed = parseMoney(projectedSpend).gt(parseMoney(budget.amount));
        let projectedExhaustionDate: string | null = null;

        if (dailyBurn.isPositive() && parseMoney(currentSpend).lt(parseMoney(budget.amount))) {
          const remainingBudget = parseMoney(budget.amount).minus(parseMoney(currentSpend));
          const daysToExhaustion = Math.ceil(remainingBudget.div(dailyBurn).toNumber());
          const exhaustionDay = currentDay + daysToExhaustion;

          if (exhaustionDay <= totalDays) {
            const pad = (n: number) => n.toString().padStart(2, '0');
            projectedExhaustionDate = `${year}-${pad(month + 1)}-${pad(exhaustionDay)}`;
          }
        }

        return {
          budgetId: budget.id,
          budgetName: budget.name,
          budgetAmount: budget.amount,
          currentSpend,
          projectedSpend,
          projectedExhaustionDate,
          willExceed,
        };
      }),
    );
  }
}
