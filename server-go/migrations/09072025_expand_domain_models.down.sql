-- Откат расширения доменных моделей
-- Удаление триггеров
DROP TRIGGER IF EXISTS update_users_updated_at ON users;
DROP TRIGGER IF EXISTS update_courts_updated_at ON courts;
DROP TRIGGER IF EXISTS update_tournaments_updated_at ON tournaments;
DROP TRIGGER IF EXISTS update_registrations_updated_at ON registrations;
DROP TRIGGER IF EXISTS update_payments_updated_at ON payments;

-- Удаление функции обновления updated_at
DROP FUNCTION IF EXISTS update_updated_at_column();

-- Удаление столбцов created_at и updated_at из всех таблиц
ALTER TABLE users DROP COLUMN IF EXISTS created_at;
ALTER TABLE users DROP COLUMN IF EXISTS updated_at;

ALTER TABLE courts DROP COLUMN IF EXISTS created_at;
ALTER TABLE courts DROP COLUMN IF EXISTS updated_at;

ALTER TABLE tournaments DROP COLUMN IF EXISTS created_at;
ALTER TABLE tournaments DROP COLUMN IF EXISTS updated_at;

ALTER TABLE registrations DROP COLUMN IF EXISTS created_at;
ALTER TABLE registrations DROP COLUMN IF EXISTS updated_at;

ALTER TABLE payments DROP COLUMN IF EXISTS created_at;
ALTER TABLE payments DROP COLUMN IF EXISTS updated_at;

-- Drop data column for tournaments
ALTER TABLE tournaments DROP COLUMN IF EXISTS data;