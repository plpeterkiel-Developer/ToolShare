/**
 * Format a date string for display.
 * e.g. "2026-04-01" → "1 Apr 2026" (using the given locale)
 */
export function formatDate(dateString: string, locale = 'da'): string {
  return new Date(dateString).toLocaleDateString(locale, {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  })
}

/**
 * Truncate a string to maxLength characters, appending "…" if truncated.
 */
export function truncate(str: string, maxLength: number): string {
  if (str.length <= maxLength) return str
  return str.slice(0, maxLength - 1) + '…'
}

/**
 * Return initials from a display name (up to 2 characters).
 * e.g. "Alice Borrower" → "AB"
 */
export function getInitials(name: string): string {
  return name
    .split(' ')
    .map((part) => part[0]?.toUpperCase() ?? '')
    .slice(0, 2)
    .join('')
}
