// Функция для валидации даты в формате дд.мм.гг
export const validateDateFormat = (dateString: string): boolean => {
  // Строгая проверка формата
  const dateRegex = /^(\d{1,2})\.(\d{1,2})\.(\d{2,4})$/;
  const match = dateString.match(dateRegex);

  if (!match) return false;

  const day = parseInt(match[1]);
  const month = parseInt(match[2]);
  const year = parseInt(match[3]);

  // Проверяем, что все части даты заполнены
  if (!day || !month || !year) return false;

  // Проверяем корректность дня и месяца
  if (day < 1 || day > 31 || month < 1 || month > 12) return false;

  // Проверяем год (допускаем 2-4 цифры)
  const fullYear = year < 100 ? 2000 + year : year;
  if (fullYear < 2020 || fullYear > 2050) return false;

  // Проверяем существование даты
  const date = new Date(fullYear, month - 1, day);
  return (
    date.getDate() === day &&
    date.getMonth() === month - 1 &&
    date.getFullYear() === fullYear
  );
};

// Функция для форматирования ввода даты
export const formatDateInput = (value: string): string => {
  // Удаляем все символы кроме цифр и точек
  const cleaned = value.replace(/[^\d.]/g, "");

  // Ограничиваем количество точек
  const parts = cleaned.split(".");
  if (parts.length > 3) return parts.slice(0, 3).join(".");

  // Ограничиваем длину каждой части
  const limitedParts = parts.map((part, index) => {
    if (index === 0) return part.slice(0, 2); // День - максимум 2 цифры
    if (index === 1) return part.slice(0, 2); // Месяц - максимум 2 цифры
    if (index === 2) return part.slice(0, 4); // Год - максимум 4 цифры
    return part;
  });

  // Добавляем точки автоматически только если нет точек
  if (parts.length === 1 && !cleaned.includes(".")) {
    const day = limitedParts[0].slice(0, 2);
    const month = limitedParts[0].slice(2, 4);
    const year = limitedParts[0].slice(4, 8);

    let result = day;
    if (month) result += "." + month;
    if (year) result += "." + year;

    return result;
  }

  return limitedParts.join(".");
};

// Функция для преобразования даты в формате дд.мм.гг в ISO формат по МСК
export const parseDateToISO = (dateString: string): string | null => {
  if (!validateDateFormat(dateString)) return null;

  const [day, month, year] = dateString.split(".");
  const fullYear =
    parseInt(year) < 100 ? 2000 + parseInt(year) : parseInt(year);

  // Создаем дату в полночь по московскому времени
  const date = new Date(fullYear, parseInt(month) - 1, parseInt(day));

  // Получаем смещение московского времени (UTC+3)
  const moscowOffset = 3 * 60; // 3 часа в минутах
  const localOffset = date.getTimezoneOffset(); // смещение локального времени в минутах

  // Корректируем время на разницу между локальным и московским
  const adjustedDate = new Date(
    date.getTime() + (localOffset + moscowOffset) * 60 * 1000
  );

  // Преобразуем в ISO формат
  return adjustedDate.toISOString();
};

// Функция для получения текущей даты в формате дд.мм.гг по МСК
export const getCurrentDateFormatted = (): string => {
  const now = new Date();

  // Получаем московское время (UTC+3)
  const moscowTime = new Date(now.getTime() + 3 * 60 * 60 * 1000);

  const day = String(moscowTime.getUTCDate()).padStart(2, "0");
  const month = String(moscowTime.getUTCMonth() + 1).padStart(2, "0");
  const year = String(moscowTime.getUTCFullYear()).slice(-2);
  return `${day}.${month}.${year}`;
};

// Функция для форматирования ISO даты в читаемый формат по МСК
export const formatISODateToMoscow = (isoDate: string): string => {
  const date = new Date(isoDate);

  // Получаем московское время (UTC+3)
  const moscowTime = new Date(date.getTime() + 3 * 60 * 60 * 1000);

  const day = String(moscowTime.getUTCDate()).padStart(2, "0");
  const month = String(moscowTime.getUTCMonth() + 1).padStart(2, "0");
  const year = String(moscowTime.getUTCFullYear()).slice(-2);
  const hours = String(moscowTime.getUTCHours()).padStart(2, "0");
  const minutes = String(moscowTime.getUTCMinutes()).padStart(2, "0");

  return `${day}.${month}.${year} ${hours}:${minutes}`;
};

