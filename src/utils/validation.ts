export function validateLocationName(raw: string): { ok: boolean; value?: string; error?: string } {
  const trimmed = (raw ?? '').trim();
  if (trimmed.length === 0) return { ok: false, error: 'Location cannot be empty.' };
  if (trimmed.length > 80) return { ok: false, error: 'Location is too long (max 80 characters).' };

  // Normalize whitespace to a single space
  const normalized = trimmed.replace(/\s+/g, ' ');

  // Allow letters, numbers, spaces, hyphens, apostrophes, periods, and commas.
  // Prefer Unicode property escapes when available to support accents and non-Latin scripts.
  try {
    const re = new RegExp("^[\\p{L}\\p{N}\\s\-\.'’,]+$", 'u');
    if (!re.test(normalized)) {
      return { ok: false, error: "Only letters, numbers, spaces, and - . , ' characters are allowed." };
    }
  } catch {
    // Fallback for environments without Unicode property escapes
    const re = /^[A-Za-z0-9\s\-\.',’]+$/;
    if (!re.test(normalized)) {
      return { ok: false, error: "Only letters, numbers, spaces, and - . , ' characters are allowed." };
    }
  }

  return { ok: true, value: normalized };
}
