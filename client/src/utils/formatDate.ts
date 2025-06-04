import { format } from "date-fns"
import { ru } from "date-fns/locale"

/**
 * Format a date string (already in Moscow time)
 * @param dateString ISO date string (already in Moscow timezone)
 * @param formatString date-fns format string
 * @returns Formatted date string
 */
export const formatMoscowTime = (
  dateString: string,
  formatString: string = "dd MMMM HH:mm"
): string => {
  // Since the time is already stored in Moscow time, no timezone conversion needed
  const date = new Date(dateString)
  return format(date, formatString, { locale: ru })
}

/**
 * Format a date string to separate date and time parts
 * @param dateString ISO date string (already in Moscow timezone)
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
 * @param startTime ISO date string for start time (already in Moscow timezone)
 * @param endTime ISO date string for end time (optional, already in Moscow timezone)
 * @returns Formatted tournament date and time string
 */
export const formatTournamentDateTime = (
  startTime: string,
  endTime?: string
): string => {
  // Since the time is already stored in Moscow time, no timezone conversion needed
  const startDate = new Date(startTime)
  const dateWithDay = format(startDate, "dd MMMM (EEE)", { locale: ru })
  const startTimeFormatted = format(startDate, "HH:mm", { locale: ru })
  
  if (endTime) {
    const endDate = new Date(endTime)
    const endTimeFormatted = format(endDate, "HH:mm", { locale: ru })
    return `${dateWithDay}, ${startTimeFormatted} – ${endTimeFormatted}`
  }
  
  return `${dateWithDay}, ${startTimeFormatted}`
}
