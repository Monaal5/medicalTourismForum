/**
 * Shared username generation utility
 * This ensures consistent username generation across the application
 */

/**
 * Generate a deterministic username from user data
 * This function always generates the same username for the same inputs
 *
 * @param fullName - User's full name
 * @param userId - User's unique ID (from Clerk)
 * @returns Deterministic username
 */
export function generateUsername(fullName: string, userId: string): string {
  // Create a hash from the userId for deterministic number generation
  const hash = userId.split('').reduce((a, b) => {
    a = ((a << 5) - a) + b.charCodeAt(0);
    return a & a;
  }, 0);

  // Generate a deterministic number between 1000-9999
  const deterministicNum = Math.abs(hash) % 9000 + 1000;

  // Convert name to camelCase and add the deterministic number
  const username = fullName
    .trim()
    .replace(/\s+(.)/g, (_, char) => char.toUpperCase()) // Convert spaces to camelCase
    .replace(/\s+/g, '') // Remove all remaining spaces
    + deterministicNum;

  return username;
}

/**
 * Parse and clean a username input
 * Removes special characters and ensures it meets requirements
 *
 * @param username - Raw username input
 * @returns Cleaned username
 */
export function parseUsername(username: string): string {
  return username
    .trim()
    .replace(/[^a-zA-Z0-9]/g, '') // Remove special characters
    .toLowerCase();
}

/**
 * Validate if a username meets the requirements
 *
 * @param username - Username to validate
 * @returns Object with isValid boolean and optional error message
 */
export function validateUsername(username: string): { isValid: boolean; error?: string } {
  if (!username) {
    return { isValid: false, error: 'Username is required' };
  }

  if (username.length < 3) {
    return { isValid: false, error: 'Username must be at least 3 characters long' };
  }

  if (username.length > 30) {
    return { isValid: false, error: 'Username must be less than 30 characters' };
  }

  if (!/^[a-zA-Z0-9_]+$/.test(username)) {
    return { isValid: false, error: 'Username can only contain letters, numbers, and underscores' };
  }

  return { isValid: true };
}

/**
 * Generate a display name from username
 * Converts camelCase usernames back to readable format
 *
 * @param username - Username to convert
 * @returns Human-readable display name
 */
export function getDisplayName(username: string): string {
  // Remove numbers from the end
  const nameWithoutNumbers = username.replace(/\d+$/, '');

  // Add spaces before capital letters (except the first one)
  return nameWithoutNumbers.replace(/([a-z])([A-Z])/g, '$1 $2');
}

/**
 * Check if username is available (placeholder for future implementation)
 * This would check against the database in a real implementation
 *
 * @param username - Username to check
 * @returns Promise<boolean> - true if available
 */
export async function isUsernameAvailable(username: string): Promise<boolean> {
  // This would implement actual database check
  // For now, return true as a placeholder
  return Promise.resolve(true);
}

/**
 * Generate username suggestions based on a base name
 *
 * @param baseName - Base name to generate suggestions from
 * @param count - Number of suggestions to generate (default: 5)
 * @returns Array of username suggestions
 */
export function generateUsernameSuggestions(baseName: string, count: number = 5): string[] {
  const suggestions: string[] = [];
  const cleanBase = baseName.replace(/[^a-zA-Z0-9]/g, '').toLowerCase();

  for (let i = 0; i < count; i++) {
    const randomNum = Math.floor(1000 + Math.random() * 9000);
    suggestions.push(`${cleanBase}${randomNum}`);
  }

  return suggestions;
}
