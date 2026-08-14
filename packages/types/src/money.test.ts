import { addMoney, assertPositiveAmount, moneyString, parseMoney, subtractMoney } from './money';

describe('money', () => {
  it('adds and subtracts without float drift', () => {
    expect(subtractMoney('10000.00', '3500.00')).toBe('6500.00');
    expect(addMoney('0.10', '0.20')).toBe('0.30');
  });

  it('normalizes scale to 2', () => {
    expect(moneyString('1250.5')).toBe('1250.50');
    expect(moneyString('0')).toBe('0.00');
  });

  it('rejects invalid values', () => {
    expect(() => parseMoney('abc')).toThrow(/Invalid money/);
    expect(() => parseMoney('')).toThrow(/Invalid money/);
  });

  it('rejects non-positive transaction amounts', () => {
    expect(() => assertPositiveAmount('0')).toThrow(/greater than zero/);
    expect(() => assertPositiveAmount('-1')).toThrow(/greater than zero/);
    expect(assertPositiveAmount('1.5')).toBe('1.50');
  });

  it('handles small decimals and large values', () => {
    expect(addMoney('0.01', '0.01')).toBe('0.02');
    expect(addMoney('999999999.99', '0.01')).toBe('1000000000.00');
  });
});
