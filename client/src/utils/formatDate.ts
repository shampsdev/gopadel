import { format, addHours } from "date-fns"
import { ru } from "date-fns/locale"

/**
 * Format a date string to Moscow time (UTC+3)
 * @param dateString ISO date string
 * @param formatString date-fns format string
 * @returns Formatted date string in Moscow timezone
 */
export const formatMoscowTime = (
  dateString: string,
  formatString: string = "dd MMMM HH:mm"
): string => {
  // Add 3 hours to convert to Moscow time (UTC+3)
  const moscowDate = addHours(new Date(dateString), 3)
  return format(moscowDate, formatString, { locale: ru })
}

/**
 * Format a date string to separate date and time parts
 * @param dateString ISO date string
 * @returns Object with formatted date and time strings
 */
export const formatDateAndTime = (dateString: string) => {
  return {
    date: formatMoscowTime(dateString, "dd MMMM"),
    time: formatMoscowTime(dateString, "HH:mm"),
  }
}
