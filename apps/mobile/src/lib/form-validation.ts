import { assertPositiveAmount, moneyString, parseMoney } from '@personal-finance/types';
import { isValidEmail, isValidIsoDate } from '@personal-finance/validation';

export type ValidationResult = {
  valid: boolean;
  message?: string;
};

export function validateIsoDate(
  value: string | null | undefined,
  options: {
    required?: boolean;
    min?: string;
    max?: string;
    label?: string;
  } = {},
): ValidationResult {
  const label = options.label ?? 'Date';
  const trimmed = value?.trim() ?? '';

  if (!trimmed) {
    return options.required ? { valid: false, message: `${label} is required` } : { valid: true };
  }

  if (!isValidIsoDate(trimmed)) {
    return { valid: false, message: 'Choose a valid calendar date' };
  }

  if (options.min && trimmed < options.min) {
    return { valid: false, message: `${label} must be on or after ${formatDateForDisplay(options.min)}` };
  }

  if (options.max && trimmed > options.max) {
    return { valid: false, message: `${label} must be on or before ${formatDateForDisplay(options.max)}` };
  }

  return { valid: true };
}

export function validatePositiveMoney(value: string | null | undefined): ValidationResult {
  try {
    assertPositiveAmount(value?.trim() ?? '');
    return { valid: true };
  } catch {
    return { valid: false, message: 'Enter an amount greater than 0' };
  }
}

export function validateMoney(value: string | null | undefined): ValidationResult {
  try {
    moneyString(value?.trim() || '0');
    return { valid: true };
  } catch {
    return { valid: false, message: 'Enter a valid amount' };
  }
}

export function isPositiveMoney(value: string | null | undefined): boolean {
  return validatePositiveMoney(value).valid;
}

export function isMoney(value: string | null | undefined): boolean {
  return validateMoney(value).valid;
}

export function moneyNumber(value: string | null | undefined): number {
  try {
    return parseMoney(value?.trim() ?? '0').toNumber();
  } catch {
    return Number.NaN;
  }
}

export function validateRequiredText(
  value: string | null | undefined,
  label: string,
): ValidationResult {
  return value?.trim() ? { valid: true } : { valid: false, message: `${label} is required` };
}

export function validateEmailWhenRequired(
  value: string | null | undefined,
  required: boolean,
): ValidationResult {
  if (!required) return { valid: true };
  return isValidEmail(value)
    ? { valid: true }
    : { valid: false, message: 'Enter a valid email address' };
}

export function validatePercentage(value: number): ValidationResult {
  return Number.isFinite(value) && value >= 0 && value <= 100
    ? { valid: true }
    : { valid: false, message: 'Choose a percentage from 0 to 100' };
}

export function isoDateToUtcDate(value: string | null | undefined): Date {
  const fallback = new Date();
  if (!value || !isValidIsoDate(value)) {
    return new Date(Date.UTC(fallback.getFullYear(), fallback.getMonth(), fallback.getDate()));
  }

  const [year = fallback.getFullYear(), month = fallback.getMonth() + 1, day = fallback.getDate()] =
    value.split('-').map(Number);
  return new Date(Date.UTC(year, month - 1, day));
}

export function utcDateToIsoDate(value: Date): string {
  const year = value.getUTCFullYear();
  const month = String(value.getUTCMonth() + 1).padStart(2, '0');
  const day = String(value.getUTCDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function formatDateForDisplay(value: string | null | undefined): string {
  if (!value || !isValidIsoDate(value)) return 'Select date';

  return new Intl.DateTimeFormat(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    timeZone: 'UTC',
  }).format(isoDateToUtcDate(value));
}
