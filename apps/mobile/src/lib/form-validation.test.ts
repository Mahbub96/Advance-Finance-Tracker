import {
  formatDateForDisplay,
  isMoney,
  isPositiveMoney,
  isoDateToUtcDate,
  utcDateToIsoDate,
  validateEmailWhenRequired,
  validateIsoDate,
  validatePercentage,
} from './form-validation';

describe('form-validation', () => {
  it('accepts real ISO calendar dates only', () => {
    expect(validateIsoDate('2026-08-15', { required: true }).valid).toBe(true);
    expect(validateIsoDate('2026-02-30', { required: true }).valid).toBe(false);
    expect(validateIsoDate('15/08/2026', { required: true }).valid).toBe(false);
    expect(validateIsoDate('', { required: true }).valid).toBe(false);
    expect(validateIsoDate('', { required: false }).valid).toBe(true);
  });

  it('enforces date min and max constraints', () => {
    expect(validateIsoDate('2026-08-14', { min: '2026-08-15' }).valid).toBe(false);
    expect(validateIsoDate('2026-08-16', { max: '2026-08-15' }).valid).toBe(false);
    expect(validateIsoDate('2026-08-15', { min: '2026-08-15', max: '2026-08-15' }).valid).toBe(
      true,
    );
  });

  it('converts dates without local timezone drift', () => {
    const date = isoDateToUtcDate('2026-08-15');
    expect(utcDateToIsoDate(date)).toBe('2026-08-15');
    expect(formatDateForDisplay('not-a-date')).toBe('Select date');
  });

  it('validates money fields using strict decimal parsing', () => {
    expect(isPositiveMoney('1')).toBe(true);
    expect(isPositiveMoney('0')).toBe(false);
    expect(isPositiveMoney('-1')).toBe(false);
    expect(isPositiveMoney('12abc')).toBe(false);

    expect(isMoney('0')).toBe(true);
    expect(isMoney('-10.50')).toBe(true);
    expect(isMoney('12abc')).toBe(false);
  });

  it('validates conditional email and percentages', () => {
    expect(validateEmailWhenRequired('', false).valid).toBe(true);
    expect(validateEmailWhenRequired('user@example.com', true).valid).toBe(true);
    expect(validateEmailWhenRequired('bad-email', true).valid).toBe(false);

    expect(validatePercentage(80).valid).toBe(true);
    expect(validatePercentage(-1).valid).toBe(false);
    expect(validatePercentage(101).valid).toBe(false);
  });
});
