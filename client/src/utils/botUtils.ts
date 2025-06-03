import { BOT_USERNAME } from "@/shared/constants"

/**
 * Создает ссылку на бота с параметром запуска
 * @param startParam - параметр запуска (например, "t-123")
 * @returns полная ссылка на бота
 */
export function createBotLink(startParam?: string): string {
  const baseUrl = `https://t.me/${BOT_USERNAME}/app`
  
  if (startParam) {
    return `${baseUrl}?startapp=${startParam}`
  }
  
  return baseUrl
} 