-- Конвертируем пустые строки в NULL для telegram_username
UPDATE users SET telegram_username = NULL WHERE telegram_username = '';

-- Добавляем UNIQUE constraint на telegram_username
-- NULL значения не конфликтуют, поэтому можно иметь много пользователей без username
ALTER TABLE users ADD CONSTRAINT users_telegram_username_unique UNIQUE (telegram_username);

