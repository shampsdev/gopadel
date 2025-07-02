// Функция для валидации даты в формате дд.мм.гг
export const validateDateFormat = (dateString: string): boolean => {
  const dateRegex = /^(\d{1,2})\.(\d{1,2})\.(\d{2,4})$/;
  const match = dateString.match(dateRegex);

  if (!match) return false;

  const day = parseInt(match[1]);
  const month = parseInt(match[2]);
  const year = parseInt(match[3]);

  // Проверяем корректность дня и месяца
  if (day < 1 || day > 31 || month < 1 || month > 12) return false;

  // Проверяем год (допускаем 2-4 цифры)
  const fullYear = year < 100 ? 2000 + year : year;
  if (fullYear < 2020 || fullYear > 2030) return false;

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

  // Добавляем точки автоматически
  if (parts.length === 1 && parts[0].length > 2) {
    return parts[0].slice(0, 2) + "." + parts[0].slice(2);
  }
  if (parts.length === 2 && parts[1].length > 2) {
    return parts[0] + "." + parts[1].slice(0, 2) + "." + parts[1].slice(2);
  }

  return cleaned;
};

// Функция для преобразования даты в формате дд.мм.гг в ISO формат
export const parseDateToISO = (dateString: string): string | null => {
  if (!validateDateFormat(dateString)) return null;

  const [day, month, year] = dateString.split(".");
  const fullYear =
    parseInt(year) < 100 ? 2000 + parseInt(year) : parseInt(year);

  // Создаем дату в полночь по местному времени
  const date = new Date(fullYear, parseInt(month) - 1, parseInt(day));

  // Преобразуем в ISO формат
  return date.toISOString();
};

// Функция для получения текущей даты в формате дд.мм.гг
export const getCurrentDateFormatted = (): string => {
  const now = new Date();
  const day = String(now.getDate()).padStart(2, "0");
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const year = String(now.getFullYear()).slice(-2);
  return `${day}.${month}.${year}`;
};
