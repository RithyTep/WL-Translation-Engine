/**
 * Key Transformation Utilities
 *
 * Provides functions to transform translation keys into readable text.
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
