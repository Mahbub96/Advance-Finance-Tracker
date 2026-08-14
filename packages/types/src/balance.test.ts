import { AdjustmentDirection, TransactionType, TransferLeg } from './enums';
import { deriveAccountBalance, derivePeriodTotals } from './balance';

describe('deriveAccountBalance', () => {
  it('starts from opening balance', () => {
    expect(deriveAccountBalance('1000.00', [], 'a1')).toBe('1000.00');
  });

  it('applies income and expense', () => {
    expect(
      deriveAccountBalance(
        '1000.00',
        [
          { type: TransactionType.INCOME, accountId: 'a1', amount: '500.00' },
          { type: TransactionType.EXPENSE, accountId: 'a1', amount: '200.00' },
        ],
        'a1',
      ),
    ).toBe('1300.00');
  });

  it('ignores other accounts and deleted rows', () => {
    expect(
      deriveAccountBalance(
        '100.00',
        [
          { type: TransactionType.EXPENSE, accountId: 'a2', amount: '50.00' },
          {
            type: TransactionType.EXPENSE,
            accountId: 'a1',
            amount: '50.00',
            deletedAt: '2026-01-01T00:00:00.000Z',
          },
        ],
        'a1',
      ),
    ).toBe('100.00');
  });

  it('applies transfer legs', () => {
    expect(
      deriveAccountBalance(
        '1000.00',
        [
          {
            type: TransactionType.TRANSFER,
            accountId: 'a1',
            amount: '250.00',
            transferLeg: TransferLeg.OUT,
          },
        ],
        'a1',
      ),
    ).toBe('750.00');

    expect(
      deriveAccountBalance(
        '0.00',
        [
          {
            type: TransactionType.TRANSFER,
            accountId: 'a2',
            amount: '250.00',
            transferLeg: TransferLeg.IN,
          },
        ],
        'a2',
      ),
    ).toBe('250.00');
  });

  it('applies refund and adjustment', () => {
    expect(
      deriveAccountBalance(
        '100.00',
        [
          { type: TransactionType.EXPENSE, accountId: 'a1', amount: '40.00' },
          { type: TransactionType.REFUND, accountId: 'a1', amount: '40.00' },
          {
            type: TransactionType.ADJUSTMENT,
            accountId: 'a1',
            amount: '5.00',
            adjustmentDirection: AdjustmentDirection.DECREASE,
          },
        ],
        'a1',
      ),
    ).toBe('95.00');
  });
});

describe('derivePeriodTotals', () => {
  it('counts only income and expense, never transfers', () => {
    expect(
      derivePeriodTotals([
        { type: TransactionType.INCOME, amount: '50000.00' },
        { type: TransactionType.EXPENSE, amount: '450.00' },
        { type: TransactionType.TRANSFER, amount: '1000.00' },
        { type: TransactionType.REFUND, amount: '50.00' },
      ]),
    ).toEqual({ income: '50000.00', expense: '450.00' });
  });
});
