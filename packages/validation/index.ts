/**
 * Standard RFC-5322 compatible email format validation.
 */
const EMAIL_REGEX = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)+$/;

export function isValidEmail(email: string | null | undefined): boolean {
  if (!email || typeof email !== 'string') return false;
  const trimmed = email.trim();
  if (trimmed.length < 5 || trimmed.length > 254) return false;
  return EMAIL_REGEX.test(trimmed);
}

export function normalizeEmail(email: string): string {
  return email.toLowerCase().trim();
}

export function isValidIsoDate(dateStr: string | null | undefined): boolean {
  if (!dateStr || typeof dateStr !== 'string') return false;
  const match = /^\d{4}-\d{2}-\d{2}$/.test(dateStr.trim());
  if (!match) return false;
  const parsed = new Date(dateStr.trim());
  return !isNaN(parsed.getTime());
}

export function validateTypedEmailConfirmation(typed: string, expected: string): boolean {
  if (!typed || !expected) return false;
  return normalizeEmail(typed) === normalizeEmail(expected);
}
