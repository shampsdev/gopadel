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

/**
 * Format tournament date and time range in the format: "05 июня (сб), 12:00 – 15:00"
 * @param startTime ISO date string for start time
 * @param endTime ISO date string for end time (optional)
 * @returns Formatted tournament date and time string
 */
export const formatTournamentDateTime = (
  startTime: string,
  endTime?: string
): string => {
  const startDate = addHours(new Date(startTime), 3)
  const dateWithDay = format(startDate, "dd MMMM (EEE)", { locale: ru })
  const startTimeFormatted = format(startDate, "HH:mm", { locale: ru })
  
  if (endTime) {
    const endDate = addHours(new Date(endTime), 3)
    const endTimeFormatted = format(endDate, "HH:mm", { locale: ru })
    return `${dateWithDay}, ${startTimeFormatted} – ${endTimeFormatted}`
  }
  
  return `${dateWithDay}, ${startTimeFormatted}`
}
