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

// Функция для валидации даты рождения в формате дд.мм.гггг
export const validateBirthDate = (dateString: string): boolean => {
  // Строгая проверка формата
  const dateRegex = /^(\d{1,2})\.(\d{1,2})\.(\d{4})$/;
  const match = dateString.match(dateRegex);

  if (!match) return false;

  const day = parseInt(match[1]);
  const month = parseInt(match[2]);
  const year = parseInt(match[3]);

  // Проверяем, что все части даты заполнены
  if (!day || !month || !year) return false;

  // Проверяем корректность дня и месяца
  if (day < 1 || day > 31 || month < 1 || month > 12) return false;

  // Проверяем год (только 4 цифры для даты рождения)
  if (year < 1900 || year > new Date().getFullYear()) return false;

  // Проверяем существование даты
  const date = new Date(year, month - 1, day);
  return (
    date.getDate() === day &&
    date.getMonth() === month - 1 &&
    date.getFullYear() === year
  );
};

// Функция для форматирования ввода даты
export const formatDateInput = (value: string): string => {
  // Удаляем все символы кроме цифр
  const digits = value.replace(/\D/g, "").slice(0, 8);

  if (digits.length === 0) return "";

  // Простое форматирование по позициям
  let formatted = "";

  // День
  if (digits.length >= 1) formatted += digits[0];
  if (digits.length >= 2) formatted += digits[1];

  // Точка и месяц
  if (digits.length >= 3) formatted += "." + digits[2];
  if (digits.length >= 4) formatted += digits[3];

  // Точка и год
  if (digits.length >= 5) formatted += "." + digits[4];
  if (digits.length >= 6) formatted += digits[5];
  if (digits.length >= 7) formatted += digits[6];
  if (digits.length >= 8) formatted += digits[7];

  return formatted;
};

// Функция для преобразования даты в формате дд.мм.гг в ISO формат по МСК
export const parseDateToISO = (dateString: string): string | null => {
  if (!validateDateFormat(dateString)) return null;

  const [day, month, year] = dateString.split(".");
  const fullYear =
    parseInt(year) < 100 ? 2000 + parseInt(year) : parseInt(year);

  // Создаем дату в полночь по московскому времени (UTC+3)
  // Пользователь вводит дату в МСК, нужно конвертировать в UTC
  const moscowDate = new Date(
    Date.UTC(fullYear, parseInt(month) - 1, parseInt(day), 0, 0, 0, 0)
  );
  // Вычитаем 3 часа чтобы получить UTC
  moscowDate.setUTCHours(moscowDate.getUTCHours() - 3);

  // Преобразуем в ISO формат
  return moscowDate.toISOString();
};

// Функция для преобразования даты рождения в формате дд.мм.гггг в ISO формат
export const parseBirthDateToISO = (dateString: string): string | null => {
  if (!validateBirthDate(dateString)) return null;

  const [day, month, year] = dateString.split(".");

  // Для даты рождения создаем дату в полночь по UTC
  // Дата рождения - это просто дата, без привязки к часовому поясу
  const birthDate = new Date(
    Date.UTC(parseInt(year), parseInt(month) - 1, parseInt(day), 0, 0, 0, 0)
  );

  // Преобразуем в ISO формат
  return birthDate.toISOString();
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

// Функция для форматирования даты рождения из ISO в формат дд.мм.гггг
export const formatBirthDate = (isoDate: string): string => {
  try {
    const date = new Date(isoDate);
    const day = String(date.getDate()).padStart(2, "0");
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const year = String(date.getFullYear());
    return `${day}.${month}.${year}`;
  } catch (error) {
    console.error("Ошибка форматирования даты рождения:", error);
    return "";
  }
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

  // Убираем проверку, что конечное время больше начального
  // Теперь время конца может быть меньше времени начала (переход на следующий день)
  return true;
};

// Функция для форматирования ввода времени
export const formatTimeInput = (value: string): string => {
  // Удаляем все символы кроме цифр
  const digits = value.replace(/\D/g, "").slice(0, 8);

  if (digits.length === 0) return "";

  // Используем регулярные выражения для форматирования
  const match = digits.match(/^(\d{0,2})(\d{0,2})(\d{0,2})(\d{0,2})$/);

  if (!match) return "";

  const [, hours1, minutes1, hours2, minutes2] = match;

  let result = "";

  // Первая часть времени
  if (hours1) result += hours1;
  if (minutes1) {
    if (hours1.length === 2) result += ":" + minutes1;
    else result += minutes1;
  }

  // Вторая часть времени
  if (hours2 || minutes2) {
    if (result) result += "-";
    if (hours2) result += hours2;
    if (minutes2) {
      if (hours2 && hours2.length === 2) result += ":" + minutes2;
      else result += minutes2;
    }
  }

  return result;
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

  // Создаем даты в московском времени (UTC+3)
  // Пользователь вводит время в МСК, нужно конвертировать в UTC
  const moscowStartDate = new Date(
    Date.UTC(
      fullYear,
      parseInt(month) - 1,
      parseInt(day),
      startHour,
      startMinute,
      0,
      0
    )
  );
  // Вычитаем 3 часа чтобы получить UTC
  moscowStartDate.setUTCHours(moscowStartDate.getUTCHours() - 3);

  const moscowEndDate = new Date(
    Date.UTC(
      fullYear,
      parseInt(month) - 1,
      parseInt(day),
      endHour,
      endMinute,
      0,
      0
    )
  );
  // Вычитаем 3 часа чтобы получить UTC
  moscowEndDate.setUTCHours(moscowEndDate.getUTCHours() - 3);

  const startDate = moscowStartDate;
  let endDate = moscowEndDate;

  // Если время конца меньше времени начала, добавляем один день
  const startTimeInMinutes = startHour * 60 + startMinute;
  const endTimeInMinutes = endHour * 60 + endMinute;

  if (endTimeInMinutes <= startTimeInMinutes) {
    endDate.setUTCDate(endDate.getUTCDate() + 1);
  }

  return {
    // Возвращаем UTC время, которое соответствует московскому времени
    startTime: startDate.toISOString(),
    endTime: endDate.toISOString(),
  };
};
