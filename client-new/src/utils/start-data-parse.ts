export interface StartParamData {
  tournamentId?: string;
  clubId?: string;
}

/**
 * Парсит startParam от Telegram
 * @param startParam - строка параметров от Telegram
 * @returns объект с tournamentId или courtId
 */
export const parseStartParam = (startParam: string): StartParamData => {
  // Если строка начинается с tour-, то это турнир
  if (startParam.startsWith("tour-")) {
    return {
      tournamentId: startParam.substring(5), // Убираем префикс "tour-"
    };
  }

  // Иначе это ID клуба
  return {
    clubId: startParam,
  };
};

/**
 * Создает startParam строку для турнира
 * @param tournamentId - ID турнира
 * @returns строка параметров для Telegram
 */
export const createTournamentStartParam = (tournamentId: string): string => {
  return `tour-${tournamentId}`;
};

/**
 * Создает startParam строку для клуба
 * @param courtId - ID клуба
 * @returns строка параметров для Telegram
 */
export const createCourtStartParam = (courtId: string): string => {
  return courtId;
};

/**
 * Проверяет, является ли startParam турниром
 * @param startParam - строка параметров
 * @returns true, если это турнир
 */
export const isTournamentStartParam = (startParam: string): boolean => {
  return startParam.startsWith("tour-");
};
