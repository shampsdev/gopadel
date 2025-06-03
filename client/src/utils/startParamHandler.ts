import { NavigateFunction } from "react-router-dom"

export interface StartParamHandler {
  prefix: string
  handler: (param: string, navigate: NavigateFunction, isAuthenticated: boolean) => void
}

const startParamHandlers: StartParamHandler[] = [
  {
    prefix: "t-",
    handler: (param: string, navigate: NavigateFunction, isAuthenticated: boolean) => {
      if (!isAuthenticated) {
        // Сохраняем startParam для последующего редиректа после регистрации
        sessionStorage.setItem('pendingStartParam', param)
        navigate("/register")
        return
      }
      
      const tournamentId = param.substring(2)
      navigate(`/tournament/${tournamentId}`)
    }
  },
]

/**
 * Обрабатывает startParam и выполняет соответствующую навигацию
 * @param startParam - параметр запуска из Telegram
 * @param navigate - функция навигации из react-router-dom
 * @param isAuthenticated - статус авторизации пользователя
 */
export function handleStartParam(
  startParam: string | null, 
  navigate: NavigateFunction, 
  isAuthenticated: boolean
): void {
  if (!startParam) return

  for (const handler of startParamHandlers) {
    if (startParam.startsWith(handler.prefix)) {
      handler.handler(startParam, navigate, isAuthenticated)
      return
    }
  }

  console.warn(`Unknown startParam format: ${startParam}`)
}

/**
 * Добавляет новый обработчик startParam
 * @param handler - новый обработчик
 */
export function addStartParamHandler(handler: StartParamHandler): void {
  startParamHandlers.push(handler)
}

/**
 * Обрабатывает отложенный startParam после успешной регистрации
 * @param navigate - функция навигации из react-router-dom
 */
export function handlePendingStartParam(navigate: NavigateFunction): void {
  const pendingStartParam = sessionStorage.getItem('pendingStartParam')
  if (pendingStartParam) {
    sessionStorage.removeItem('pendingStartParam')
    handleStartParam(pendingStartParam, navigate, true)
  }
} 