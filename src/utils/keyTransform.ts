/**
 * Key Transformation Utilities
 *
 * Provides functions to transform translation keys into readable text
 * and handle batch key processing.
 */

/**
 * Transforms an underscore-separated key into readable English text.
 *
 * @param key - The translation key (e.g., "total_commission_earned")
 * @returns Readable text with first letter capitalized (e.g., "Total commission earned")
 *
 * @example
 * keyToReadableText("total_commission_earned") // "Total commission earned"
 * keyToReadableText("commission") // "Commission"
 * keyToReadableText("USER_PROFILE") // "User profile"
 */
export function keyToReadableText(key: string): string {
  if (!key || typeof key !== 'string') {
    return '';
  }

  // Trim leading/trailing underscores
  const trimmed = key.replace(/^_+|_+$/g, '');

  if (trimmed.length === 0) {
    return '';
  }

  // Replace underscores with spaces
  const withSpaces = trimmed.replace(/_/g, ' ');

  // Convert to lowercase first
  const lowercased = withSpaces.toLowerCase();

  // Capitalize first character only
  return lowercased.charAt(0).toUpperCase() + lowercased.slice(1);
}

/**
 * Parse comma-separated keys into an array of trimmed, unique keys.
 *
 * @param input - Comma-separated keys string (e.g., "key1, key2, key3")
 * @returns Array of unique, trimmed keys
 *
 * @example
 * parseCommaSeparatedKeys("key1,key2,key3") // ["key1", "key2", "key3"]
 * parseCommaSeparatedKeys("key1, key2 , key3") // ["key1", "key2", "key3"]
 * parseCommaSeparatedKeys("single_key") // ["single_key"]
 */
export function parseCommaSeparatedKeys(input: string): string[] {
  if (!input || typeof input !== 'string') {
    return [];
  }

  const keys = input
    .split(',')
    .map(key => key.trim())
    .filter(key => key.length > 0);

  // Remove duplicates while preserving order
  return [...new Set(keys)];
}

/**
 * Check if a string contains comma-separated keys (more than one key).
 *
 * @param input - The input string to check
 * @returns True if input contains multiple comma-separated keys
 *
 * @example
 * isCommaSeparatedKeys("key1,key2,key3") // true
 * isCommaSeparatedKeys("single_key") // false
 * isCommaSeparatedKeys("key1,") // false (only one valid key)
 */
export function isCommaSeparatedKeys(input: string): boolean {
  return parseCommaSeparatedKeys(input).length > 1;
}
