-- Удаляем UNIQUE constraint
ALTER TABLE users DROP CONSTRAINT IF EXISTS users_telegram_username_unique;

-- Конвертируем NULL обратно в пустые строки (если нужно откатить)
UPDATE users SET telegram_username = '' WHERE telegram_username IS NULL;

