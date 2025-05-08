/**
 * Formats a date string from Russian format (DD.MM.YYYY) to ISO format (YYYY-MM-DD)
 * for backend compatibility.
 *
 * @param dateString The date string in DD.MM.YYYY format
 * @returns The date in YYYY-MM-DD format or null if invalid
 */
export const formatDateForBackend = (dateString: string): string | null => {
  if (!dateString) return null

  const match = dateString.match(/^(\d{2})\.(\d{2})\.(\d{4})$/)
  if (!match) return null

  const [, day, month, year] = match
  return `${year}-${month}-${day}`
}

/**
 * Formats a date string from ISO format (YYYY-MM-DD) to Russian format (DD.MM.YYYY)
 * for display in the UI.
 *
 * @param dateString The date string in YYYY-MM-DD format
 * @returns The date in DD.MM.YYYY format or null if invalid
 */
export const formatDateForDisplay = (dateString: string): string | null => {
  if (!dateString) return null

  const match = dateString.match(/^(\d{4})-(\d{2})-(\d{2})$/)
  if (!match) return null

  const [, year, month, day] = match
  return `${day}.${month}.${year}`
}

/**
 * Validates a date string in DD.MM.YYYY format.
 *
 * @param dateString The date string to validate
 * @returns True if the date is valid, false otherwise
 */
export const isValidDateFormat = (dateString: string): boolean => {
  if (!dateString) return false

  const datePattern = /^(\d{2})\.(\d{2})\.(\d{4})$/
  if (!datePattern.test(dateString)) {
    return false
  }

  const [, day, month, year] = dateString.match(datePattern) || []
  const dayNum = parseInt(day, 10)
  const monthNum = parseInt(month, 10)
  const yearNum = parseInt(year, 10)

  // Basic date validation
  if (monthNum < 1 || monthNum > 12) return false
  if (dayNum < 1 || dayNum > 31) return false
  if (yearNum < 1900 || yearNum > 2100) return false

  // Check days in month
  const daysInMonth = new Date(yearNum, monthNum, 0).getDate()
  if (dayNum > daysInMonth) return false

  return true
}
