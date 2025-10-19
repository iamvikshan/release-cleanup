/**
 * Validate that input is not empty
 */
export function validateRequired(
  input: string,
  fieldName = 'Field'
): boolean | string {
  return input.length > 0 || `${fieldName} is required`
}

/**
 * Validate token format (basic check for non-empty string)
 */
export function validateToken(input: string): boolean | string {
  return validateRequired(input, 'Token')
}

/**
 * Validate username/owner format
 */
export function validateUsername(input: string): boolean | string {
  return validateRequired(input, 'Username')
}

/**
 * Validate repository name
 */
export function validateRepo(input: string): boolean | string {
  return validateRequired(input, 'Repository')
}
