import {
  AccountType,
  TransactionType,
  RecurringFrequency,
  DebtType,
} from '@personal-finance/types';
import { todayIsoDate } from '../lib/clock';

export async function seedDemoFinances(
  services: ReturnType<(typeof import('../providers/finance-provider'))['useFinance']>,
): Promise<void> {
  const {
    accounts,
    categories,
    transactions,
    budgets,
    goals,
    recurringRules,
    debts,
    settings,
    refresh,
  } = services;

  // 1. Seed categories
  await categories.seedIfEmpty();
  const allCategories = await categories.list(true);
  const foodCat = allCategories.find((c) => c.name.toLowerCase().includes('food'))?.id ?? null;
  const transportCat =
    allCategories.find((c) => c.name.toLowerCase().includes('transport'))?.id ?? null;
  const shoppingCat = allCategories.find((c) => c.name.toLowerCase().includes('shop'))?.id ?? null;
  const billsCat =
    allCategories.find(
      (c) => c.name.toLowerCase().includes('bill') || c.name.toLowerCase().includes('util'),
    )?.id ?? null;
  const salaryCat = allCategories.find((c) => c.type === 'INCOME')?.id ?? null;

  // 2. Create accounts matching reference assets
  const bank = await accounts.create({
    name: 'BRAC Bank',
    type: AccountType.BANK,
    currency: 'BDT',
    institutionName: 'BRAC Bank Ltd',
    openingBalance: '620000.00',
    openingBalanceDate: todayIsoDate(),
  });

  const bkash = await accounts.create({
    name: 'bKash',
    type: AccountType.WALLET,
    currency: 'BDT',
    institutionName: 'bKash Wallet',
    openingBalance: '125400.00',
    openingBalanceDate: todayIsoDate(),
  });

  const nagad = await accounts.create({
    name: 'Nagad',
    type: AccountType.WALLET,
    currency: 'BDT',
    institutionName: 'Nagad Wallet',
    openingBalance: '85600.00',
    openingBalanceDate: todayIsoDate(),
  });

  const cash = await accounts.create({
    name: 'Cash',
    type: AccountType.CASH,
    currency: 'BDT',
    openingBalance: '14530.00',
    openingBalanceDate: todayIsoDate(),
  });

  // 3. Create realistic sample transactions
  await transactions.createEntry({
    type: TransactionType.INCOME,
    accountId: bank.id,
    amount: '80000.00',
    transactionDate: todayIsoDate(),
    categoryId: salaryCat,
    merchantName: 'Company Ltd.',
    note: 'Monthly salary deposit',
  });

  await transactions.createEntry({
    type: TransactionType.EXPENSE,
    accountId: bkash.id,
    amount: '2450.00',
    transactionDate: todayIsoDate(),
    categoryId: foodCat,
    merchantName: 'Meena Bazar',
    note: 'Grocery & dinner items',
  });

  await transactions.createEntry({
    type: TransactionType.EXPENSE,
    accountId: bkash.id,
    amount: '1200.00',
    transactionDate: todayIsoDate(),
    categoryId: billsCat,
    merchantName: 'ISP Provider',
    note: 'Monthly high-speed internet',
  });

  await transactions.createEntry({
    type: TransactionType.EXPENSE,
    accountId: cash.id,
    amount: '650.00',
    transactionDate: todayIsoDate(),
    categoryId: foodCat,
    merchantName: 'Star Kabab',
    note: 'Lunch with colleagues',
  });

  // 4. Create monthly budgets matching reference UI
  await budgets.create({
    name: 'Food & Dining',
    amount: '15000.00',
    currency: 'BDT',
    categoryId: foodCat,
    alertThresholdPercent: 80,
  });

  await budgets.create({
    name: 'Transport',
    amount: '8000.00',
    currency: 'BDT',
    categoryId: transportCat,
    alertThresholdPercent: 80,
  });

  await budgets.create({
    name: 'Shopping',
    amount: '12000.00',
    currency: 'BDT',
    categoryId: shoppingCat,
    alertThresholdPercent: 80,
  });

  // 5. Create savings goals
  await goals.create({
    name: 'Emergency Fund',
    targetAmount: '300000.00',
    currency: 'BDT',
    targetDate: '2026-12-31',
  });

  await goals.create({
    name: 'New Laptop',
    targetAmount: '120000.00',
    currency: 'BDT',
    targetDate: '2026-10-31',
  });

  // 6. Create recurring bills
  await recurringRules.create({
    name: 'Internet Bill',
    amount: '1200.00',
    currency: 'BDT',
    type: TransactionType.EXPENSE,
    accountId: bkash.id,
    frequency: RecurringFrequency.MONTHLY,
    startDate: todayIsoDate(),
    categoryId: billsCat,
  });

  await recurringRules.create({
    name: 'Gym Membership',
    amount: '2500.00',
    currency: 'BDT',
    type: TransactionType.EXPENSE,
    accountId: nagad.id,
    frequency: RecurringFrequency.MONTHLY,
    startDate: todayIsoDate(),
  });

  // 7. Create debt / lending
  await debts.create({
    personName: 'Rahim Chowdhury',
    type: DebtType.LENT,
    amount: '15000.00',
    currency: 'BDT',
    issueDate: todayIsoDate(),
    dueDate: '2026-09-30',
  });

  // 8. Update user name
  const current = await settings.get();
  if (current) {
    await settings.upsert({
      ...current,
      displayName: 'Ahmed',
      baseCurrency: 'BDT',
    });
  }

  refresh();
}
