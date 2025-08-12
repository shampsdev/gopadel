export interface StartParamData {
  tournamentId?: string;
  gameId?: string;
  trainingId?: string;
  clubId?: string;
}

/**
 * Парсит startParam от Telegram
 * @param startParam - строка параметров от Telegram
 * @returns объект с tournamentId или courtId
 */
export const parseStartParam = (startParam: string): StartParamData => {
  if (startParam.startsWith("tour-")) {
    return {
      tournamentId: startParam,
    };
  }

  if (startParam.startsWith("game-")) {
    return {
      gameId: startParam,
    };
  }

  if (startParam.startsWith("train-")) {
    return {
      trainingId: startParam,
    };
  }

  return {
    clubId: startParam,
  };
};
