export function safeText(input: unknown, maxLen = 120): string {
  if (typeof input !== 'string') return '';
  const trimmed = input.trim().replace(/\s+/g, ' ');
  const limited = trimmed.slice(0, maxLen);
  // Allow letters, numbers, spaces, hyphens, apostrophes, periods, and commas
  try {
    const re = new RegExp("[^\\p{L}\\p{N}\\s\-\.'’,]", 'gu');
    return limited.replace(re, '');
  } catch {
    const re = /[^A-Za-z0-9\s\-\.',’]/g;
    return limited.replace(re, '');
  }
}

export function toFiniteNumber(
  value: unknown,
  fallback: number = 0,
  opts?: { min?: number; max?: number }
): number {
  const n = typeof value === 'number' ? value : Number(value);
  if (!Number.isFinite(n)) return fallback;
  if (opts?.min !== undefined && n < opts.min) return opts.min;
  if (opts?.max !== undefined && n > opts.max) return opts.max;
  return n;
}
