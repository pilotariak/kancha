/**
 * Parse a date string in DD/MM/YYYY format into a Date object.
 * Returns null if the input is falsy or unparseable.
 */
export function parseDateMatch(value: string | null | undefined): Date | null {
  if (!value) return null;
  const [day, month, year] = value.split("/");
  if (!day || !month || !year) return null;
  const d = new Date(`${year}-${month.padStart(2, "0")}-${day.padStart(2, "0")}`);
  return isNaN(d.getTime()) ? null : d;
}

/**
 * Format a DD/MM/YYYY date string for display.
 * Returns null if unparseable.
 */
export function formatDateMatch(
  value: string | null | undefined,
  options: Intl.DateTimeFormatOptions,
): string | null {
  const d = parseDateMatch(value);
  if (!d) return null;
  return d.toLocaleDateString(undefined, options);
}
