import { AccountType, TransactionType, TransferLeg } from '@personal-finance/types';
import type { AccountRepository } from '../../../repositories/account-repository';
import type { TransactionRepository } from '../../../repositories/transaction-repository';
import { AccountService } from '../../accounts/services/account-service';
import { TransactionService } from './transaction-service';
import type { AccountRecord, TransactionRecord } from '../../../database/records';

type AccountStore = Map<string, AccountRecord>;
type TxStore = TransactionRecord[];

function memoryRepos() {
  const accounts: AccountStore = new Map();
  const txs: TxStore = [];

  const accountRepo = {
    async list() {
      return [...accounts.values()].filter((a) => !a.deletedAt && !a.isArchived);
    },
    async getById(id: string) {
      return accounts.get(id) ?? null;
    },
    async insert(record: AccountRecord) {
      accounts.set(record.id, record);
    },
    async update(record: AccountRecord) {
      accounts.set(record.id, record);
    },
    async hasTransactions(accountId: string) {
      return txs.some((tx) => tx.accountId === accountId && !tx.deletedAt);
    },
  };

  const txRepo = {
    async list() {
      return txs.filter((tx) => !tx.deletedAt);
    },
    async listByAccount(accountId: string) {
      return txs.filter((tx) => tx.accountId === accountId && !tx.deletedAt);
    },
    async listByDateRange() {
      return txs.filter((tx) => !tx.deletedAt);
    },
    async getById(id: string) {
      return txs.find((tx) => tx.id === id && !tx.deletedAt) ?? null;
    },
    async insert(record: TransactionRecord) {
      txs.push(record);
    },
    async update(record: TransactionRecord) {
      const index = txs.findIndex((tx) => tx.id === record.id);
      if (index >= 0) txs[index] = record;
    },
    async insertMany(records: TransactionRecord[]) {
      txs.push(...records);
    },
  };

  return {
    accounts,
    txs,
    accountService: new AccountService(accountRepo as unknown as AccountRepository),
    transactionService: new TransactionService(
      txRepo as unknown as TransactionRepository,
      accountRepo as unknown as AccountRepository,
    ),
  };
}

describe('TransactionService', () => {
  it('creates expense and income against an account', async () => {
    const { accountService, transactionService } = memoryRepos();
    const account = await accountService.create({
      name: 'Cash',
      type: AccountType.CASH,
      currency: 'BDT',
      openingBalance: '1000.00',
      openingBalanceDate: '2026-08-01',
    });

    await transactionService.createEntry({
      type: TransactionType.INCOME,
      accountId: account.id,
      amount: '500.00',
      transactionDate: '2026-08-02',
    });
    await transactionService.createEntry({
      type: TransactionType.EXPENSE,
      accountId: account.id,
      amount: '200.00',
      transactionDate: '2026-08-03',
    });

    const listed = await transactionService.listByAccount(account.id);
    expect(accountService.balance(account, listed)).toBe('1300.00');
  });

  it('creates an atomic two-leg transfer that does not change income/expense', async () => {
    const { accountService, transactionService } = memoryRepos();
    const cash = await accountService.create({
      name: 'Cash',
      type: AccountType.CASH,
      currency: 'BDT',
      openingBalance: '1000.00',
      openingBalanceDate: '2026-08-01',
    });
    const bank = await accountService.create({
      name: 'Bank',
      type: AccountType.BANK,
      currency: 'BDT',
      openingBalance: '0.00',
      openingBalanceDate: '2026-08-01',
    });

    const legs = await transactionService.createTransfer({
      sourceAccountId: cash.id,
      destinationAccountId: bank.id,
      amount: '250.00',
      transactionDate: '2026-08-04',
    });

    expect(legs).toHaveLength(2);
    expect(legs[0]?.transferGroupId).toBe(legs[1]?.transferGroupId);
    expect(legs.map((leg) => leg.transferLeg).sort()).toEqual([TransferLeg.IN, TransferLeg.OUT]);

    const cashTx = await transactionService.listByAccount(cash.id);
    const bankTx = await transactionService.listByAccount(bank.id);
    expect(accountService.balance(cash, cashTx)).toBe('750.00');
    expect(accountService.balance(bank, bankTx)).toBe('250.00');
  });

  it('rejects same-account transfers and non-positive amounts', async () => {
    const { accountService, transactionService } = memoryRepos();
    const cash = await accountService.create({
      name: 'Cash',
      type: AccountType.CASH,
      currency: 'BDT',
      openingBalance: '0',
      openingBalanceDate: '2026-08-01',
    });

    await expect(
      transactionService.createTransfer({
        sourceAccountId: cash.id,
        destinationAccountId: cash.id,
        amount: '10',
        transactionDate: '2026-08-01',
      }),
    ).rejects.toThrow(/different/);

    await expect(
      transactionService.createEntry({
        type: TransactionType.EXPENSE,
        accountId: cash.id,
        amount: '0',
        transactionDate: '2026-08-01',
      }),
    ).rejects.toThrow(/greater than zero/);
  });
});
