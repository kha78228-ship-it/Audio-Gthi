/**
 * Utility functions for masking and protecting sensitive user information
 * against shoulder surfing, screen-sharing, or public display.
 */

export function maskEmail(email?: string | null): string {
  if (!email || !email.includes('@')) return '••••••••••••';
  const [localPart, domain] = email.split('@');
  if (localPart.length <= 2) {
    return `••@${domain}`;
  }
  const firstChar = localPart[0];
  const lastChar = localPart[localPart.length - 1];
  const dots = '•'.repeat(Math.min(6, Math.max(3, localPart.length - 2)));
  return `${firstChar}${dots}${lastChar}@${domain}`;
}

export function maskAccountId(accountId?: string | null): string {
  if (!accountId) return '••••••••';
  if (accountId.length <= 4) return '••••';
  // Keep first 3 chars or prefix and mask the rest
  const prefix = accountId.slice(0, Math.min(3, accountId.length));
  return `${prefix}••••••••`;
}

export function maskPoints(points?: number | null): string {
  return '•••••• pts';
}

export function maskText(text?: string | null, keepChars = 0): string {
  if (!text) return '••••••••';
  if (keepChars > 0 && text.length > keepChars) {
    return `${text.slice(0, keepChars)}••••••`;
  }
  return '••••••••';
}

export function maskDate(dateStr?: string | null): string {
  if (!dateStr) return '••••••';
  return '••/••/••••';
}