// Функция для валидации времени в формате hh:mm-hh:mm
export const validateTimeFormat = (timeString: string): boolean => {
  // Строгая проверка формата
  const timeRegex = /^(\d{1,2}):(\d{2})-(\d{1,2}):(\d{2})$/;
  const match = timeString.match(timeRegex);

  if (!match) return false;

  const startHour = parseInt(match[1]);
  const startMinute = parseInt(match[2]);
  const endHour = parseInt(match[3]);
  const endMinute = parseInt(match[4]);

  // Проверяем, что все части времени заполнены
  if (
    startHour === undefined ||
    startMinute === undefined ||
    endHour === undefined ||
    endMinute === undefined
  )
    return false;

  // Проверяем корректность часов и минут
  if (startHour < 0 || startHour > 23 || endHour < 0 || endHour > 23)
    return false;
  if (startMinute < 0 || startMinute > 59 || endMinute < 0 || endMinute > 59)
    return false;

  // Проверяем, что конечное время больше начального
  const startTime = startHour * 60 + startMinute;
  const endTime = endHour * 60 + endMinute;

  return endTime > startTime;
};

// Функция для форматирования ввода времени
export const formatTimeInput = (value: string): string => {
  // Удаляем все символы кроме цифр, двоеточий и дефисов
  const cleaned = value.replace(/[^\d:-]/g, "");

  // Ограничиваем количество дефисов
  const parts = cleaned.split("-");
  if (parts.length > 2) return parts.slice(0, 2).join("-");

  // Форматируем каждую часть времени с ограничениями
  const formattedParts = parts.map((part, index) => {
    // Ограничиваем длину каждой части времени
    if (index === 0) {
      // Первая часть времени (начало)
      if (part.length > 5) part = part.slice(0, 5); // чч:мм - максимум 5 символов
    } else if (index === 1) {
      // Вторая часть времени (конец)
      if (part.length > 5) part = part.slice(0, 5); // чч:мм - максимум 5 символов
    }

    // Добавляем двоеточие после часов, если его нет
    if (part.length > 2 && !part.includes(":")) {
      const hours = part.slice(0, 2);
      const minutes = part.slice(2, 4);
      return hours + ":" + minutes;
    }

    // Ограничиваем часы и минуты
    if (part.includes(":")) {
      const [hours, minutes] = part.split(":");
      const limitedHours = hours.slice(0, 2);
      const limitedMinutes = minutes ? minutes.slice(0, 2) : "";
      return limitedHours + ":" + limitedMinutes;
    }

    return part;
  });

  return formattedParts.join("-");
};

// Функция для создания startTime и endTime из даты и времени по МСК
export const createStartAndEndTime = (
  dateString: string,
  timeString: string
): { startTime: string | null; endTime: string | null } => {
  if (!validateDateFormat(dateString) || !validateTimeFormat(timeString)) {
    return { startTime: null, endTime: null };
  }

  const [day, month, year] = dateString.split(".");
  const fullYear =
    parseInt(year) < 100 ? 2000 + parseInt(year) : parseInt(year);

  const [startTime, endTime] = timeString.split("-");
  const [startHour, startMinute] = startTime.split(":").map(Number);
  const [endHour, endMinute] = endTime.split(":").map(Number);

  // Создаем даты для начала и конца по московскому времени
  const startDate = new Date(
    fullYear,
    parseInt(month) - 1,
    parseInt(day),
    startHour,
    startMinute
  );
  const endDate = new Date(
    fullYear,
    parseInt(month) - 1,
    parseInt(day),
    endHour,
    endMinute
  );

  // Получаем смещение московского времени (UTC+3)
  const moscowOffset = 3 * 60; // 3 часа в минутах
  const localOffset = startDate.getTimezoneOffset(); // смещение локального времени в минутах

  // Корректируем время на разницу между локальным и московским
  const adjustedStartDate = new Date(
    startDate.getTime() + (localOffset + moscowOffset) * 60 * 1000
  );
  const adjustedEndDate = new Date(
    endDate.getTime() + (localOffset + moscowOffset) * 60 * 1000
  );

  return {
    startTime: adjustedStartDate.toISOString(),
    endTime: adjustedEndDate.toISOString(),
  };
};
